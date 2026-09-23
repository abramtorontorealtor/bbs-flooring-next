// Supabase store adapter (A4): legacy (updated_at CAS) vs full (revision CAS)
// modes, auto feature-detection, BOOKING_STORE_MODE env flag. Fake PostgREST
// query builder — no network.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createSupabaseBookingStore, resolveStoreMode, isMissingColumn, SYNC_COLUMNS,
} from '../../lib/booking/supabase-store.js';
import { createBookingLifecycle } from '../../lib/booking/lifecycle.js';
import { createCalendarSync } from '../../lib/booking/calendar-sync.js';
import { createFakeGoogle, silentLogger } from './fakes.mjs';

const BASE_COLS = ['id', 'customer_name', 'customer_email', 'customer_phone', 'status', 'notes',
  'preferred_date', 'preferred_time', 'created_at', 'updated_at', 'lookup_token',
  'calendar_event_id', 'next_follow_up_date', 'visitor_id'];

/**
 * Minimal PostgREST fake. `migrated:false` = live schema today (no sync cols):
 * writing one → { code:'PGRST204' }. Supports the builder calls the adapter uses.
 */
function fakeSupabase({ migrated }) {
  const cols = new Set(migrated ? [...BASE_COLS, ...SYNC_COLUMNS] : BASE_COLS);
  const rows = new Map();
  const log = [];
  let n = 0;
  const missing = (obj) => Object.keys(obj).find((k) => !cols.has(k));
  const defaults = () => (migrated ? { revision: 0, calendar_sync_status: 'unknown' } : {});

  function builder(table) {
    const st = { op: 'select', body: null, filters: [] };
    const b = {
      insert(body) { st.op = 'insert'; st.body = body; return b; },
      update(body) { st.op = 'update'; st.body = body; return b; },
      select() { return b; },
      eq(c, v) { st.filters.push((r) => r[c] === v); st.f = [...(st.f || []), `eq:${c}`]; return b; },
      is(c, v) { st.filters.push((r) => (r[c] ?? null) === v); st.f = [...(st.f || []), `is:${c}`]; return b; },
      or(expr) {
        assert.equal(expr, 'revision.is.null,revision.eq.0');
        st.filters.push((r) => r.revision == null || r.revision === 0);
        st.f = [...(st.f || []), 'or:revision'];
        return b;
      },
      async single() { return run(); },
      async maybeSingle() { return run(); },
    };
    function run() {
      log.push({ table, op: st.op, body: st.body, filters: st.f || [] });
      if (st.op === 'insert') {
        const bad = missing(st.body);
        if (bad) return { data: null, error: { code: 'PGRST204', message: `Could not find the '${bad}' column of 'bookings' in the schema cache` } };
        const r = { ...defaults(), ...st.body, id: `id-${++n}`, updated_at: '2026-09-23T00:00:00.000001+00:00' };
        rows.set(r.id, r);
        return { data: { ...r }, error: null };
      }
      const match = [...rows.values()].filter((r) => st.filters.every((f) => f(r)));
      if (st.op === 'update') {
        const bad = missing(st.body);
        if (bad) return { data: null, error: { code: 'PGRST204', message: `Could not find the '${bad}' column` } };
        if (!match[0]) return { data: null, error: null };
        Object.assign(match[0], st.body);
        return { data: { ...match[0] }, error: null };
      }
      return { data: match[0] ? { ...match[0] } : null, error: null };
    }
    return b;
  }
  return { rows, log, from: (t) => builder(t) };
}

test('resolveStoreMode: env flag, default auto, junk → auto', () => {
  assert.equal(resolveStoreMode({}), 'auto');
  assert.equal(resolveStoreMode({ BOOKING_STORE_MODE: 'FULL' }), 'full');
  assert.equal(resolveStoreMode({ BOOKING_STORE_MODE: ' legacy ' }), 'legacy');
  assert.equal(resolveStoreMode({ BOOKING_STORE_MODE: 'yolo' }), 'auto');
  assert.equal(isMissingColumn({ code: '42703' }), true);
  assert.equal(isMissingColumn({ code: '23505', message: 'duplicate key' }), false);
});

test('env BOOKING_STORE_MODE is honoured when opts.mode is absent; opts.mode wins', () => {
  const prev = process.env.BOOKING_STORE_MODE;
  try {
    process.env.BOOKING_STORE_MODE = 'legacy';
    assert.equal(createSupabaseBookingStore(fakeSupabase({ migrated: true }), { logger: silentLogger }).mode, 'legacy');
    assert.equal(createSupabaseBookingStore(fakeSupabase({ migrated: true }), { mode: 'full' }).mode, 'full');
    delete process.env.BOOKING_STORE_MODE;
    assert.equal(createSupabaseBookingStore(fakeSupabase({ migrated: true })).mode, 'auto');
  } finally {
    if (prev === undefined) delete process.env.BOOKING_STORE_MODE; else process.env.BOOKING_STORE_MODE = prev;
  }
});

