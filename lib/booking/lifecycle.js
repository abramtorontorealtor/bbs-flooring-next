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
 *
 *  calendar (./calendar-sync.js createCalendarSync()):
 *    ensureEvent(row) / deleteEvent(row) → { ok, eventId, status:'synced'|'failed'|'absent', error }
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
 *                       Cleared only after acknowledged delete / confirmed absent.
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

import { resolveBookingTimeouts, withDeadline, isDeadlineError } from './deadline.js';

export const LIVE_STATUSES = Object.freeze(['pending', 'confirmed']);
const TERMINAL_STATUSES = Object.freeze(['cancelled', 'completed']);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
const MAX_SYNC_PASSES = 3;
const ABORTED_SYNC = Symbol('aborted-sync');

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

function sanitizeDbError(error) {
  const msg = String(error?.message || error || 'database error');
  return msg.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]').slice(0, 200);
}

export function createBookingLifecycle({
  db, calendar, notify, now = () => new Date(), logger = console, timeouts = {},
}) {
  if (!db || !calendar) throw new Error('createBookingLifecycle: db and calendar are required');
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
  async function syncLatest(id, { signal } = {}) {
    let last = null;
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
      let r;
      try {
        r = live ? await calendar.ensureEvent(row, { signal }) : await calendar.deleteEvent(row, { signal });
      } catch (err) {
        r = { ok: false, eventId: null, status: 'failed', error: String(err?.message || err).slice(0, 200) };
      }
      // Budget ran out while Google was busy: the caller has already recorded the
      // timeout and answered. Write nothing, so a late pass cannot overwrite newer state.
      if (signal?.aborted) return ABORTED_SYNC;

      const patch = r.ok
        ? {
            calendar_event_id: live ? r.eventId : null,
            calendar_sync_status: 'synced',
            calendar_sync_error: null,
            calendar_synced_at: iso(),
          }
        : { calendar_sync_status: 'failed', calendar_sync_error: r.error || 'calendar sync failed' };
      // Keep the stored id on failure (never lose a handle to a live event),
      // except when a live create just succeeded under a new id.

      let res;
      try { res = await db.update(id, patch, { expected: row }); } catch (err) { res = { error: err }; }
      if (res?.conflict) continue; // row changed while we talked to Google → reconcile latest
      if (res?.error) {
        logger.error?.('[booking-lifecycle] failed to persist sync state:', sanitizeDbError(res.error));
        return {
          status: r.ok ? 'synced' : 'failed',
          error: r.ok ? 'calendar updated but sync state not saved' : r.error,
          eventId: r.ok ? (live ? r.eventId : null) : row.calendar_event_id || null,
          booking: { ...row, ...patch },
        };
      }
      const booking = res?.data || { ...row, ...patch };
      return {
        status: r.ok ? (live ? 'synced' : 'absent') : 'failed',
        error: r.ok ? null : r.error,
        eventId: booking.calendar_event_id || null,
        booking,
      };
    }
    return {
      status: 'pending',
      error: 'booking kept changing during calendar sync; the latest change will sync',
      eventId: last?.calendar_event_id || null,
      booking: last,
    };
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
        return { ...base, eventId: res.data.calendar_event_id || null, booking: res.data };
      }, T.recordMs, 'record sync failure');
    } catch (err) {
      logger.error?.('[booking-lifecycle] could not record sync timeout:', err?.message || err);
      return { ...base, error: `${error} (sync state not saved)` };
    }
  }

  /** syncLatest under the total budget: always resolves, never leaves Google work running. */
  async function boundedSync(id, fallback) {
    const controller = new AbortController();
    try {
      const s = await withDeadline(() => syncLatest(id, { signal: controller.signal }), T.syncMs, 'calendar sync', { controller });
      if (s !== ABORTED_SYNC) return s;
      return recordSyncTimeout(id, 'aborted', fallback);
    } catch (err) {
      if (!controller.signal.aborted) controller.abort(err);
      if (!isDeadlineError(err)) logger.error?.('[booking-lifecycle] calendar sync crashed:', err?.message || err);
      return recordSyncTimeout(id, err, fallback);
    }
  }

  async function finish({ booking, previous }, { sync = true, notifyType = null, notifyExtra = {} } = {}) {
    let calendarSync = null;
    let latest = booking;
    if (sync) {
      const s = await boundedSync(booking.id, booking);
      calendarSync = { status: s.status, error: s.error, eventId: s.eventId };
      if (s.booking) latest = s.booking;
    }
    const notifications = [];
    if (notifyType) {
      // Notify with the state this operation persisted (not a later one).
      notifications.push(await safeNotify(notifyType, { booking, previous, ...notifyExtra }));
    }
    return { success: true, booking: latest, calendarSync, notifications };
  }

  // ── Operations ──────────────────────────────────────────────────────────

  async function create(request = {}) {
    const email = String(request.customer_email || '').trim();
    if (!email) return fail('invalid_input', 'Customer email is required', 400);
    if (request.preferred_date && !isValidDate(request.preferred_date)) {
      return fail('invalid_input', 'Invalid preferred_date', 400);
    }
    const row = {
      ...request,
      customer_email: email,
      status: 'pending',
      revision: 1,
      calendar_event_id: null,
      calendar_sync_status: 'pending',
      calendar_sync_error: null,
    };
    delete row.id;
    let res;
    try { res = await db.insert(row); } catch (err) { res = { error: err }; }
    if (res?.error || !res?.data?.id) {
      logger.error?.('[booking-lifecycle] insert failed:', sanitizeDbError(res?.error || 'no row returned'));
      return fail('db_error', 'We could not save your request. Please try again or call us.', 500);
    }
    return finish({ booking: res.data, previous: null }, { notifyType: 'created' });
  }

  async function confirm(id) {
    const t = await transition(id, (row) => {
      if (TERMINAL_STATUSES.includes(row.status)) {
        return { error: fail('invalid_state', `Cannot confirm a ${row.status} booking`, 409) };
      }
      return { patch: { status: 'confirmed', calendar_sync_status: 'pending' } };
    });
    if (t.error) return t.error;
    return finish(t, { notifyType: 'confirmed', notifyExtra: { actor: 'admin' } });
  }

  async function reschedule(id, { date, time } = {}, actor = 'customer') {
    if (actor !== 'customer' && actor !== 'admin') return fail('invalid_input', 'Invalid actor', 400);
    if (!isValidDate(date)) return fail('invalid_input', 'Invalid or missing preferred_date', 400);
    if (time != null && time !== '' && !isValidTime(time)) {
      return fail('invalid_input', 'Invalid preferred_time', 400);
    }
    if (actor === 'customer' && date < torontoToday(now())) {
      return fail('invalid_input', 'Please choose a future date', 400);
    }
    const t = await transition(id, (row) => {
      if (TERMINAL_STATUSES.includes(row.status)) {
        return { error: fail('invalid_state', `Cannot modify a ${row.status} booking`, 409) };
      }
      return {
        patch: {
          preferred_date: date,
          preferred_time: time ? String(time).trim() : null,
          // Customer changes need admin re-confirmation; admin reschedules stay confirmed.
          status: actor === 'customer' ? 'pending' : 'confirmed',
          calendar_sync_status: 'pending',
        },
      };
    });
    if (t.error) return t.error;
    return finish(t, {
      notifyType: 'rescheduled',
      notifyExtra: { actor, oldDate: t.previous.preferred_date, oldTime: t.previous.preferred_time },
    });
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
    return finish(t, { notifyType: 'cancelled', notifyExtra: { actor, reason: cleanReason } });
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
      calendarSync: { status: s.status, error: s.error, eventId: s.eventId },
      notifications: [],
    };
  }

  return { create, confirm, reschedule, cancel, complete, retrySync, syncLatest };
}

export { HTTP as LIFECYCLE_HTTP_STATUS };
