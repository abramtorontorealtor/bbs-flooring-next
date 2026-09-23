/**
 * Real measurement availability (Phase B, B1). Pure core + injectable, bounded sources.
 *
 * Availability for a date = policy candidates (schedule-policy.js)
 *   minus live DB bookings (pending + confirmed; full interval + buffer; adjacent dates included
 *         so a long visit/buffer crossing midnight still blocks)
 *   minus opaque Google events on the configured availability calendar(s)
 *   minus closures, then the optional daily cap (counted on the booking's own local date).
 *
 * Rules (PLAN §3 B1, review phaseB-B1-review.md):
 *  - A live booking WITHOUT a usable time (admin all-day, unparseable legacy text) occupies its whole
 *    local day (B1-R2). It is never silently free.
 *  - Our own booking events are ignored as Google busy time, because the DB row is the authority. An
 *    event is "ours" only if a booking row PROVABLY owns it, using Phase A's HMAC rules
 *    (ownership.js; B1-recheck B0): the stable id of a row with a valid ownership_proof, or a stored
 *    non-stable id with a valid calendar_event_proof. This holds across dates/statuses (a stale event
 *    left behind by a failed move is not phantom occupancy; B1-R3). Prefix or an unsigned row claim
 *    never proves ownership: such events stay busy (conservative; historical rows become trusted only
 *    through the admin Verify action).
 *  - Transparent ("free") and cancelled events never block. Offsetless dateTimes use the event's own
 *    timeZone, then the calendar's, then Toronto, never the server zone. All-day dates use the
 *    calendar's zone (B1-R5). An opaque event whose times can't be read degrades reliability.
 *  - A reschedule excludes only the authenticated booking (server resolves it from the token).
 *  - Reliability: 'full' (DB + every configured calendar read and understood), 'db_only' (no calendar
 *    configured), 'partial' (a calendar read failed / an event was unreadable / ownership unresolved),
 *    'not_checked' (policy alone ruled the date out: closed day, nothing past the notice window).
 *    Blocks from calendars that DID answer are always applied (B1-R8). A calendar failure is never
 *    "fully booked"; a DB failure never offers anything (status 'unavailable'). db_only/partial slots
 *    stay requestable (every booking is confirmed by hand) but must never drive scarcity copy.
 *
 * Output contains no names, titles, event ids, calendar ids or tokens.
 */
import {
  candidateStarts, dateBookability, dayInterval, slotInterval, parseTime12, isIsoDate,
  resolveSchedulePolicy, formatTime12, addDaysIso, parseZonedDateTime, BOOKING_TIME_ZONE,
} from './schedule-policy.js';
import { stableEventId } from './calendar-sync.js';
import { withDeadline } from './deadline.js';
import { createOwnership } from './ownership.js';

const MINUTE = 60 * 1000;
export const LIVE = Object.freeze(['pending', 'confirmed']);
const STABLE_ID_RE = /^bbs([0-9a-f]{32})$/;

/** 'bbs' + 32 hex → the booking UUID it was derived from (null otherwise). */
export function bookingIdFromStableEventId(eventId) {
  const m = typeof eventId === 'string' && eventId.match(STABLE_ID_RE);
  if (!m) return null;
  const h = m[1];
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/**
 * Event ids PROVABLY owned by these rows (any status/date). Needs ownership_proof /
 * calendar_event_proof on the rows. Stable id ← valid row proof; stored non-stable id ← valid event proof.
 */
export function ownedEventIdsOf(rows, ownership) {
  const out = new Set();
  if (!ownership) return out;
  for (const r of rows || []) {
    if (!r?.id) continue;
    const stable = stableEventId(r.id);
    const rowOk = ownership.verifyRow(r);
    if (stable && rowOk) out.add(stable);
    const stored = r.calendar_event_id ? String(r.calendar_event_id) : null;
    if (stored && ((stored === stable && rowOk) || (stored !== stable && ownership.verifyEvent(r, stored)))) out.add(stored);
  }
  return out;
}

/** Occupied intervals from live DB rows (any date; minus the excluded booking) + cap count for `date`. */
export function bookingOccupancy(rows, date, policy, { excludeBookingId = null } = {}) {
  const intervals = [];
  let countOnDate = 0;
  for (const r of rows || []) {
    if (!r || (excludeBookingId && r.id === excludeBookingId)) continue;
    if (!LIVE.includes(r.status) || !isIsoDate(r.preferred_date)) continue;
    const iv = r.preferred_time ? slotInterval(r.preferred_date, r.preferred_time, policy) : null;
    intervals.push(iv || dayInterval(r.preferred_date, policy)); // untimed/unreadable → whole day
    if (r.preferred_date === date) countOnDate++;
  }
  return { intervals, countOnDate };
}

/**
 * Google events.list item → { interval } | { ignore:true } | { unreadable:true }.
 * `ev.calendarTimeZone` (set by the adapter) is the owning calendar's zone.
 */
export function googleBusyInterval(ev, policy, ownEventIds = new Set()) {
  if (!ev || ev.status === 'cancelled' || ev.transparency === 'transparent') return { ignore: true };
  if (ev.id && ownEventIds.has(String(ev.id))) return { ignore: true };
  if (ev.recurringEventId && ownEventIds.has(String(ev.recurringEventId))) return { ignore: true };
  const calTz = ev.calendarTimeZone || policy.timeZone || BOOKING_TIME_ZONE;
  const sd = ev.start?.date; const ed = ev.end?.date;
  if (sd || ed) {
    if (!isIsoDate(sd)) return { unreadable: true };
    const endDate = isIsoDate(ed) && ed > sd ? ed : addDaysIso(sd, 1); // exclusive end; missing → 1 day
    try {
      return { interval: { start: dayInterval(sd, { ...policy, timeZone: calTz }).start, end: dayInterval(addDaysIso(endDate, -1), { ...policy, timeZone: calTz }).end } };
    } catch { return { unreadable: true }; }
  }
  const s = parseZonedDateTime(ev.start?.dateTime, ev.start?.timeZone || calTz);
  const e = parseZonedDateTime(ev.end?.dateTime, ev.end?.timeZone || ev.start?.timeZone || calTz);
  if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) return { unreadable: true };
  return { interval: { start: s, end: e } };
}