test('auto on PRE-migration schema: insert falls back once, strips sync cols, CAS on updated_at', async () => {
  const sb = fakeSupabase({ migrated: false });
  const store = createSupabaseBookingStore(sb, { mode: 'auto', logger: silentLogger });
  const ins = await store.insert({ customer_email: 'a@example.com', status: 'pending', revision: 1, calendar_sync_status: 'pending' });
  assert.equal(ins.error, null);
  assert.equal(store.isLegacy, true);
  assert.equal(sb.log.length, 2, 'one probe + one legacy retry');
  assert.ok(!('revision' in sb.log[1].body));

  const row = ins.data;
  const up = await store.update(row.id, { status: 'confirmed', revision: 2, updated_at: 'T2' }, { expected: row });
  assert.equal(up.conflict, false);
  assert.equal(up.data.status, 'confirmed');
  assert.deepEqual(sb.log.at(-1).filters, ['eq:id', 'eq:updated_at']);
  // stale expected.updated_at → conflict
  const stale = await store.update(row.id, { status: 'cancelled', updated_at: 'T3' }, { expected: row });
  assert.equal(stale.conflict, true);
  // sync-only patch has nothing persistable → reported applied, no DB call
  const before = sb.log.length;
  const s = await store.update(row.id, { calendar_sync_status: 'synced' }, { expected: { ...row, updated_at: 'T2' } });
  assert.equal(s.error, null);
  assert.equal(sb.log.length, before);
});

test('auto on POST-migration schema: full rows persisted, CAS on revision (+updated_at), no fallback', async () => {
  const sb = fakeSupabase({ migrated: true });
  const store = createSupabaseBookingStore(sb, { mode: 'auto', logger: silentLogger });
  const ins = await store.insert({ customer_email: 'a@example.com', status: 'pending', revision: 1, calendar_sync_status: 'pending' });
  assert.equal(store.isLegacy, false);
  assert.equal(sb.log.length, 1);
  assert.equal(ins.data.revision, 1);

  const row = ins.data;
  const up = await store.update(row.id, { status: 'confirmed', revision: 2, updated_at: 'T2', calendar_sync_status: 'pending' }, { expected: row });
  assert.equal(up.data.revision, 2);
  assert.deepEqual(sb.log.at(-1).filters, ['eq:id', 'eq:revision', 'eq:updated_at']);
  // revision moved underneath us → conflict
  const stale = await store.update(row.id, { status: 'cancelled', revision: 2 }, { expected: row });
  assert.equal(stale.conflict, true);
  // sync-state write persisted in full mode
  const s = await store.update(row.id, { calendar_sync_status: 'failed', calendar_sync_error: 'x' }, { expected: up.data });
  assert.equal(sb.rows.get(row.id).calendar_sync_status, 'failed');
  assert.equal(s.conflict, false);
});

test('full mode: pre-migration row (revision 0 default) matched via revision.is.null|eq.0', async () => {
  const sb = fakeSupabase({ migrated: true });
  sb.rows.set('old', { id: 'old', status: 'pending', revision: 0, calendar_sync_status: 'unknown', updated_at: 'U0' });
  const store = createSupabaseBookingStore(sb, { mode: 'full' });
  const up = await store.update('old', { status: 'confirmed', revision: 1, updated_at: 'U1' }, { expected: sb.rows.get('old') && { ...sb.rows.get('old') } });
  assert.equal(up.conflict, false);
  assert.deepEqual(sb.log.at(-1).filters, ['eq:id', 'or:revision', 'eq:updated_at']);
});

test('full mode: an old legacy-mode instance bumping only updated_at is still detected as a conflict', async () => {
  const sb = fakeSupabase({ migrated: true });
  sb.rows.set('b', { id: 'b', status: 'pending', revision: 3, updated_at: 'U3' });
  const store = createSupabaseBookingStore(sb, { mode: 'full' });
  const snapshot = { ...sb.rows.get('b') };
  sb.rows.get('b').updated_at = 'U3-legacy-writer'; // revision unchanged
  const r = await store.update('b', { status: 'cancelled', revision: 4 }, { expected: snapshot });
  assert.equal(r.conflict, true);
});

test('full mode never falls back: missing column surfaces as an error', async () => {
  const sb = fakeSupabase({ migrated: false });
  const store = createSupabaseBookingStore(sb, { mode: 'full' });
  const ins = await store.insert({ customer_email: 'a@example.com', revision: 1 });
  assert.equal(ins.data, null);
  assert.equal(ins.error.code, 'PGRST204');
  assert.equal(store.isLegacy, false);
  assert.equal(sb.log.length, 1);
});

test('legacy mode never sends sync columns even when they exist', async () => {
  const sb = fakeSupabase({ migrated: true });
  const store = createSupabaseBookingStore(sb, { mode: 'legacy' });
  await store.insert({ customer_email: 'a@example.com', revision: 1, calendar_sync_status: 'pending' });
  assert.ok(SYNC_COLUMNS.every((c) => !(c in sb.log[0].body)));
});

for (const migrated of [false, true]) {
  test(`lifecycle end-to-end over the real adapter (${migrated ? 'migrated' : 'pre-migration'} schema, auto)`, async () => {
    const sb = fakeSupabase({ migrated });
    const google = createFakeGoogle();
    const lc = createBookingLifecycle({
      db: createSupabaseBookingStore(sb, { mode: 'auto', logger: silentLogger }),
      calendar: createCalendarSync(google.adapter), notify: null,
      now: () => new Date('2026-09-23T12:00:00Z'), logger: silentLogger,
    });
    const c = await lc.create({ customer_email: 'k@example.com', customer_name: 'K', preferred_date: '2026-10-05', preferred_time: '1:30 PM' });
    assert.equal(c.success, true);
    assert.equal(c.calendarSync.status, 'synced');
    const r = await lc.reschedule(c.booking.id, { date: '2026-10-07', time: '11:00 AM' }, 'customer');
    assert.equal(r.success, true);
    assert.equal(google.liveEvents().length, 1);
    const stored = sb.rows.get(c.booking.id);
    assert.equal(stored.preferred_date, '2026-10-07');
    if (migrated) {
      assert.equal(stored.revision, 2);
      assert.equal(stored.calendar_sync_status, 'synced');
    } else {
      assert.ok(!('revision' in stored));
    }
  });
}
