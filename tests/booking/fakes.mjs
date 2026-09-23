// In-memory fakes for lifecycle tests. No network, no Supabase, no Google.
import { randomUUID } from 'node:crypto';
import { createOwnership } from '../../lib/booking/ownership.js';
import { slotInterval, dayInterval, isIsoDate, addDaysIso } from '../../lib/booking/schedule-policy.js';

/**
 * In-memory mirror of migrations/20260924_booking_reservations.up.sql (B2). Serialised by a
 * promise mutex (≈ the advisory lock). This is a LOGIC model for lifecycle tests, NOT proof of
 * Postgres transaction/lock behaviour (see phaseB-B2-local-sql-check.mjs + release checklist).
 */
function fakeRowInterval(date, time, durationMinutes) {
  if (!isIsoDate(date)) return null;
  const pol = { timeZone: 'America/Toronto', durationMinutes };
  const iv = time ? slotInterval(date, time, pol) : null;
  return iv || dayInterval(date, pol);
}

// Fix R15: lifecycles built in tests sign/verify ownership with this test-only secret
// (createOwnership() reads the env at construction). Seeded rows are trusted by default
// (proof added) unless the seed passes ownership_proof explicitly.
export const TEST_OWNERSHIP_SECRET = 'test-only-ownership-secret-0123456789abcdef';
if (!process.env.BOOKING_OWNERSHIP_SECRET) process.env.BOOKING_OWNERSHIP_SECRET = TEST_OWNERSHIP_SECRET;
export const testOwnership = createOwnership({ secret: TEST_OWNERSHIP_SECRET });