/** Half-open overlap with a single travel gap `padMs` required on either side. */
const overlaps = (a, b, padMs) => a.start < b.end + padMs && b.start < a.end + padMs;

/** Window [min, max) that any blocking interval must intersect to matter for `date`'s candidates. */
export function queryEnvelope(date, policy, nowMs) {
  const c = candidateStarts(date, policy, nowMs);
  if (c.length === 0) return null;
  const pad = (policy.bufferMinutes || 0) * MINUTE;
  return { start: c[0].start - pad, end: c[c.length - 1].end + pad };
}

/** DB dates whose bookings can reach `date`'s candidates (duration ≤ 8 h, buffer ≤ 4 h → ±1 day). */
export function occupancyDates(date) {
  return [addDaysIso(date, -1), date, addDaysIso(date, 1)];
}

/**
 * Pure availability for one date.
 * @returns {{ date, status, reliability, slots:[{id,time,start,end}], reason? }}
 */
export function computeAvailability({
  date, policy = resolveSchedulePolicy(), nowMs, bookings = [], googleEvents = null,
  ownEventIds = null, excludeBookingId = null, reliability, ownership = null,
}) {
  let rel = reliability || (googleEvents ? 'full' : 'db_only');
  // Policy-only answers read no source: reliability 'not_checked' (B1-recheck N1). A closed day is
  // never "fully booked" and must not drive scarcity copy.
  const day = dateBookability(date, policy, nowMs);
  if (!day.ok) return { date, status: 'closed', reason: day.reason, reliability: 'not_checked', slots: [] };
  if (candidateStarts(date, policy, nowMs).length === 0) {
    return { date, status: 'closed', reason: 'notice', reliability: 'not_checked', slots: [] };
  }
  const pad = (policy.bufferMinutes || 0) * MINUTE;
  const occ = bookingOccupancy(bookings, date, policy, { excludeBookingId });
  const own = new Set([...ownedEventIdsOf(bookings, ownership), ...(ownEventIds || [])]);
  const busy = [...occ.intervals];
  for (const ev of googleEvents || []) {
    const g = googleBusyInterval(ev, policy, own);
    if (g.interval) busy.push(g.interval);
    else if (g.unreadable) rel = 'partial';
  }
  if (policy.dailyCap != null && occ.countOnDate >= policy.dailyCap) {
    return { date, status: 'ok', reliability: rel, slots: [], reason: 'cap_reached' };
  }
  const slots = candidateStarts(date, policy, nowMs)
    .filter((c) => !busy.some((b) => overlaps(c, b, pad)))
    .map((c) => ({
      id: `${date}T${String(Math.floor(c.minutes / 60)).padStart(2, '0')}${String(c.minutes % 60).padStart(2, '0')}`,
      time: formatTime12(c.minutes),
      start: new Date(c.start).toISOString(),
      end: new Date(c.end).toISOString(),
    }));
  return { date, status: 'ok', reliability: rel, slots };
}

/** Does `time` on `date` appear in an availability result? */
export function isSlotOffered(result, time) {
  const m = parseTime12(time);
  return m != null && (result?.slots || []).some((s) => parseTime12(s.time) === m);
}

