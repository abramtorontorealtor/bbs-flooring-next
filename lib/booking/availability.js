/**
 * Real measurement availability (Phase B, B1). Pure core + injectable sources.
 *
 * Availability for a date = policy candidates (schedule-policy.js)
 *   minus live DB bookings (pending + confirmed; full interval + buffer)
 *   minus opaque Google events on the availability calendar(s) (timed or all-day)
 *   minus closures, then the optional daily cap.
 *
 * Rules (PLAN §3 B1):
 *  - Our own mirrored booking events are NOT counted twice: a Google event whose id is a
 *    booking's stored or stable id is ignored (the DB row already occupies the time).
 *  - Transparent ("free") and cancelled events never block.
 *  - A reschedule excludes only the authenticated booking (server resolves it from the token);
 *    there is no public excludeBookingId.
 *  - A live booking without a time (admin all-day) does not block a specific interval, but
 *    counts toward the daily cap.
 *  - Which Google calendars block measurement time is an OPEN policy decision, so none are read
 *    unless BOOKING_AVAILABILITY_CALENDAR_IDS is set. reliability:
 *      'full'    DB + every configured calendar checked
 *      'db_only' no calendar configured (DB bookings only)
 *      'partial' calendar configured but the read failed/timed out (DB-checked only)
 *    A calendar failure is NOT "fully booked". Every booking is a request that is confirmed by
 *    hand, so db_only/partial slots stay requestable; the UI must not show scarcity for them.
 *
 * Output contains no names, titles, event ids, calendar ids or tokens.
 */
import {
  candidateStarts, dateBookability, dayInterval, slotInterval, parseTime12, isIsoDate,
  resolveSchedulePolicy, formatTime12,
} from './schedule-policy.js';
import { stableEventId } from './calendar-sync.js';

const MINUTE = 60 * 1000;
export const LIVE = Object.freeze(['pending', 'confirmed']);

/** Occupied intervals from DB rows (live only, minus the excluded booking). */
export function bookingOccupancy(rows, date, policy, { excludeBookingId = null } = {}) {
  const timed = [];
  let untimed = 0;
  const ownEventIds = new Set();
  for (const r of rows || []) {
    if (!r) continue;
    const stable = r.id ? stableEventId(r.id) : null;
    // Event ids of EVERY booking row (even cancelled / excluded) are ours, never "external busy".
    if (stable) ownEventIds.add(stable);
    if (r.calendar_event_id) ownEventIds.add(String(r.calendar_event_id));
    if (excludeBookingId && r.id === excludeBookingId) continue;
    if (!LIVE.includes(r.status) || r.preferred_date !== date) continue;
    const iv = r.preferred_time ? slotInterval(date, r.preferred_time, policy) : null;
    if (iv) timed.push(iv); else untimed++;
  }
  return { timed, untimed, ownEventIds };
}

/** Normalise a Google events.list item → blocking interval, or null if it doesn't block. */
export function googleBusyInterval(ev, date, policy, ownEventIds = new Set()) {
  if (!ev || ev.status === 'cancelled' || ev.transparency === 'transparent') return null;
  if (ev.id && ownEventIds.has(String(ev.id))) return null;
  // Recurring instances of our own events carry recurringEventId; ours are never recurring,
  // but be safe.
  if (ev.recurringEventId && ownEventIds.has(String(ev.recurringEventId))) return null;
  const day = dayInterval(date, policy);
  if (ev.start?.date && ev.end?.date) {
    // All-day: exclusive end date. Blocks every local day in [start, end).
    if (ev.start.date <= date && date < ev.end.date) return { start: day.start, end: day.end };
    return null;
  }
  const s = Date.parse(ev.start?.dateTime || '');
  const e = Date.parse(ev.end?.dateTime || '');
  if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) return null;
  if (e <= day.start || s >= day.end) return null;
  return { start: s, end: e };
}

const overlaps = (a, b, padMs) => a.start < b.end + padMs && b.start < a.end + padMs;

/**
 * Pure availability for one date.
 * @returns {{ date, status, reliability, slots:[{id,time,start,end}], reason? }}
 *   status: 'ok' | 'closed'   reliability: 'full' | 'db_only' | 'partial'
 */
