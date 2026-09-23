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
 *   state. PATCHes never carry restore:true blindly (fix R7): only when Google
 *   reports the event cancelled AND `recheck()` says the booking is still live.
 * - deleteEvent targets every known handle (stored + stable + extras) and
 *   succeeds only when each is 2xx or 404/410 (already absent).
 * - Never adds attendees; helpers send sendUpdates=none.
 * - `error` is sanitised (tokens/emails redacted, truncated) — safe to store.
 * - Optional `{ signal }` (AbortSignal): passed to every adapter call, and no
 *   further Google call starts once it has aborted. The lifecycle aborts it
 *   when its sync budget runs out (fix R1).
 */
import { randomUUID } from 'node:crypto';
import {
  insertCalendarEventWithId,
  getCalendarEvent,
  patchCalendarEvent,
  deleteCalendarEventById,
  markCalendarEventCancelled,
} from '../google-calendar.js';

const GOOGLE_EVENT_ID_RE = /^[a-v0-9]{5,1024}$/;
const MAX_ERROR_LEN = 300;

export const googleCalendarAdapter = {
  insert: insertCalendarEventWithId,
  get: getCalendarEvent,
  patch: patchCalendarEvent,
  delete: deleteCalendarEventById,
  tombstone: markCalendarEventCancelled,
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

/**
 * Did Google definitely NOT apply this write? Only a 4xx answer (or a local refusal
 * before any request) says so. Timeouts, aborts, network errors and 5xx are ambiguous:
 * the request may still commit remotely after we gave up (fix R7).
 */
export function isDefiniteFailure(r) {
  if (r?.reason === 'not_configured' || r?.reason === 'no_date' || r?.reason === 'local') return true;
  if (r?.reason === 'aborted' && r?.httpStatus == null && r?.notSent) return true;
  return typeof r?.httpStatus === 'number' && r.httpStatus >= 400 && r.httpStatus < 500;
}

function failure(r, eventId = null, context = '') {
  const reason = r?.reason === 'not_configured' ? 'calendar not configured'
    : r?.reason === 'no_date' ? 'booking has no date' : r?.error;
  const msg = sanitizeError(reason, typeof r?.httpStatus === 'number' ? r.httpStatus : null);
  return {
    ok: false, eventId, status: 'failed', error: context ? `${context}: ${msg}` : msg,
    ...(!isDefiniteFailure(r) && { ambiguous: true }),
  };
}

function isDuplicate(r) {
  return r?.httpStatus === 409 || /duplicate|already exists/i.test(String(r?.error || ''));
}

// Refused locally before sending: definitely not applied.
// No etag from Google → we cannot write conditionally → do not write at all (fail closed).
const NO_ETAG = { success: false, reason: 'local', httpStatus: null, error: 'event has no etag; refusing an unconditional write' };
const etagOf = (got) => (typeof got?.event?.etag === 'string' && got.event.etag ? got.event.etag : null);

const ABORTED = { success: false, reason: 'aborted', notSent: true, httpStatus: null, error: 'calendar sync deadline reached' };

export function createCalendarSync(adapter = googleCalendarAdapter) {
  // Every adapter call goes through here: no new Google call once the signal aborted.
  const call = (signal, fn, ...args) => (signal?.aborted ? Promise.resolve(ABORTED) : invoke(fn, ...args));

  const SUPERSEDED = (eventId, touched) => ({
    ok: false, eventId, status: 'superseded', superseded: true, error: null,
    ...(touched.length && { touched }),
  });
  const withTouched = (r, touched) => (touched.length ? { ...r, touched: [...new Set(touched)] } : r);

  /**
   * Before a restore (status:'confirmed' on an event Google holds as cancelled),
   * ask the caller whether the booking is still live at the revision being synced.
   * No `recheck` (direct/tests) → proceed. A throw counts as "not current".
   */
  async function stillCurrent(recheck) {
    if (typeof recheck !== 'function') return true;
    try { return (await recheck()) === true; } catch { return false; }
  }

  /**
   * Restore `eventId` only if the booking is still live; otherwise report superseded
   * so the caller re-reads and reconciles (fix R7). `touched` records every id a
   * restore PATCH was SENT to, whatever the answer, so a later cancellation pass
   * deletes it even if the DB never stored that id.
   */
  async function restore(eventId, booking, signal, recheck, touched, context, etag) {
    if (!(await stillCurrent(recheck))) return SUPERSEDED(eventId, touched);
    if (!etag) return withTouched(failure(NO_ETAG, eventId, context), touched);
    touched.push(eventId);
    // Conditional on the etag of the cancelled event we just saw. A cancellation that
    // lands meanwhile changes the etag (delete + fenced tombstone write), so a restore that
    // reaches Google later, even after our local abort, gets 412 and is not applied.
    const r = await call(signal, adapter.patch, eventId, booking, { restore: true, signal, ifMatch: etag });
    if (r.httpStatus === 412) return SUPERSEDED(eventId, touched);
    if (!accepted(r)) return withTouched(failure(r, eventId, context), touched);
    return withTouched({ ok: true, eventId, status: 'synced', error: null, restored: true }, touched);
  }

  async function createIdempotent(eventId, booking, signal, recheck, touched, beforeInsert) {
    // Inserts cannot be conditional. The caller durably records "a create may be in
    // flight" first (lifecycle rule 5d); if that record cannot be written, no insert.
    if (typeof beforeInsert === 'function') {
      let okToInsert = false;
      try { okToInsert = (await beforeInsert()) === true; } catch { okToInsert = false; }
      if (!okToInsert) return SUPERSEDED(null, touched);
    }
    touched.push(eventId);
    const ins = await call(signal, adapter.insert, eventId, booking, { signal });
    if (accepted(ins)) return withTouched({ ok: true, eventId: ins.eventId || eventId, status: 'synced', error: null }, touched);
    if (!isDuplicate(ins)) return withTouched(failure(ins, null, 'create'), touched);

    // Already exists (e.g. timeout-after-create on an earlier attempt).
    const got = await call(signal, adapter.get, eventId, { signal });
    if (!accepted(got)) return withTouched(failure(got, null, 'lookup existing event'), touched);
    if (got.event?.status === 'cancelled') {
      // Never resurrect without re-checking the booking right before the restore.
      return restore(eventId, booking, signal, recheck, touched, 'update existing event', etagOf(got));
    }
    if (!etagOf(got)) return withTouched(failure(NO_ETAG, null, 'update existing event'), touched);
    touched.push(eventId);
    const p = await call(signal, adapter.patch, eventId, booking, { signal, ifMatch: etagOf(got) });
    if (p.httpStatus === 412) return SUPERSEDED(eventId, touched);
    if (!accepted(p)) return withTouched(failure(p, null, 'update existing event'), touched);
    if (p.event?.status === 'cancelled') {
      return withTouched(failure({ reason: 'local', error: 'event was cancelled while updating' }, null, 'update existing event'), touched);
    }
    return withTouched({ ok: true, eventId, status: 'synced', error: null, restored: false }, touched);
  }

  /**
   * Make the calendar show this LIVE (pending/confirmed) booking. Moves the same event.
   *
   * Fix R7 (ETag fencing, Google "conditional modification": If-Match → 412 when the
   * event changed since it was read). Every PATCH of an existing event is conditional on
   * the etag just read. A restore (status:'confirmed' on a cancelled event) is sent only
   * after `opts.recheck()` confirms the booking is still live at the same revision.
   * A concurrent cancellation changes the etag (DELETE, or the tombstone write when the
   * event was already cancelled), so a PATCH that reaches Google after that, even one that
   * commits after our local AbortSignal fired, is refused with 412 → { status:'superseded' },
   * and the caller re-reads the latest row. Inserts cannot be made conditional; they are
   * covered by the in-flight marker + reservation (deleteEvent reserveIfMissing, lifecycle rule 5d).
   * No etag in a GET answer → no write at all (never downgrade to an unconditional PATCH).
   */
  async function ensureEvent(booking, { signal, recheck, beforeInsert } = {}) {
    const stable = stableEventId(booking?.id);
    const stored = booking?.calendar_event_id || null;
    const touched = [];
    if (!stable && !stored) return failure({ error: 'booking has no valid id' });

    if (stored) {
      // Read first (etag + status), then write conditionally (If-Match). Never rely on a
      // plain PATCH leaving a deleted event deleted.
      const got = await call(signal, adapter.get, stored, { signal });
      if (accepted(got) && got.event?.status === 'cancelled') {
        return restore(stored, booking, signal, recheck, touched, 'restore', etagOf(got));
      }
      if (accepted(got) && !etagOf(got)) return failure(NO_ETAG, stored, 'update');
      const p = accepted(got)
        ? await call(signal, adapter.patch, stored, booking, { signal, ifMatch: etagOf(got) })
        : got;
      if (p.httpStatus === 412) return SUPERSEDED(stored, touched);
      if (accepted(p)) {
        if (p.event?.status === 'cancelled') {
          return failure({ reason: 'local', error: 'event was cancelled while updating' }, stored, 'update');
        }
        return { ok: true, eventId: stored, status: 'synced', error: null };
      }
      if (!isGone(p.httpStatus)) return failure(p, stored, accepted(got) ? 'update' : 'lookup');
      // Stored event is gone — fall through and (re)create under the stable id.
      if (!stable) return failure(p, stored, 'update');
      // Replacement create: re-check first, so a cancelled booking gets no new event.
      if (!(await stillCurrent(recheck))) return SUPERSEDED(null, touched);
    }
    return createIdempotent(stable, booking, signal, recheck, touched, beforeInsert);
  }

  /** Every Google id this booking may own: stored (legacy or stable), derived stable, extras. */
  function candidateIds(booking, extraIds = [], { skipStable = false } = {}) {
    const ids = [booking?.calendar_event_id, skipStable ? null : stableEventId(booking?.id), ...extraIds]
      .filter((x) => typeof x === 'string' && x);
    return [...new Set(ids)];
  }

  /**
   * Remove the booking's event under EVERY known handle (fix R7/R8): the stored id
   * (legacy or stable), the derived stable id (a replacement whose id was never
   * saved, or an orphan from a timeout-after-create) and `opts.extraIds` (ids this
   * request touched). ok only when each one is acknowledged absent: 2xx or 404/410.
   * Deletes run in parallel so a legacy booking costs one Google round trip, not two.
   *
   * `tombstone`: the first non-stable (legacy) id, which the caller keeps in
   * calendar_event_id after cancellation. The stable id is always derivable, so it
   * never needs storing; a legacy id is not, and would otherwise be lost to later retries.
   */
  async function deleteEvent(booking, { signal, extraIds = [], skipStable = false, reserveIfMissing = false } = {}) {
    const stable = stableEventId(booking?.id);
    const stored = booking?.calendar_event_id || null;
    // skipStable: ownership not proven for the derived id (fix R15), so don't touch it.
    const ids = candidateIds(booking, extraIds, { skipStable });
    const tombstone = ids.find((x) => x !== stable) || null;
    if (!ids.length) return { ok: true, eventId: null, status: 'absent', error: null, alreadyAbsent: true, tombstone: null };

    const done = (d) => accepted(d) || is2xx(d?.httpStatus) || isGone(d?.httpStatus);
    /**
     * Delete one handle so nothing still in flight can make it live again (fix R7):
     *  1. DELETE.
     *  2. Fenced tombstone on anything that exists: PATCH { status:'cancelled',
     *     extendedProperties.private.bbs_fence: <fresh random nonce> }. The nonce guarantees
     *     the resource CHANGES even if it was already cancelled, so its etag moves and every
     *     in-flight If-Match write holding an older etag gets 412, including one Google
     *     commits after our local abort. (A same-value PATCH is not guaranteed to change the
     *     etag, which is why the nonce is there.) PATCH merges `private` keys, so unrelated
     *     properties are kept (sandbox-verify).
     *  3. reserveIfMissing (a create may be in flight: calendar_op_started_at is set) and the
     *     stable id answered 404: RESERVE it. Insert under that id, then delete + fence.
     *     If our insert succeeds, the uncertain earlier insert has not committed, and it can
     *     no longer commit: the id now exists (as a cancelled event), so Google answers 409,
     *     and that request's own 409 path re-checks the booking and finds it cancelled.
     *     If our insert gets 409, the earlier insert did commit, and we delete that event.
     *     Either way this is a POSITIVE provider observation, not a timer.
     * Any ambiguous answer at any step (timeout, 5xx, network) → failed, never absent.
     */
    async function fence(id) {
      const t = await call(signal, adapter.tombstone, id, { signal, fence: randomUUID() });
      return accepted(t) || isGone(t.httpStatus) ? null : t;
    }
    async function removeOne(id) {
      let d = await call(signal, adapter.delete, id, { signal });
      if (d.httpStatus === 404 && id === stable && reserveIfMissing) {
        const ins = await call(signal, adapter.insert, id, booking, { signal });
        if (!(accepted(ins) || isDuplicate(ins))) return { id, d: ins, unresolved: true };
        d = await call(signal, adapter.delete, id, { signal });
        if (!done(d) || d.httpStatus === 404) return { id, d: done(d) ? { ...NO_ETAG, error: 'reserved id vanished' } : d, unresolved: true };
        const f = adapter.tombstone ? await fence(id) : null;
        return f ? { id, d: f, unresolved: true } : { id, d, reserved: true };
      }
      if (!done(d) || d.httpStatus === 404) return { id, d };
      const f = adapter.tombstone ? await fence(id) : null;
      return f ? { id, d: f } : { id, d };
    }
    const results = await Promise.all(ids.map(removeOne));
    const bad = results.filter(({ d }) => !done(d));
    if (bad.length) {
      const f = failure(bad[0].d, stored || tombstone, ids.length > 1 ? `delete ${bad[0].id === stable ? 'stable' : 'stored'} event` : 'delete');
      return { ...f, tombstone };
    }
    const alreadyAbsent = results.every(({ d }) => isGone(d.httpStatus));
    const notFound = results.filter(({ d }) => d.httpStatus === 404).map(({ id }) => id);
    const reserved = results.filter((x) => x.reserved).map(({ id }) => id);
    // The stable id is now provably existing-and-deleted at Google (DELETE 2xx/410, or
    // reserved): no insert under it can ever commit again (409). Only this lets the caller
    // clear an in-flight create marker (fix R7 marker ownership).
    const s = results.find((x) => x.id === stable);
    const stableSettled = !!s && (s.reserved || (done(s.d) && s.d.httpStatus !== 404));
    return { ok: true, eventId: null, status: 'absent', error: null, alreadyAbsent, tombstone, notFound, reserved, stableSettled };
  }

  return { ensureEvent, deleteEvent, candidateIds };
}
