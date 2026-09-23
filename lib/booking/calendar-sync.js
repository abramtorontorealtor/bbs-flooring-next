/**
 * Booking ⇄ Google Calendar sync primitives (Phase A, slice A2).
 *
 * Wraps lib/google-calendar.js behind a tiny adapter so the lifecycle service
 * (and tests) can swap in a fake. Every operation returns ONE normalised shape,
 * whether the adapter threw or returned `{ success:false }`:
 *
 *   { ok: boolean, eventId: string|null, status: 'synced'|'failed'|'absent', error: string|null }
 *
 * - Event IDs: new events use a stable ID derived from the booking UUID
 *   (`'bbs' + uuid without hyphens` — hex ⊂ Google's base32hex [a-v0-9]).
 *   Legacy Google-assigned IDs already stored on a booking are kept and used.
 * - ensureEvent (create/move/confirm) is idempotent: insert with stable ID;
 *   409/duplicate → GET the existing event → PATCH it to the current booking
 *   state with status:'confirmed' (restores an event left `cancelled`).
 * - deleteEvent succeeds only on 2xx or 404/410 (already absent).
 * - Never adds attendees; helpers send sendUpdates=none.
 * - `error` is sanitised (tokens/emails redacted, truncated) — safe to store.
 * - Optional `{ signal }` (AbortSignal): passed to every adapter call, and no
 *   further Google call starts once it has aborted. The lifecycle aborts it
 *   when its sync budget runs out (fix R1).
 */
import {
  insertCalendarEventWithId,
  getCalendarEvent,
  patchCalendarEvent,
  deleteCalendarEventById,
} from '../google-calendar.js';

const GOOGLE_EVENT_ID_RE = /^[a-v0-9]{5,1024}$/;
const MAX_ERROR_LEN = 300;

export const googleCalendarAdapter = {
  insert: insertCalendarEventWithId,
  get: getCalendarEvent,
  patch: patchCalendarEvent,
  delete: deleteCalendarEventById,
};

/** Stable, Google-valid event ID for a booking UUID (null if the id can't be mapped). */
export function stableEventId(bookingId) {
  if (!bookingId) return null;
  const id = 'bbs' + String(bookingId).toLowerCase().replace(/-/g, '');
  return GOOGLE_EVENT_ID_RE.test(id) ? id : null;
}

/** Turn any error/body into a short, secret-free string suitable for DB/admin UI. */
export function sanitizeError(err, httpStatus = null) {
  let msg;
  if (err == null) msg = 'unknown error';
  else if (typeof err === 'string') msg = err;
  else msg = err.message || err.error || err.reason || 'unknown error';
  msg = String(msg);
  try {
    const j = JSON.parse(msg);
    msg = j?.error?.message || j?.error_description || (typeof j?.error === 'string' ? j.error : msg);
  } catch { /* not JSON */ }
  msg = String(msg)
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, 'Bearer [redacted]')
    .replace(/(access_token|refresh_token|client_secret|client_id|token)(["']?\s*[:=]\s*["']?)[^\s"'&,}]+/gi, '$1$2[redacted]')
    .replace(/ya29\.[A-Za-z0-9._-]+/g, '[redacted]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
    .replace(/\s+/g, ' ')
    .trim() || 'unknown error';
  if (httpStatus) msg = `HTTP ${httpStatus}: ${msg}`;
  return msg.length > MAX_ERROR_LEN ? msg.slice(0, MAX_ERROR_LEN - 1) + '…' : msg;
}

async function invoke(fn, ...args) {
  try {
    const r = await fn(...args);
    if (!r || typeof r !== 'object') {
      return { success: false, httpStatus: null, error: 'empty calendar response' };
    }
    return r;
  } catch (err) {
    return {
      success: false,
      reason: 'exception',
      httpStatus: err?.httpStatus ?? err?.status ?? err?.code ?? null,
      error: err?.message || String(err),
    };
  }
}

const is2xx = (s) => typeof s === 'number' && s >= 200 && s < 300;
const isGone = (s) => s === 404 || s === 410;
const accepted = (r) => r.success === true && (r.httpStatus == null || is2xx(r.httpStatus));

function failure(r, eventId = null, context = '') {
  const reason = r?.reason === 'not_configured' ? 'calendar not configured'
    : r?.reason === 'no_date' ? 'booking has no date' : r?.error;
  const msg = sanitizeError(reason, typeof r?.httpStatus === 'number' ? r.httpStatus : null);
  return { ok: false, eventId, status: 'failed', error: context ? `${context}: ${msg}` : msg };
}

function isDuplicate(r) {
  return r?.httpStatus === 409 || /duplicate|already exists/i.test(String(r?.error || ''));
}

const ABORTED = { success: false, reason: 'aborted', httpStatus: null, error: 'calendar sync deadline reached' };

export function createCalendarSync(adapter = googleCalendarAdapter) {
  // Every adapter call goes through here: no new Google call once the signal aborted.
  const call = (signal, fn, ...args) => (signal?.aborted ? Promise.resolve(ABORTED) : invoke(fn, ...args));

  async function createIdempotent(eventId, booking, signal) {
    const ins = await call(signal, adapter.insert, eventId, booking, { signal });
    if (accepted(ins)) return { ok: true, eventId: ins.eventId || eventId, status: 'synced', error: null };
    if (!isDuplicate(ins)) return failure(ins, null, 'create');

    // Already exists (e.g. timeout-after-create on an earlier attempt).
    const got = await call(signal, adapter.get, eventId, { signal });
    if (!accepted(got)) return failure(got, null, 'lookup existing event');
    // Reconcile to current booking state; restore:true undoes a cancelled event.
    const p = await call(signal, adapter.patch, eventId, booking, { restore: true, signal });
    if (!accepted(p)) return failure(p, null, 'update existing event');
    return {
      ok: true, eventId, status: 'synced', error: null,
      restored: got.event?.status === 'cancelled',
    };
  }

  /** Make the calendar show this LIVE (pending/confirmed) booking. Moves the same event. */
  async function ensureEvent(booking, { signal } = {}) {
    const stable = stableEventId(booking?.id);
    const stored = booking?.calendar_event_id || null;
    if (!stable && !stored) return failure({ error: 'booking has no valid id' });

    if (stored) {
      const p = await call(signal, adapter.patch, stored, booking, { restore: true, signal });
      if (accepted(p)) return { ok: true, eventId: stored, status: 'synced', error: null };
      if (!isGone(p.httpStatus)) return failure(p, stored, 'update');
      // Stored event is gone — fall through and (re)create under the stable id.
      if (!stable) return failure(p, stored, 'update');
    }
    return createIdempotent(stable, booking, signal);
  }

  /** Remove the booking's event. ok only on 2xx or 404/410 (already absent). */
  async function deleteEvent(booking, { signal } = {}) {
    const stored = booking?.calendar_event_id || null;
    // No stored id: still try the stable id, so an event orphaned by a
    // timeout-after-create is not left behind.
    const target = stored || stableEventId(booking?.id);
    if (!target) return { ok: true, eventId: null, status: 'absent', error: null, alreadyAbsent: true };
    const d = await call(signal, adapter.delete, target, { signal });
    if (accepted(d) || is2xx(d.httpStatus)) {
      return { ok: true, eventId: null, status: 'absent', error: null, alreadyAbsent: false };
    }
    if (isGone(d.httpStatus)) {
      return { ok: true, eventId: null, status: 'absent', error: null, alreadyAbsent: true };
    }
    return failure(d, stored, 'delete');
  }

  return { ensureEvent, deleteEvent };
}