const quiet = (err) => {
  const code = err?.code || err?.name || 'error';
  return String(code).replace(/[^A-Za-z0-9_.-]/g, '').slice(0, 40) || 'error';
};

/**
 * Service with bounded, injectable sources:
 *   listLiveBookings({ dates, signal }) → rows (id,status,preferred_date,preferred_time,calendar_event_id)
 *       Must return EVERY live row on those dates or throw (truncation = throw).
 *   resolveOwnedEventIds({ eventIds, signal }) → Set|array of the given ids that a booking row owns
 *       (any date/status). Optional; missing or failing → reliability 'partial' and ids treated as busy.
 *   listGoogleEvents({ timeMin, timeMax, signal, collect }) → { ok, events, partial? } (events carry
 *       calendarTimeZone). `collect(events)` may be called as each calendar/page arrives, so blocks
 *       already known survive an outer timeout (B1-recheck S1).
 * DB read failure/timeout/truncation → status 'unavailable' (nothing offered).
 */
export function createAvailabilityService({
  listLiveBookings, resolveOwnedEventIds = null, listGoogleEvents = null,
  policy = resolveSchedulePolicy(), now = () => Date.now(),
  dbBudgetMs = 2500, googleBudgetMs = 3000, logger = console, ownership = createOwnership(),
}) {
  async function bounded(fn, ms, label) {
    const controller = new AbortController();
    return withDeadline(() => fn(controller.signal), ms, label, { controller });
  }

  async function forDate(date, { excludeBookingId = null } = {}) {
    if (!isIsoDate(date)) return { date, status: 'invalid', slots: [], reliability: 'partial' };
    const nowMs = now();
    const bk = dateBookability(date, policy, nowMs);
    if (!bk.ok) return { date, status: 'closed', reason: bk.reason, reliability: 'not_checked', slots: [] };
    const base = listGoogleEvents ? 'partial' : 'db_only';
    const env = queryEnvelope(date, policy, nowMs);
    if (!env) return computeAvailability({ date, policy, nowMs });

    let bookings;
    try {
      bookings = await bounded((signal) => listLiveBookings({ dates: occupancyDates(date), signal }), dbBudgetMs, 'bookings read');
      if (!Array.isArray(bookings)) throw Object.assign(new Error('non-array'), { code: 'bad_shape' });
    } catch (err) {
      logger.error?.('[availability] bookings read failed:', quiet(err));
      return { date, status: 'unavailable', reliability: base, slots: [] };
    }

    let googleEvents = null;
    let reliability = listGoogleEvents ? 'full' : 'db_only';
    let ownEventIds = null;
    if (listGoogleEvents) {
      const collected = [];
      const collect = (evs) => { if (Array.isArray(evs)) collected.push(...evs); };
      try {
        const r = await bounded((signal) => listGoogleEvents({
          timeMin: new Date(env.start).toISOString(), timeMax: new Date(env.end).toISOString(), signal, collect,
        }), googleBudgetMs, 'calendar read');
        const evs = Array.isArray(r?.events) ? r.events : null;
        googleEvents = evs && evs.length >= collected.length ? evs : collected;
        // Malformed "success" (no events array) is never a verified empty calendar (S4).
        if (!r?.ok || r?.partial || !evs) {
          reliability = 'partial';
          logger.warn?.('[availability] calendar read incomplete → partial:', quiet({ code: r?.code || 'failed' }));
        }
      } catch (err) {
        googleEvents = collected; // keep blocks already received (S1)
        reliability = 'partial';
        logger.warn?.('[availability] calendar read failed → partial:', quiet(err));
      }
      // Ownership of returned ids, across all dates/statuses (B1-R3), proof-verified (B0).
      const known = ownedEventIdsOf(bookings, ownership);
      const unknown = [...new Set((googleEvents || []).flatMap((e) => [e.id, e.recurringEventId]).filter((x) => x && !known.has(String(x))))];
      if (unknown.length > 0) {
        if (!resolveOwnedEventIds) reliability = 'partial';
        else {
          try {
            const owned = await bounded((signal) => resolveOwnedEventIds({ eventIds: unknown, signal }), dbBudgetMs, 'ownership read');
            if (!owned || typeof owned[Symbol.iterator] !== 'function') throw Object.assign(new Error('bad'), { code: 'bad_shape' });
            ownEventIds = new Set([...owned].map(String));
          } catch (err) {
            reliability = 'partial'; // unresolved ids stay busy (conservative)
            logger.warn?.('[availability] ownership read failed → partial:', quiet(err));
          }
        }
      }
    }
    return computeAvailability({ date, policy, nowMs, bookings, googleEvents, ownEventIds, excludeBookingId, reliability, ownership });
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
