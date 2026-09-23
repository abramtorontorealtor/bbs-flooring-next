// R7 remote-write-after-abort + R13 recovery (fix-3). Deferred fakes model Google
// COMMITTING a request after our local AbortSignal / deadline fired.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBookingLifecycle } from '../../lib/booking/lifecycle.js';
import { createCalendarSync, stableEventId } from '../../lib/booking/calendar-sync.js';
import { createFakeDb, createFakeGoogle, silentLogger } from './fakes.mjs';

const REQUEST = { customer_name: 'Karen', customer_email: 'k@example.com', preferred_date: '2026-10-05', preferred_time: '1:30 PM' };
const tick = () => new Promise((r) => setImmediate(r));
async function until(cond) { for (let i = 0; i < 2000 && !cond(); i++) await tick(); assert.ok(cond(), 'never reached'); }
function gate() { let release; const p = new Promise((r) => { release = r; }); return { p, release }; }

function setup({ syncMs = 40 } = {}) {
  const db = createFakeDb();
  const google = createFakeGoogle();
  let clock = Date.parse('2026-09-23T12:00:00Z');
  const svc = createBookingLifecycle({
    db, calendar: createCalendarSync(google.adapter), notify: null,
    now: () => new Date(clock), logger: silentLogger, timeouts: { syncMs, recordMs: 200 },
  });
  return { db, google, svc, advance: (ms) => { clock += ms; } };
}
const green = (s) => s === 'synced' || s === 'absent';

test('R7: restore PATCH committing AFTER the sync deadline aborted, racing a cancel → event stays cancelled, nothing green on uncertainty', async () => {
  const { db, google, svc } = setup();
  const L = 'legacyrst1';
  const b = db.seed({ ...REQUEST, status: 'confirmed', calendar_event_id: L, revision: 2 });
  google.events.set(L, { id: L, status: 'cancelled', etag: '"e1"' });
  const g = gate();
  // Only the RESTORE write is delayed in transit (works for old and new call orders).
  google.hooks.beforePatch = async (_id, { restore }) => { if (restore) await g.p; };
  const r = await svc.retrySync(b.id); // budget fires while the restore is in flight
  assert.equal(r.calendarSync.status, 'failed', 'uncertain restore is not synced');
  assert.equal(db.row(b.id).calendar_sync_status, 'failed', 'durable + actionable');

  const c = await svc.cancel(b.id, '', 'admin'); // 410 → tombstone write moves the etag
  assert.equal(c.calendarSync.status, 'absent');
  g.release(); // Google now processes the stale restore (If-Match old etag)
  for (let i = 0; i < 20; i++) await tick();
  assert.equal(google.events.get(L).status, 'cancelled', 'late restore refused (412)');
  assert.equal(google.liveEvents().length, 0);
});

test('R7: uncertain INSERT, cancel reserves the stable id → the late insert can NEVER commit (409), marker cleared by observation', async () => {
  const { db, google, svc } = setup();
  const g = gate();
  google.faults.insert.push(async () => { await g.p; return null; }); // create in transit
  const c1 = await svc.create(REQUEST);
  const id = c1.booking.id;
  const S = stableEventId(id);
  assert.equal(c1.calendarSync.status, 'failed');
  assert.ok(db.row(id).calendar_op_started_at, 'in-flight marker durable');

  const c = await svc.cancel(id, '', 'customer'); // DELETE S → 404 → reserve: insert+delete+fence
  assert.equal(c.calendarSync.status, 'absent', 'positive observation: we now own the id and it is deleted');
  assert.equal(db.row(id).calendar_op_started_at, null);
  assert.equal(google.events.get(S).status, 'cancelled');

  g.release(); // Google now processes the ORIGINAL uncertain insert
  for (let i = 0; i < 20; i++) await tick();
  assert.equal(google.events.get(S).status, 'cancelled', 'late insert refused: id already exists (409)');
  assert.equal(google.liveEvents().length, 0);
});

test('R7: uncertain INSERT that DID commit first → cancel finds (409) and deletes it', async () => {
  const { db, google, svc } = setup();
  google.faults.insert.push('timeoutAfterCreate'); // Google created it, we saw a timeout
  const c1 = await svc.create(REQUEST);
  const id = c1.booking.id;
  assert.equal(c1.calendarSync.status, 'failed');
  const c = await svc.cancel(id, '', 'customer');
  assert.equal(c.calendarSync.status, 'absent');
  assert.equal(google.liveEvents().length, 0);
});