/** Fake `db` honouring the lifecycle contract, incl. revision-conditional updates. */
export function createFakeDb({ failInsert = false, rows = new Map() } = {}) {
  const calls = { insert: 0, update: 0, get: 0 };
  const hooks = { beforeUpdate: null, failUpdate: null, beforeReserve: null }; // simulate concurrent writers / DB faults
  const idem = new Map();
  let lock = Promise.resolve();
  const locked = (fn) => { const run = lock.then(fn, fn); lock = run.catch(() => {}); return run; };
  function problem(slot, exclude) {
    const pad = (slot.padMinutes || 0) * 60000;
    const ws = Date.parse(slot.start) - pad; const we = Date.parse(slot.end) + pad;
    const near = [addDaysIso(slot.localDate, -1), slot.localDate, addDaysIso(slot.localDate, 1)];
    let count = 0;
    for (const r of rows.values()) {
      if (!['pending', 'confirmed'].includes(r.status) || r.id === exclude || !near.includes(r.preferred_date)) continue;
      const iv = fakeRowInterval(r.preferred_date, r.preferred_time, slot.durationMinutes);
      if (iv && iv.start < we && ws < iv.end) return 'overlap';
      if (r.preferred_date === slot.localDate) count++;
    }
    return slot.dailyCap != null && count >= slot.dailyCap ? 'cap_reached' : null;
  }
  return {
    rows, calls, hooks, idem,
    failInsert,
    failReserve: false,
    reserveCalls: 0,
    now: () => Date.now(),
    /** Mirrors booking_find_replay (read-only). */
    async findReplay(row, keyHash = null) {
      this.findCalls = (this.findCalls || 0) + 1;
      if (this.failReserve) return { error: { message: 'rpc failed' } };
      const hit = this.replayOf(row, keyHash);
      return hit ? { outcome: 'replay', booking: { ...hit } } : { outcome: 'none' };
    },
    /** Fresh (24 h) non-cancelled key, else same contact+date+time within 24 h (not cancelled). */
    replayOf(row, keyHash) {
      const since = this.now() - 24 * 3600e3;
      if (keyHash && idem.has(keyHash)) {
        const k = idem.get(keyHash);
        const b = rows.get(k.id);
        if (k.at >= since && b && b.status !== 'cancelled') return b;
      }
      const email = String(row.customer_email || '').trim().toLowerCase();
      const phone = String(row.customer_phone || '').replace(/\D/g, '');
      return [...rows.values()].find((b) => b.preferred_date === row.preferred_date
        && (b.preferred_time || '') === (row.preferred_time || '') && b.status !== 'cancelled'
        && Date.parse(b.created_at || 0) >= since
        && ((email && String(b.customer_email || '').trim().toLowerCase() === email)
          || (phone.length >= 7 && String(b.customer_phone || '').replace(/\D/g, '') === phone))) || null;
    },
    async reserveCreate(row, slot, keyHash = null) {
      this.reserveCalls++;
      if (hooks.beforeReserve) await hooks.beforeReserve('create', row);
      if (this.failReserve || this.failInsert) return { error: { message: 'rpc failed: connection reset' } };
      return locked(async () => {
        const dup = this.replayOf(row, keyHash);
        if (dup) {
          if (keyHash && !(idem.has(keyHash) && idem.get(keyHash).id === dup.id)) idem.set(keyHash, { id: dup.id, at: this.now() });
          return { outcome: 'replay', booking: { ...dup } };
        }
        if (keyHash) idem.delete(keyHash); // stale / cancelled key released
        if (slot) { const p = problem(slot, null); if (p) return { outcome: 'conflict', reason: p }; }
        calls.insert++;
        const r = { ...row, id: row.id || randomUUID(), created_at: new Date(this.now()).toISOString() };
        rows.set(r.id, r);
        if (keyHash) idem.set(keyHash, { id: r.id, at: this.now() });
        return { outcome: 'created', booking: { ...r } };
      });
    },
    async reserveReschedule(id, expectedRevision, patch, slot) {
      this.reserveCalls++;
      if (hooks.beforeReserve) await hooks.beforeReserve('reschedule', patch);
      if (this.failReserve) return { error: { message: 'rpc failed: connection reset' } };
      return locked(async () => {
        const cur = rows.get(id);
        if (!cur) return { outcome: 'not_found' };
        if ((cur.revision || 0) !== (Number(expectedRevision) || 0)) return { outcome: 'stale', booking: { ...cur } };
        if (!['pending', 'confirmed'].includes(cur.status)) return { outcome: 'invalid_state', booking: { ...cur } };
        if (slot) { const p = problem(slot, id); if (p) return { outcome: 'conflict', reason: p }; }
        calls.update++;
        const next = { ...cur, ...patch };
        rows.set(id, next);
        return { outcome: 'updated', booking: { ...next } };
      });
    },
    seed(row) {
      const r = { id: randomUUID(), status: 'pending', revision: 1, calendar_event_id: null, ...row };
      if (!('ownership_proof' in row)) r.ownership_proof = testOwnership.signRow(r.id);
      if (!('calendar_event_proof' in row) && r.calendar_event_id) r.calendar_event_proof = testOwnership.signEvent(r.id, r.calendar_event_id);
      rows.set(r.id, { ...r });
      return { ...r };
    },
    row(id) { return rows.get(id) ? { ...rows.get(id) } : null; },
    /** Out-of-band write (another request) bumping revision. */
    external(id, patch) {
      const cur = rows.get(id);
      rows.set(id, { ...cur, ...patch, revision: (cur.revision || 0) + 1 });
    },
    async insert(row) {
      calls.insert++;
      if (this.failInsert) return { data: null, error: { message: 'insert failed: connection reset' } };
      const r = { ...row, id: row.id || randomUUID(), created_at: new Date().toISOString() };
      rows.set(r.id, r);
      return { data: { ...r }, error: null };
    },
    async get(id) {
      calls.get++;
      const r = rows.get(id);
      return { data: r ? { ...r } : null, error: null };
    },
    async update(id, patch, { expected, opMarker } = {}) {
      calls.update++;
      if (hooks.beforeUpdate) await hooks.beforeUpdate(id, patch);
      if (hooks.failUpdate && hooks.failUpdate(id, patch)) return { data: null, error: { message: 'db down' }, conflict: false };
      const cur = rows.get(id);
      if (!cur) return { data: null, error: { message: 'not found' }, conflict: false };
      if (expected && (cur.revision || 0) !== (expected.revision || 0)) {
        return { data: null, error: null, conflict: true };
      }
      if (opMarker !== undefined && (cur.calendar_op_started_at ?? null) !== opMarker) {
        return { data: null, error: null, conflict: true };
      }

      const next = { ...cur, ...patch };
      rows.set(id, next);
      return { data: { ...next }, error: null, conflict: false };
    },
  };
}

function summaryFor(b) {
  const prefix = b.status === 'pending' ? '⏳ PENDING — ' : b.status === 'cancelled' ? '❌ CANCELLED — ' : '';
  return `${prefix}📐 Free Measurement — ${b.customer_name || 'Customer'}`;
}

/**
 * Fake Google Calendar adapter (same shape as googleCalendarAdapter).
 * Mirrors Google semantics: deleted events linger as status:'cancelled',
 * inserting an existing id → 409, deleting a cancelled event → 410, unknown → 404.
 * `faults[op]` = array of queued faults consumed per call:
 *   'throw' | { success:false, httpStatus, error } | 'timeoutAfterCreate' | (fn)
 */
