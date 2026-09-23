/**
 * Booking lifecycle service — the ONE authoritative path for booking state
 * changes (Phase A, slice A2). Routes (A3) call this; they do not write
 * `bookings` or touch Google Calendar directly.
 *
 * ── Contract ──────────────────────────────────────────────────────────────
 * createBookingLifecycle({ db, calendar, notify, now?, logger? })
 *
 *  db (see ./supabase-store.js for the real adapter; tests use a fake):
 *    insert(row)                         → { data: row|null, error }
 *    get(id)                             → { data: row|null, error }
 *    update(id, patch, { expected })     → { data: row|null, error, conflict: boolean }
 *        Conditional write: applies only if the stored row still matches
 *        `expected` (by `revision`; legacy adapter falls back to updated_at).
 *        conflict:true means someone else changed the row first.
 *        persisted:false (legacy schema, sync-state-only patch) means the guard
 *        passed but nothing was stored → calendarSync.recorded:false.
 *
 *  calendar (./calendar-sync.js createCalendarSync()):
 *    ensureEvent(row, { signal, recheck }) → { ok, eventId, status:'synced'|'failed'|'superseded', error, touched? }
 *    deleteEvent(row, { signal, extraIds }) → { ok, eventId:null, status:'absent'|'failed', error, tombstone }
 *
 *  notify(type, payload) → Promise<any>   (types: 'created' | 'confirmed' | 'rescheduled' | 'cancelled')
 *    resolved value is returned as notifications[i].result (A3: { customerEmailSent })
 *    payload = { booking, previous, actor, reason, oldDate, oldTime }
 *    Called ONLY after the DB write persisted. Failures are caught and
 *    reported, never undo the booking. retrySync never notifies.
 *
 * ── Row fields owned by this service ─────────────────────────────────────
 *  status               'pending' | 'confirmed' | 'cancelled' | 'completed'
 *  revision             int, +1 on every state change (create = 1). Missing on
 *                       legacy rows → treated as 0.
 *  calendar_event_id    stable 'bbs'+uuidhex for new events; legacy IDs kept.
 *                       On cancellation a LEGACY id stays as a tombstone (fix R7)
 *                       so every later retry still deletes it; a stable id is
 *                       cleared only after every candidate (stored + stable) is
 *                       acknowledged absent (2xx/404/410).
 *  calendar_sync_status 'pending' (state changed, sync not yet done) | 'synced'
 *                       | 'failed' | 'unknown' (pre-existing rows, never set here)
 *  calendar_sync_error  sanitised message or null
 *  calendar_synced_at   ISO timestamp of last successful sync
 *  NOTE: revision + calendar_sync_* do NOT exist in the live schema yet (A4
 *  migration). The Supabase adapter strips them and guards on updated_at
 *  until the columns exist; the service logic is identical either way.
 *
 * ── Rules ────────────────────────────────────────────────────────────────
 *  1. DB write first and authoritative. DB failure → { success:false }, and NO
 *     calendar call, NO notification.
 *  2. Calendar failure never undoes a persisted change: result is success with
 *     calendarSync:{ status:'failed', error }.
 *  3. Sync always reconciles against the LATEST row (re-read after the
 *     calendar call; if the revision moved, reconcile again). A stale
 *     reschedule is never re-applied, a cancelled booking's event is never
 *     recreated. Sync-state writes are conditional but do not bump revision.
 *  4. State writes retry once on revision conflict, then return code:'conflict'.
 *  5. complete(): status flip + revision only. No calendar, no notification.
 *  5b. Calendar deletion happens ONLY for status 'cancelled' (fix R14). pending/
 *     confirmed → ensure event; completed → skipped; anything else →
 *     { status:'skipped', reason:'unrecognised_status' }, with no Google call and no DB write.
 *  5c. Handle fencing (fix R7/R8). Stored ids are PATCHed without restore; a
 *     restore or replacement create is sent only after a re-read shows the booking
 *     still live at the same revision. Cancellation deletes every candidate id
 *     (stored, derived stable, and any id this call restored/created). If a
 *     post-effect CAS conflict finds the booking cancelled, the next pass deletes
 *     all of them, including one this call just patched. A failed sync-state write
 *     after a Google change reports 'failed' (retryable), never 'synced'.
 *  5d. In-flight inserts (fix R7). An INSERT cannot be conditional and may commit at
 *     Google after our deadline. Before inserting, calendar_op_started_at is written
 *     (CAS); the insert is skipped if that fails or the row changed. While the marker is
 *     set, a cancellation still sweeps every handle (delete + fence, and reserves a 404
 *     stable id as best effort) but reports 'failed' (uncertain_calendar_create), never
 *     absent: Google documents that id collisions may go undetected at creation time, so
 *     no observation proves a delayed insert cannot land. The marker is cleared only by
 *     the attempt that claimed it after its own definite answer (conditional on its
 *     token), or by the admin action resolve_calendar_uncertainty. Never by time.
 *     PATCHes are etag-conditional and fail closed without an etag (calendar-sync).
 *     Ambiguous Google outcomes (timeout, abort, 5xx) are never recorded as synced/absent.
 *  6. Bounded side effects (fix R1). Once the DB write commits the call ALWAYS
 *     resolves success. Calendar reconciliation has a total budget
 *     (timeouts.syncMs). Its AbortSignal reaches every Google call and stops any
 *     further DB write from that pass. On timeout a "failed: timed out" state is
 *     recorded under CAS (timeouts.recordMs) and notifications still run, each
 *     bounded by timeouts.notifyMs. See ./deadline.js for defaults and env overrides.
 *
 * Results:
 *  success → { success:true, booking, calendarSync:{status,error,eventId}|null, notifications }
 *  failure → { success:false, code, error, httpStatus }
 *    code: 'invalid_input'(400) | 'not_found'(404) | 'invalid_state'(409)
 *          | 'conflict'(409) | 'db_error'(500)
 */