test('R7: elapsed time alone never clears an unresolved create — reservation failing stays failed/actionable', async () => {
  const { db, google, svc, advance } = setup({ syncMs: 2000 });
  const b = db.seed({ ...REQUEST, status: 'cancelled', calendar_event_id: null, calendar_sync_status: 'failed',
    calendar_op_started_at: '2026-09-23T11:00:00.000Z' });
  advance(24 * 60 * 60 * 1000); // a day later
  google.faults.insert.push({ success: false, httpStatus: 503, error: 'Backend Error' }); // reservation ambiguous
  const r = await svc.retrySync(b.id);
  assert.equal(r.calendarSync.status, 'failed');
  assert.ok(db.row(b.id).calendar_op_started_at, 'marker kept');
  const r2 = await svc.retrySync(b.id); // provider answers now → resolved by observation
  assert.equal(r2.calendarSync.status, 'absent');
  assert.equal(db.row(b.id).calendar_op_started_at, null);
});

test('R7: GET without etag → no write at all (never an unconditional PATCH)', async () => {
  const { db, google, svc } = setup({ syncMs: 2000 });
  const L = 'legacynoetag';
  const b = db.seed({ ...REQUEST, status: 'confirmed', calendar_event_id: L });
  google.events.set(L, { id: L, status: 'cancelled' });
  google.faults.get.push({ success: true, httpStatus: 200, event: { id: L, status: 'cancelled' } }); // no etag
  const r = await svc.retrySync(b.id);
  assert.equal(r.calendarSync.status, 'failed');
  assert.match(r.calendarSync.error, /no etag/);
  assert.equal(google.log.filter((l) => l[0] === 'patch').length, 0);
  assert.equal(google.events.get(L).status, 'cancelled');
  google.faults.get.push({ success: true, httpStatus: 200, event: { id: L, status: 'confirmed' } }); // live, no etag
  assert.equal((await svc.retrySync(b.id)).calendarSync.status, 'failed');
  assert.equal(google.log.filter((l) => l[0] === 'patch').length, 0);
});

test('R7: tombstone on an ALREADY-cancelled event carries a fresh fence → etag moves → in-flight restore gets 412', async () => {
  const { db, google, svc } = setup();
  const L = 'legacyfence1';
  const b = db.seed({ ...REQUEST, status: 'confirmed', calendar_event_id: L, revision: 2 });
  google.events.set(L, { id: L, status: 'cancelled', etag: '"e1"', private: { other: 'keep' } });
  const g = gate();
  google.hooks.beforePatch = async (_id, { restore }) => { if (restore) await g.p; };
  await svc.retrySync(b.id); // restore (If-Match "e1") in transit, budget fires
  await svc.cancel(b.id, '', 'admin'); // DELETE → 410; fenced tombstone changes the resource
  const ev = google.events.get(L);
  assert.notEqual(ev.etag, '"e1"', 'etag moved although status was already cancelled');
  assert.equal(ev.private.other, 'keep', 'unrelated private property preserved');
  assert.ok(ev.private.bbs_fence);
  g.release();
  for (let i = 0; i < 20; i++) await tick();
  assert.equal(google.events.get(L).status, 'cancelled');
});

test('R13: sync that keeps conflicting records a durable failure and promises no automatic sync', async () => {
  const { db, google, svc } = setup({ syncMs: 2000 });
  const b = db.seed({ ...REQUEST, status: 'confirmed', calendar_event_id: null });
  // Every successful sync-state write is beaten by another writer → all passes conflict.
  db.hooks.beforeUpdate = (id, patch) => { if (patch.calendar_sync_status === 'synced') db.external(id, { notes: 'x' }); };
  const r = await svc.retrySync(b.id);
  assert.equal(r.calendarSync.status, 'failed');
  assert.doesNotMatch(r.calendarSync.error, /will sync/);
  assert.match(r.calendarSync.error, /retry/i);
  assert.equal(db.row(b.id).calendar_sync_status, 'failed');
});