export function computeAvailability({
  date, policy = resolveSchedulePolicy(), nowMs, bookings = [], googleEvents = null,
  excludeBookingId = null, reliability = googleEvents ? 'full' : 'db_only',
}) {
  const day = dateBookability(date, policy, nowMs);
  if (!day.ok) return { date, status: 'closed', reason: day.reason, reliability, slots: [] };
  const pad = (policy.bufferMinutes || 0) * MINUTE;
  const occ = bookingOccupancy(bookings, date, policy, { excludeBookingId });
  const busy = [...occ.timed];
  for (const ev of googleEvents || []) {
    const iv = googleBusyInterval(ev, date, policy, occ.ownEventIds);
    if (iv) busy.push(iv);
  }
  const booked = occ.timed.length + occ.untimed;
  if (policy.dailyCap != null && booked >= policy.dailyCap) {
    return { date, status: 'ok', reliability, slots: [], reason: 'cap_reached' };
  }
  const slots = candidateStarts(date, policy, nowMs)
    .filter((c) => !busy.some((b) => overlaps(c, b, pad)))
    .map((c) => ({
      id: `${date}T${String(Math.floor(c.minutes / 60)).padStart(2, '0')}${String(c.minutes % 60).padStart(2, '0')}`,
      time: formatTime12(c.minutes),
      start: new Date(c.start).toISOString(),
      end: new Date(c.end).toISOString(),
    }));
  return { date, status: 'ok', reliability, slots };
}

/** Does `time` on `date` appear in an availability result? */
export function isSlotOffered(result, time) {
  const m = parseTime12(time);
  return m != null && result.slots.some((s) => parseTime12(s.time) === m);
}

/**
 * Service: loads sources, bounded, and computes. Sources are injected:
 *   listBookingsForDate(date) → rows (id,status,preferred_date,preferred_time,calendar_event_id)
 *   listGoogleEvents({ timeMin, timeMax, signal }) → { ok:true, events } | { ok:false }
 * A DB failure → { status:'unavailable' } (nothing is offered as free). A Google failure →
 * reliability:'partial' (DB-checked slots only). listBookingsForDate must return EVERY row on
 * that date (any status) so their event ids are recognised as ours, not external busy time.
 */
export function createAvailabilityService({
  listBookingsForDate, listGoogleEvents = null, policy = resolveSchedulePolicy(),
  now = () => Date.now(), googleBudgetMs = 3000, logger = console,
}) {
  async function forDate(date, { excludeBookingId = null } = {}) {
    if (!isIsoDate(date)) return { date, status: 'invalid', slots: [], reliability: 'partial' };
    const nowMs = now();
    const bk = dateBookability(date, policy, nowMs);
    if (!bk.ok) return { date, status: 'closed', reason: bk.reason, reliability: 'full', slots: [] };
    const base = listGoogleEvents ? 'partial' : 'db_only';

    let bookings;
    try {
      bookings = await listBookingsForDate(date);
      if (!Array.isArray(bookings)) throw new Error('bookings read returned no rows array');
    } catch (err) {
      logger.error?.('[availability] bookings read failed:', String(err?.message || err).slice(0, 200));
      return { date, status: 'unavailable', reliability: base, slots: [] };
    }

    let googleEvents = null;
    if (listGoogleEvents) {
      const day = dayInterval(date, policy);
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), googleBudgetMs);
      try {
        const r = await Promise.race([
          listGoogleEvents({ timeMin: new Date(day.start).toISOString(), timeMax: new Date(day.end).toISOString(), signal: ctrl.signal }),
          new Promise((resolve) => ctrl.signal.addEventListener('abort', () => resolve({ ok: false, error: 'timeout' }), { once: true })),
        ]);
        if (r?.ok && Array.isArray(r.events)) googleEvents = r.events;
        else logger.warn?.('[availability] calendar read failed → partial:', String(r?.error || 'unknown').slice(0, 200));
      } catch (err) {
        logger.warn?.('[availability] calendar read threw → partial:', String(err?.message || err).slice(0, 200));
      } finally {
        clearTimeout(timer);
      }
    }
    return computeAvailability({
      date, policy, nowMs, bookings, googleEvents, excludeBookingId,
      reliability: googleEvents ? 'full' : base,
    });
  }
  return { forDate, policy };
}

/** Public DTO: slot ids/times/instants + status only. */
export function publicAvailabilityView(r) {
  return {
    date: r.date,
    timeZone: 'America/Toronto',
    status: r.status,
    reliability: r.reliability,
    ...(r.reason && { reason: r.reason }),
    slots: (r.slots || []).map((s) => ({ id: s.id, time: s.time, start: s.start, end: s.end })),
  };
}