import { randomUUID } from 'node:crypto';
import { resolveBookingTimeouts, withDeadline, isDeadlineError } from './deadline.js';
import { createOwnership, UNVERIFIED_REASON } from './ownership.js';
import { stableEventId } from './calendar-sync.js';
import { createSlotGate, RESERVATION_UNAVAILABLE_MESSAGE } from './reservation.js';
import { resolveSchedulePolicy } from './schedule-policy.js';

export const LIVE_STATUSES = Object.freeze(['pending', 'confirmed']);
const TERMINAL_STATUSES = Object.freeze(['cancelled', 'completed']);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
const MAX_SYNC_PASSES = 3;
const ABORTED_SYNC = Symbol('aborted-sync');

/** Public calendarSync shape: { status, error, eventId, reason?, recorded? }. */
const syncView = (s) => ({
  status: s.status, error: s.error, eventId: s.eventId,
  ...(s.reason && { reason: s.reason }),
  ...(s.recorded === false && { recorded: false }),
});

const fail = (code, error, httpStatus) => ({ success: false, code, error, httpStatus });
const HTTP = { invalid_input: 400, not_found: 404, invalid_state: 409, conflict: 409, db_error: 500 };

function isValidDate(s) {
  if (typeof s !== 'string' || !DATE_RE.test(s)) return false;
  const d = new Date(`${s}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

function isValidTime(s) {
  const m = typeof s === 'string' && s.trim().match(TIME_RE);
  if (!m) return false;
  const h = Number(m[1]);
  const min = Number(m[2]);
  return h >= 1 && h <= 12 && min >= 0 && min < 60;
}

/** Today's date (YYYY-MM-DD) in America/Toronto. */
function torontoToday(now) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);
}

export const UNCERTAIN_REASON = 'uncertain_calendar_create';

/** Unique marker value (µs precision, fits timestamptz): one per insert attempt. */
function markerToken() {
  const d = new Date();
  const micro = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return d.toISOString().replace('Z', `${micro}Z`);
}

/** The insert this call sent got a definite answer: success/409 adopted, or a 4xx failure. */
function ownInsertDefinite(r) {
  return r?.ok === true || (r?.ok === false && !r.ambiguous);
}

/** Same row version: revision, updated_at and status all unchanged (works in legacy mode too). */
function sameSnapshot(a, b) {
  return (Number(a.revision) || 0) === (Number(b.revision) || 0)
    && (a.updated_at ?? null) === (b.updated_at ?? null)
    && (a.status ?? null) === (b.status ?? null);
}

function sanitizeDbError(error) {
  const msg = String(error?.message || error || 'database error');
  return msg.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]').slice(0, 200);
}

export function createBookingLifecycle({
  db, calendar, notify, now = () => new Date(), logger = console, timeouts = {},
  ownership = createOwnership(),
  // Phase B (B2): policy + fresh-availability gate for create/reschedule. Default = current
  // schedule policy with DB-only enforcement (the atomic RPC); production passes availability.
  slotGate = null,
}) {
  if (!db || !calendar) throw new Error('createBookingLifecycle: db and calendar are required');
  const gate = slotGate || createSlotGate({ policy: resolveSchedulePolicy(), now: () => now().getTime(), logger });
  const iso = () => now().toISOString();
  const T = resolveBookingTimeouts(timeouts);

  async function safeNotify(type, payload) {
    if (!notify) return { type, ok: false, skipped: true };
    try {
      // The adapter's return value (e.g. { customerEmailSent }) is surfaced to
      // routes so they can report emailSent without re-sending anything.
      const result = await withDeadline(() => notify(type, payload), T.notifyMs, `notify(${type})`);
      return { type, ok: true, result: result ?? null };
    } catch (err) {
      logger.error?.(`[booking-lifecycle] notify(${type}) failed:`, err?.message || err);
      return {
        type, ok: false, error: String(err?.message || err).slice(0, 200),
        ...(isDeadlineError(err) && { timedOut: true }),
      };
    }
  }

  async function load(id) {
    if (!id) return { error: fail('invalid_input', 'Missing booking id', 400) };
    let res;
    try { res = await db.get(id); } catch (err) { res = { error: err }; }
    if (res?.error) return { error: fail('db_error', sanitizeDbError(res.error), 500) };
    if (!res?.data) return { error: fail('not_found', 'Booking not found', 404) };
    return { row: res.data };
  }

  /**
   * Apply a state change with optimistic concurrency. `plan(row)` returns
   * { patch } or { error } (validated against the freshly-read row).
   */
  async function transition(id, plan) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const { row, error } = await load(id);
      if (error) return { error };
      const planned = plan(row);
      if (planned.error) return { error: planned.error };
      // Fix R6: an identical transition (already confirmed / same date+time+status) is a
      // no-op. No revision bump and no email, so retries or stale tabs don't send duplicates.
      if (planned.noop) return { previous: row, booking: row, noop: true };
      const patch = {
        ...planned.patch,
        revision: (Number(row.revision) || 0) + 1,
        updated_at: iso(),
      };
      let res;
      try { res = await db.update(id, patch, { expected: row }); } catch (err) { res = { error: err }; }
      if (res?.conflict) continue;
      if (res?.error || !res?.data) {
        return { error: fail('db_error', sanitizeDbError(res?.error || 'update returned no row'), 500) };
      }
      return { previous: row, booking: res.data };
    }
    return {
      error: fail('conflict', 'This booking was changed at the same time by someone else. Reload and try again.', 409),
    };
  }

  /**
   * Reconcile Google Calendar with the LATEST booking row. Never notifies.
   * Returns { status, error, eventId, booking }.
   */
  /**
   * Fix R15: which Google ids may this actor touch for this row?
   *  stable (derived) id → row trusted (valid ownership_proof) or actor admin/server
   *  stored non-stable id → valid calendar_event_proof, any actor
   * Returns { ok, skipStable, error }. Fail closed: never 'synced'/'absent' when blocked.
   */
  function authority(row, actor) {
    const stable = stableEventId(row.id);
    const stored = row.calendar_event_id || null;
    const trustedRow = actor === 'admin' || actor === 'server' || ownership.verifyRow(row);
    if (stored && stored !== stable && !ownership.verifyEvent(row, stored)) {
      return { ok: false, error: `calendar event ${stored} is not verified as this booking's event; an admin must verify it (trust_calendar_event) before sync` };
    }
    if (!trustedRow) {
      // Stored id (if any) is proven, but the derived id is not: a forged row could
      // name any id. Live rows cannot sync; cancelled rows delete only the proven id.
      return LIVE_STATUSES.includes(row.status) || !stored || stored === stable
        ? { ok: false, error: 'booking ownership not verified (no server proof); an admin must retry sync' }
        : { ok: true, skipStable: true };
    }
    return { ok: true, skipStable: false };
  }

  async function syncLatest(id, { signal, actor = 'admin' } = {}) {
    let last = null;
    // Every Google id a restore/create in THIS call may have made live (fix R7(c)).
    // A later pass that finds the booking cancelled deletes them all, even if the
    // DB never stored them or another writer nulled calendar_event_id.
    const touched = new Set();
    for (let pass = 0; pass < MAX_SYNC_PASSES; pass++) {
      if (signal?.aborted) return ABORTED_SYNC;
      const { row, error } = await load(id);
      if (error) return { status: 'failed', error: error.error, eventId: null, booking: last };
      last = row;

      if (row.status === 'completed') {
        // Completion has no calendar side effect; the event (if any) stays as-is.
        return { status: 'skipped', error: null, eventId: row.calendar_event_id || null, booking: row };
      }

      const live = LIVE_STATUSES.includes(row.status);
      if (!live && row.status !== 'cancelled') {
        // Fix R14: ONLY an explicit 'cancelled' deletes. Any status this service
        // does not own (contacted/quoted/booked/new/empty, e.g. from the CRM
        // follow-up writer) gets no Google call, no deletion and no DB write.
        // The event and its stored id stay exactly as they are.
        logger.warn?.(`[booking-lifecycle] calendar sync skipped: unrecognised status ${JSON.stringify(row.status ?? null)} for ${id}`);
        return {
          status: 'skipped',
          reason: 'unrecognised_status',
          error: `booking status ${JSON.stringify(row.status ?? null)} is not pending/confirmed/cancelled; calendar left unchanged`,
          eventId: row.calendar_event_id || null,
          booking: row,
        };
      }
      const auth = authority(row, actor);
      if (!auth.ok) {
        // Fix R15: no Google call on unverifiable ownership. Durable 'failed' (red badge),
        // CAS-guarded; a conflict means the row changed → reconcile the latest.
        logger.warn?.(`[booking-lifecycle] calendar sync blocked for ${id}: ${auth.error}`);
        const patch = { calendar_sync_status: 'failed', calendar_sync_error: auth.error };
        let res;
        try { res = await db.update(id, patch, { expected: row }); } catch (err) { res = { error: err }; }
        if (res?.conflict) continue;
        return {
          status: 'failed', reason: UNVERIFIED_REASON, error: auth.error,
          eventId: row.calendar_event_id || null,
          booking: res?.data || row,
          ...((res?.error || res?.persisted === false) && { recorded: false }),
        };
      }
      // Fix R7: immediately before any restore (or replacement create), re-read and
      // proceed only if the booking is still live at this exact revision. Bounded by
      // the same signal. A cross-instance race after this check is closed by the
      // post-effect CAS below plus the `touched` deletion sweep.
      const recheck = async () => {
        if (signal?.aborted) return false;
        const cur = await load(id);
        return !!cur.row && sameSnapshot(cur.row, row) && LIVE_STATUSES.includes(cur.row.status);
      };
      // Fix R7 rule 5d: before any INSERT, durably record that a create may be in flight
      // (CAS against this exact row: if the booking changed, no insert). While the marker is
      // set, a cancellation that finds the stable id 404 reserves it instead of calling it absent.
      // Marker ownership (fix R7, provider contract): Google does not guarantee that id
      // collisions are detected at creation time, so NO later observation proves an
      // uncertain insert can never land. Each attempt writes its own unique token. It may
      // clear the marker later ONLY if it claimed it from NULL, its own insert got a definite
      // answer, and the marker still holds its token (conditional clear). An attempt that
      // finds a marker already set overwrites it with its own token (so the earlier holder's
      // conditional clear fails) and never clears. Otherwise only an explicit admin
      // resolve_calendar_uncertainty clears it. Elapsed time never does.
      let myMarker = null;
      let claimedFromNull = false;
      const beforeInsert = async () => {
        if (signal?.aborted) return false;
        const token = markerToken();
        let res;
        try { res = await db.update(id, { calendar_op_started_at: token }, { expected: row, opMarker: null }); } catch (err) { res = { error: err }; }
        if (res?.error) return false;
        if (res?.conflict) {
          const cur = await load(id);
          if (!cur.row || !sameSnapshot(cur.row, row)) return false; // booking changed → no insert
          try { res = await db.update(id, { calendar_op_started_at: token }, { expected: row }); } catch (err) { res = { error: err }; }
          if (res?.conflict || res?.error) return false;
        } else {
          claimedFromNull = true;
        }
        if (res?.persisted === false) logger.warn?.('[booking-lifecycle] legacy schema: in-flight create marker not stored');
        else myMarker = token;
        return true;
      };
      let r;
      try {
        r = live
          ? await calendar.ensureEvent(row, { signal, recheck, beforeInsert })
          : await calendar.deleteEvent(row, {
            signal, extraIds: [...touched], skipStable: auth.skipStable,
            // Fix R7: a create may still be in flight → resolve it by a positive provider
            // observation (reserve the stable id), never by elapsed time.
            reserveIfMissing: !!row.calendar_op_started_at || !!myMarker,
          });
      } catch (err) {
        r = { ok: false, eventId: null, status: 'failed', error: String(err?.message || err).slice(0, 200) };
      }
      // Owner clear: only this attempt's own claim-from-NULL, only after its OWN insert got a
      // definite answer, only if the marker still holds its token (a concurrent attempt that
      // overwrote it keeps its uncertainty). Done before anything else can fail.
      if (myMarker && claimedFromNull && live && !signal?.aborted && r && !r.ambiguous && ownInsertDefinite(r)) {
        try { await db.update(id, { calendar_op_started_at: null }, { opMarker: myMarker }); } catch { /* stays: conservative */ }
      }
      for (const t of r?.touched || []) touched.add(t);
      if (live && r?.ok && r.eventId) touched.add(r.eventId);
      // Budget ran out while Google was busy: the caller has already recorded the
      // timeout and answered. Write nothing, so a late pass cannot overwrite newer state.
      if (signal?.aborted) return ABORTED_SYNC;
      // Booking changed before a restore/replacement: nothing was resurrected; reconcile latest.
      if (r?.status === 'superseded') continue;

      // Live success stores the id Google used (legacy L, or stable S). Cancel success
      // keeps a LEGACY id as a tombstone (fix R7: a later retry must still reach it;
      // the stable id is derivable, so it is not stored). Failure keeps the stored id.
      // Uncertain create outstanding (marker set, now or by an earlier attempt): even if the
      // sweep deleted/reserved every handle, Google does not guarantee a delayed insert under
      // the same id is refused. A cancelled booking is therefore NOT reported absent/synced;
      // it stays failed + actionable until an admin checks Google Calendar and resolves it.
      const uncertain = !live && r.ok && (!!row.calendar_op_started_at || !!myMarker);
      if (uncertain) {
        r = {
          ok: false, status: 'failed', ambiguous: true, reason: UNCERTAIN_REASON, tombstone: r.tombstone,
          error: 'an earlier calendar create had an unknown outcome and Google cannot guarantee it will not still appear; check Google Calendar, then press Resolve',
        };
      }
      const patch = r.ok
        ? {
            calendar_event_id: live ? r.eventId : (r.tombstone ?? null),
            calendar_sync_status: 'synced',
            calendar_sync_error: null,
            calendar_synced_at: iso(),
          }
        : {
            calendar_sync_status: 'failed', calendar_sync_error: r.error || 'calendar sync failed',
            ...(r.reason === UNCERTAIN_REASON && r.tombstone !== undefined && { calendar_event_id: r.tombstone ?? row.calendar_event_id ?? null }),
          };

      let res;
      try { res = await db.update(id, patch, { expected: row }); } catch (err) { res = { error: err }; }
      if (res?.conflict) continue; // row changed while we talked to Google → reconcile latest
      if (res?.error) {
        logger.error?.('[booking-lifecycle] failed to persist sync state:', sanitizeDbError(res.error));
        // Fix R8: without a durable record this is NOT synced. A replacement handle
        // that was not saved is the dangerous case (cancellation still finds it,
        // because the stable id is always a delete candidate); either way the admin
        // must retry, so report failed.
        const lostHandle = r.ok && live && r.eventId && r.eventId !== (row.calendar_event_id || null);
        const error = !r.ok ? r.error
          : lostHandle ? `calendar event ${r.eventId} created but its id could not be saved; retry sync`
            : 'calendar updated but sync state not saved; retry sync';
        return {
          status: 'failed',
          error,
          eventId: r.ok && live ? r.eventId : row.calendar_event_id || null,
          booking: row,
        };
      }
      const booking = res?.data || { ...row, ...patch };
      return {
        status: r.ok ? (live ? 'synced' : 'absent') : 'failed',
        ...(r.reason && { reason: r.reason }),
        error: r.ok ? null : r.error,
        eventId: live ? booking.calendar_event_id || null : r.ok ? null : booking.calendar_event_id || null,
        booking,
        // Legacy schema: the guard read passed, but the sync state was not stored (fix R10).
        ...(res?.persisted === false && { recorded: false }),
      };
    }
    // Fix R13: no worker exists, so promise nothing. Record a durable failure on the latest
    // row (one CAS attempt, still under the signal) so the CRM shows red + Retry.
    const error = 'booking kept changing during calendar sync; press Retry calendar sync';
    if (signal?.aborted) return ABORTED_SYNC;
    const latest = await load(id);
    if (latest.row) {
      let res;
      try {
        res = await db.update(id, { calendar_sync_status: 'failed', calendar_sync_error: error }, { expected: latest.row });
      } catch (err) { res = { error: err }; }
      return {
        status: 'failed', error, eventId: latest.row.calendar_event_id || null,
        booking: res?.data || latest.row,
        ...((res?.conflict || res?.error || res?.persisted === false) && { recorded: false }),
      };
    }
    return { status: 'failed', error, eventId: last?.calendar_event_id || null, booking: last, recorded: false };
  }

  /**
   * After the sync budget ran out: durably mark the LATEST row failed, so the
   * CRM shows the red badge and Retry. CAS-guarded and bounded. A conflict means
   * another request changed the booking and runs its own sync, so the row is
   * not overwritten. Never throws.
   */
  async function recordSyncTimeout(id, reason, fallback) {
    const error = `calendar sync did not finish: ${String(reason?.message || reason || 'timed out').slice(0, 150)}`;
    const base = { status: 'failed', error, eventId: fallback?.calendar_event_id || null, booking: fallback };
    try {
      return await withDeadline(async () => {
        const { row } = await load(id);
        if (!row) return { ...base, error: `${error} (sync state not saved)` };
        const patch = { calendar_sync_status: 'failed', calendar_sync_error: error };
        let res;
        try { res = await db.update(id, patch, { expected: row }); } catch (err) { res = { error: err }; }
        if (res?.conflict) {
          return { ...base, error: `${error} (booking changed meanwhile; retry sync)`, eventId: row.calendar_event_id || null, booking: row };
        }
        if (res?.error || !res?.data) {
          return { ...base, error: `${error} (sync state not saved)`, eventId: row.calendar_event_id || null, booking: row };
        }
        return {
          ...base,
          eventId: res.data.calendar_event_id || null,
          booking: res.data,
          ...(res.persisted === false && { recorded: false }),
        };
      }, T.recordMs, 'record sync failure');
    } catch (err) {
      logger.error?.('[booking-lifecycle] could not record sync timeout:', err?.message || err);
      return { ...base, error: `${error} (sync state not saved)` };
    }
  }

  /** syncLatest under the total budget: always resolves, never leaves Google work running. */
  async function boundedSync(id, fallback, actor = 'admin') {
    const controller = new AbortController();
    try {
      const s = await withDeadline(() => syncLatest(id, { signal: controller.signal, actor }), T.syncMs, 'calendar sync', { controller });
      if (s !== ABORTED_SYNC) return s;
      return recordSyncTimeout(id, 'aborted', fallback);
    } catch (err) {
      if (!controller.signal.aborted) controller.abort(err);
      if (!isDeadlineError(err)) logger.error?.('[booking-lifecycle] calendar sync crashed:', err?.message || err);
      return recordSyncTimeout(id, err, fallback);
    }
  }

  async function finish({ booking, previous, noop = false }, { sync = true, notifyType = null, notifyExtra = {}, actor = 'admin' } = {}) {
    let calendarSync = null;
    let latest = booking;
    if (sync) {
      const s = await boundedSync(booking.id, booking, actor);
      calendarSync = syncView(s);
      if (s.booking) latest = s.booking;
    }
    const notifications = [];
    if (notifyType && !noop) {
      // Fix R5: a confirmation / reschedule email that a newer state change has already
      // superseded (cancelled meanwhile, rescheduled again) is not sent. Cancellation and
      // request-received emails always go. Check-then-send is not atomic: see runbook §10.
      let stale = false;
      if (notifyType === 'confirmed' || notifyType === 'rescheduled') {
        try {
          const cur = await withDeadline(() => load(booking.id), T.recordMs, 'notify recheck');
          stale = !!cur.row && !sameSnapshot(cur.row, booking);
        } catch { stale = false; }
      }
      notifications.push(stale
        ? { type: notifyType, ok: false, skipped: true, reason: 'superseded' }
        : await safeNotify(notifyType, { booking, previous, ...notifyExtra }));
    }
    return { success: true, booking: latest, calendarSync, notifications, ...(noop && { noop: true }) };
  }

  // ── Operations ──────────────────────────────────────────────────────────

  /**
   * Create a PENDING booking through the atomic reservation (Phase B, B2).
   * opts.idempotencyKeyHash: owner-scoped hash (reservation.idempotencyKeyHash) or null.
   * Result adds `duplicate:true` for a replay (same key, or same contact+date+time within 24 h):
   * the ORIGINAL booking, no calendar call, no email, no conversion.
   */
  async function create(request = {}, { idempotencyKeyHash = null } = {}) {
    const email = String(request.customer_email || '').trim();
    if (!email) return fail('invalid_input', 'Customer email is required', 400);
    const g = await gate.check({ date: request.preferred_date, time: request.preferred_time, actor: 'server' });
    if (!g.ok) return g;
    // Fix R15: the server picks the id and signs it, so this row provably came from
    // lifecycle.create() and not from a direct (anon) insert.
    const newId = randomUUID();
    const row = {
      ...request,
      id: newId,
      ownership_proof: ownership.signRow(newId),
      calendar_event_proof: null,
      customer_email: email,
      status: 'pending',
      revision: 1,
      calendar_event_id: null,
      calendar_sync_status: 'pending',
      calendar_sync_error: null,
    };
    if (typeof db.reserveCreate !== 'function') return fail('unavailable', RESERVATION_UNAVAILABLE_MESSAGE, 503);
    let res;
    try { res = await db.reserveCreate(row, g.slot, idempotencyKeyHash); } catch (err) { res = { error: err }; }
    if (res?.error || !res?.outcome) {
      logger.error?.('[booking-lifecycle] reservation failed:', sanitizeDbError(res?.error || 'no result'));
      return fail('unavailable', RESERVATION_UNAVAILABLE_MESSAGE, 503);
    }
    if (res.outcome === 'conflict') return gate.conflict(request.preferred_date, null, res.reason);
    if (res.outcome === 'replay') {
      if (!res.booking?.id) return fail('unavailable', RESERVATION_UNAVAILABLE_MESSAGE, 503);
      return { success: true, duplicate: true, booking: res.booking, calendarSync: null, notifications: [] };
    }
    if (res.outcome !== 'created' || !res.booking?.id) return fail('unavailable', RESERVATION_UNAVAILABLE_MESSAGE, 503);
    return finish({ booking: res.booking, previous: null }, { notifyType: 'created', actor: 'server' });
  }

  async function confirm(id) {
    const t = await transition(id, (row) => {
      if (TERMINAL_STATUSES.includes(row.status)) {
        return { error: fail('invalid_state', `Cannot confirm a ${row.status} booking`, 409) };
      }
      if (row.status === 'confirmed') return { noop: true };
      return { patch: { status: 'confirmed', calendar_sync_status: 'pending' } };
    });
    if (t.error) return t.error;
    return finish(t, { notifyType: 'confirmed', notifyExtra: { actor: 'admin' } });
  }

  /**
   * Reschedule through the atomic reservation (B2): the new interval is checked under the
   * resource lock with ONLY this booking's own old interval excluded, and the row is updated in
   * the same transaction (revision CAS). Conflict / stale / failure → nothing written, the
   * original booking stays exactly as it was.
   */
  async function reschedule(id, { date, time } = {}, actor = 'customer') {
    if (actor !== 'customer' && actor !== 'admin') return fail('invalid_input', 'Invalid actor', 400);
    if (!isValidDate(date)) return fail('invalid_input', 'Invalid or missing preferred_date', 400);
    if (time != null && time !== '' && !isValidTime(time)) {
      return fail('invalid_input', 'Invalid preferred_time', 400);
    }
    if (actor === 'customer' && date < torontoToday(now())) {
      return fail('invalid_input', 'Please choose a future date', 400);
    }
    const nextTime = time ? String(time).trim() : null;
    const nextStatus = actor === 'customer' ? 'pending' : 'confirmed';
    for (let attempt = 0; attempt < 2; attempt++) {
      const { row, error } = await load(id);
      if (error) return error;
      if (TERMINAL_STATUSES.includes(row.status)) return fail('invalid_state', `Cannot modify a ${row.status} booking`, 409);
      // Fix R6: identical request = no-op (no revision bump, no email, no reservation call).
      if (row.preferred_date === date && (row.preferred_time || null) === nextTime && row.status === nextStatus) {
        return finish({ previous: row, booking: row, noop: true }, { notifyType: 'rescheduled', actor });
      }
      const g = await gate.check({ date, time: nextTime, actor, excludeBookingId: row.id });
      if (!g.ok) return g;
      if (typeof db.reserveReschedule !== 'function') return fail('unavailable', RESERVATION_UNAVAILABLE_MESSAGE, 503);
      const patch = {
        preferred_date: date,
        preferred_time: nextTime,
        // Customer changes need admin re-confirmation; admin reschedules stay confirmed.
        status: nextStatus,
        calendar_sync_status: 'pending',
        revision: (Number(row.revision) || 0) + 1,
        updated_at: iso(),
      };
      let res;
      try { res = await db.reserveReschedule(id, row.revision, patch, g.slot); } catch (err) { res = { error: err }; }
      if (res?.error || !res?.outcome) {
        logger.error?.('[booking-lifecycle] reschedule reservation failed:', sanitizeDbError(res?.error || 'no result'));
        return fail('unavailable', RESERVATION_UNAVAILABLE_MESSAGE, 503);
      }
      if (res.outcome === 'stale') continue;
      if (res.outcome === 'not_found') return fail('not_found', 'Booking not found', 404);
      if (res.outcome === 'invalid_state') return fail('invalid_state', `Cannot modify a ${res.booking?.status || 'closed'} booking`, 409);
      if (res.outcome === 'conflict') return gate.conflict(date, row.id, res.reason);
      if (res.outcome !== 'updated' || !res.booking?.id) return fail('unavailable', RESERVATION_UNAVAILABLE_MESSAGE, 503);
      const out = await finish({ previous: row, booking: res.booking }, {
        notifyType: 'rescheduled',
        notifyExtra: { actor, oldDate: row.preferred_date, oldTime: row.preferred_time },
        actor,
      });
      return g.override ? { ...out, policyOverride: true } : out;
    }
    return fail('conflict', 'This booking was changed at the same time by someone else. Reload and try again.', 409);
  }

  async function cancel(id, reason = '', actor = 'customer') {
    if (actor !== 'customer' && actor !== 'admin') return fail('invalid_input', 'Invalid actor', 400);
    const cleanReason = String(reason || '').trim().slice(0, 1000);
    const t = await transition(id, (row) => {
      if (TERMINAL_STATUSES.includes(row.status)) {
        return { error: fail('invalid_state', `Cannot cancel a ${row.status} booking`, 409) };
      }
      const label = actor === 'customer' ? 'Customer cancelled' : 'Cancelled';
      const note = cleanReason ? `${label}: ${cleanReason}` : label;
      return {
        patch: {
          status: 'cancelled',
          notes: row.notes ? `${note}\n${row.notes}` : note,
          calendar_sync_status: 'pending',
        },
      };
    });
    if (t.error) return t.error;
    return finish(t, { notifyType: 'cancelled', notifyExtra: { actor, reason: cleanReason }, actor });
  }

  async function complete(id) {
    const t = await transition(id, (row) => {
      if (row.status === 'cancelled') {
        return { error: fail('invalid_state', 'Cannot complete a cancelled booking', 409) };
      }
      return { patch: { status: 'completed' } };
    });
    if (t.error) return t.error;
    return finish(t, { sync: false });
  }

  /** Re-run calendar reconciliation from current DB state. Never sends email. */
  async function retrySync(id) {
    const { row, error } = await load(id);
    if (error) return error;
    const s = await boundedSync(row.id, row);
    return {
      success: true,
      booking: s.booking || row,
      calendarSync: syncView(s),
      notifications: [],
    };
  }

  /**
   * Admin-only (fix R15): vouch for this row and its stored calendar event after
   * checking the event in Google Calendar. `eventId` must equal the stored id the
   * admin was shown. Writes the proofs only (no revision bump, no Google call, no email).
   * Historical rows are never trusted automatically.
   */
  async function trustCalendarEvent(id, { eventId } = {}) {
    if (!ownership.configured) return fail('invalid_state', 'BOOKING_OWNERSHIP_SECRET is not configured', 409);
    const { row, error } = await load(id);
    if (error) return error;
    const stored = row.calendar_event_id || null;
    if ((eventId || null) !== stored) {
      return fail('conflict', 'The booking\'s calendar event changed. Reload and check it again.', 409);
    }
    const patch = {
      ownership_proof: ownership.signRow(row.id),
      calendar_event_proof: stored && stored !== stableEventId(row.id) ? ownership.signEvent(row.id, stored) : null,
    };
    let res;
    try { res = await db.update(id, patch, { expected: row }); } catch (err) { res = { error: err }; }
    if (res?.conflict) return fail('conflict', 'This booking was changed at the same time. Reload and try again.', 409);
    if (res?.error || !res?.data || res?.persisted === false) {
      return fail('db_error', 'Could not save the verification (migration applied? store mode full?)', 500);
    }
    return { success: true, booking: res.data, calendarSync: null, notifications: [] };
  }

  /**
   * Admin-only explicit resolution (fix R7 provider contract): the admin has checked Google
   * Calendar by hand for any event of this booking. Clears the uncertain-create marker only if
   * it still has the value the admin was shown (a newer uncertain attempt is not cleared).
   * No Google call, no email. The admin then presses Retry.
   */
  async function resolveCalendarUncertainty(id, { marker } = {}) {
    const { row, error } = await load(id);
    if (error) return error;
    if (!row.calendar_op_started_at) return { success: true, booking: row, calendarSync: null, notifications: [], noop: true };
    if (!marker || marker !== row.calendar_op_started_at) {
      return fail('conflict', 'Another calendar attempt happened since you checked. Reload, check Google Calendar again, then resolve.', 409);
    }
    let res;
    try { res = await db.update(id, { calendar_op_started_at: null }, { opMarker: marker }); } catch (err) { res = { error: err }; }
    if (res?.conflict) return fail('conflict', 'Another calendar attempt happened since you checked. Reload and try again.', 409);
    if (res?.error || !res?.data || res?.persisted === false) return fail('db_error', 'Could not save the resolution', 500);
    return { success: true, booking: res.data, calendarSync: null, notifications: [] };
  }

  return { create, confirm, reschedule, cancel, complete, retrySync, trustCalendarEvent, resolveCalendarUncertainty, syncLatest };
}

export { HTTP as LIFECYCLE_HTTP_STATUS };