export function createFakeGoogle() {
  const events = new Map();
  const log = [];
  const faults = { insert: [], get: [], patch: [], delete: [], tombstone: [] };
  const hooks = { afterPatch: null, afterInsert: null, beforePatch: null };
  let autoId = 0;
  let etagSeq = 0;

  async function takeFault(op, ...args) {
    const f = faults[op].shift();
    if (!f) return null;
    if (f === 'throw') throw new Error('socket hang up (Bearer ya29.SECRET)');
    if (typeof f === 'function') return f(...args);
    return f;
  }

  return {
    events, log, faults, hooks,
    liveEvents() { return [...events.values()].filter((e) => e.status !== 'cancelled'); },
    adapter: {
      async insert(eventId, booking) {
        log.push(['insert', eventId]);
        const f = await takeFault('insert', eventId, booking);
        const id = eventId || `legacy${++autoId}`;
        if (f === 'timeoutAfterCreate') {
          events.set(id, { id, status: 'confirmed', summary: summaryFor(booking), date: booking.preferred_date, time: booking.preferred_time });
          throw new Error('The operation was aborted due to timeout');
        }
        if (f) return f;
        if (events.has(id)) return { success: false, httpStatus: 409, error: '{"error":{"code":409,"message":"The requested identifier already exists."}}' };
        events.set(id, { id, status: 'confirmed', etag: `"${++etagSeq}"`, summary: summaryFor(booking), date: booking.preferred_date, time: booking.preferred_time, attendees: undefined });
        if (hooks.afterInsert) await hooks.afterInsert(id);
        return { success: true, httpStatus: 200, eventId: id };
      },
      async get(eventId) {
        log.push(['get', eventId]);
        const f = await takeFault('get', eventId);
        if (f) return f;
        const e = events.get(eventId);
        if (e && !e.etag) e.etag = `"${++etagSeq}"`;
        return e ? { success: true, httpStatus: 200, event: { ...e } } : { success: false, httpStatus: 404, error: 'Not Found' };
      },
      // NOTE: faults run BEFORE the write is applied, and the write ignores the caller's
      // AbortSignal. A gated fault therefore models a request Google commits AFTER the
      // local abort/timeout (the remote-write-after-abort case).
      async patch(eventId, booking, { restore = false, ifMatch = null } = {}) {
        log.push(['patch', eventId, ...(restore ? ['restore'] : [])]);
        const f = await takeFault('patch', eventId, booking);
        if (f) return f;
        // Awaited before the write is applied; ignores AbortSignal → models a request that
        // Google commits after the caller gave up.
        if (hooks.beforePatch) await hooks.beforePatch(eventId, { restore, ifMatch });
        const e = events.get(eventId);
        if (!e) return { success: false, httpStatus: 404, error: 'Not Found' };
        if (ifMatch && e.etag && ifMatch !== e.etag) {
          return { success: false, httpStatus: 412, error: 'Precondition Failed' };
        }
        e.etag = `"${++etagSeq}"`;
        Object.assign(e, { summary: summaryFor(booking), date: booking.preferred_date, time: booking.preferred_time });
        if (restore) e.status = 'confirmed';
        if (hooks.afterPatch) await hooks.afterPatch(eventId);
        // Like Google: PATCH answers with the event, incl. status 'cancelled' when a
        // plain (non-restore) PATCH touched a deleted event.
        return { success: true, httpStatus: 200, eventId, event: { ...e } };
      },
      // Realistic etag model: the etag changes only when the resource actually changes.
      // A same-value PATCH (status already 'cancelled', no new fence) leaves it unchanged.
      async tombstone(eventId, { fence = null } = {}) {
        log.push(['tombstone', eventId]);
        const f = await takeFault('tombstone', eventId);
        if (f) return f;
        const e = events.get(eventId);
        if (!e) return { success: false, httpStatus: 404, error: 'Not Found' };
        const before = JSON.stringify([e.status, e.private]);
        e.status = 'cancelled';
        if (fence) e.private = { ...(e.private || {}), bbs_fence: fence };
        if (JSON.stringify([e.status, e.private]) !== before) e.etag = `"${++etagSeq}"`;
        return { success: true, httpStatus: 200, eventId, event: { ...e } };
      },
      async delete(eventId) {
        log.push(['delete', eventId]);
        const f = await takeFault('delete', eventId);
        if (f) return f;
        const e = events.get(eventId);
        if (!e) return { success: false, httpStatus: 404, error: 'Not Found' };
        if (e.status === 'cancelled') return { success: false, httpStatus: 410, error: 'Resource has been deleted' };
        e.status = 'cancelled';
        e.etag = `"${++etagSeq}"`; // assumption (sandbox-verify): deleting changes the etag
        return { success: true, httpStatus: 204 };
      },
    },
  };
}

/** Records notifications; can be told to throw. */
export function createFakeNotify({ throws = false } = {}) {
  const sent = [];
  const fn = async (type, payload) => {
    sent.push({ type, status: payload.booking.status, actor: payload.actor, payload });
    if (throws) throw new Error('Brevo down');
  };
  fn.sent = sent;
  return fn;
}

export const silentLogger = { error() {}, warn() {}, log() {} };
