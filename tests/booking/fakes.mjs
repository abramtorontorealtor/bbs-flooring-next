// In-memory fakes for lifecycle tests. No network, no Supabase, no Google.
import { randomUUID } from 'node:crypto';

/** Fake `db` honouring the lifecycle contract, incl. revision-conditional updates. */
export function createFakeDb({ failInsert = false } = {}) {
  const rows = new Map();
  const calls = { insert: 0, update: 0, get: 0 };
  const hooks = { beforeUpdate: null }; // (id, patch) => void — simulate concurrent writers
  return {
    rows, calls, hooks,
    failInsert,
    seed(row) {
      const r = { id: randomUUID(), status: 'pending', revision: 1, calendar_event_id: null, ...row };
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
      const r = { ...row, id: randomUUID(), created_at: new Date().toISOString() };
      rows.set(r.id, r);
      return { data: { ...r }, error: null };
    },
    async get(id) {
      calls.get++;
      const r = rows.get(id);
      return { data: r ? { ...r } : null, error: null };
    },
    async update(id, patch, { expected } = {}) {
      calls.update++;
      if (hooks.beforeUpdate) await hooks.beforeUpdate(id, patch);
      const cur = rows.get(id);
      if (!cur) return { data: null, error: { message: 'not found' }, conflict: false };
      if (expected && (cur.revision || 0) !== (expected.revision || 0)) {
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
  const faults = { insert: [], get: [], patch: [], delete: [] };
  const hooks = { afterPatch: null, afterInsert: null };
  let autoId = 0;

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
        events.set(id, { id, status: 'confirmed', summary: summaryFor(booking), date: booking.preferred_date, time: booking.preferred_time, attendees: undefined });
        if (hooks.afterInsert) await hooks.afterInsert(id);
        return { success: true, httpStatus: 200, eventId: id };
      },
      async get(eventId) {
        log.push(['get', eventId]);
        const f = await takeFault('get', eventId);
        if (f) return f;
        const e = events.get(eventId);
        return e ? { success: true, httpStatus: 200, event: { ...e } } : { success: false, httpStatus: 404, error: 'Not Found' };
      },
      async patch(eventId, booking, { restore = false } = {}) {
        log.push(['patch', eventId]);
        const f = await takeFault('patch', eventId, booking);
        if (f) return f;
        const e = events.get(eventId);
        if (!e) return { success: false, httpStatus: 404, error: 'Not Found' };
        Object.assign(e, { summary: summaryFor(booking), date: booking.preferred_date, time: booking.preferred_time });
        if (restore) e.status = 'confirmed';
        if (hooks.afterPatch) await hooks.afterPatch(eventId);
        return { success: true, httpStatus: 200, eventId };
      },
      async delete(eventId) {
        log.push(['delete', eventId]);
        const f = await takeFault('delete', eventId);
        if (f) return f;
        const e = events.get(eventId);
        if (!e) return { success: false, httpStatus: 404, error: 'Not Found' };
        if (e.status === 'cancelled') return { success: false, httpStatus: 410, error: 'Resource has been deleted' };
        e.status = 'cancelled';
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
