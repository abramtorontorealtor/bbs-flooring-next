/**
 * Phase B, B3: shared buyer picker model. Pure and client-safe (no React, no node imports).
 * Consumed by components/booking/SlotPicker.jsx in FreeMeasurementClient, QuoteBookingClient and
 * ViewBookingClient, so all three show the same real availability and copy.
 *
 * Rules (PLAN.md B3):
 *  - Up to 3 earliest valid starts in chronological order; "See more times" reveals the rest.
 *    Never hide a free choice as booked; show fewer if fewer exist.
 *  - No scarcity copy anywhere (numeric scarcity OFF). Loading/error states use neutral text.
 *  - All times are labelled ET. Dates are 'YYYY-MM-DD' strings built from calendar components,
 *    never from browser-local Date → ISO conversion (no locale day shift).
 *  - A selected time that is no longer offered (date change, refresh, 409) is cleared; contact
 *    details are never touched by the picker.
 */
import {
  DEFAULT_SCHEDULE_POLICY, BOOKING_TIME_ZONE, dateBookability, candidateStarts, localDateOf, addDaysIso, isIsoDate,
} from './schedule-policy.js';

export const PRIMARY_COUNT = 3;

export const BOOKING_COPY = Object.freeze({
  h1: 'Free In-Home Flooring Consultation & Measurement',
  support: 'Dedicated time for your flooring project. Get professional measurements, discuss installation, and understand your flooring options.',
  reassurance: 'Free. No obligation.',
  chooseTime: 'Choose a preferred appointment time',
  seeMore: 'See more times',
  seeFewer: 'Show fewer times',
  submit: 'Request My Free Consultation',
  submitting: 'Sending your request…',
  alreadyRequested: 'We already have your request for this time, so nothing new was booked. To change it, use the link in your email.',
  success: "Your request is in. We'll confirm your appointment by email.",
  timeZoneNote: 'All times are Eastern Time (ET).',
  loading: 'Checking times…',
  none: 'No online times are open on this date. Please choose another date, or ask us for a different time.',
  closed: 'We don\'t book online appointments on this date. Please choose another date.',
  unavailable: 'We couldn\'t load times right now. Please try again, call (647) 428-1111, or ask us for a different time.',
  partial: 'Some calendar information couldn\'t be checked. We\'ll confirm your time by email.',
  alternate: 'None of these times work?',
  alternateCta: 'Ask for a different time',
  phone: '(647) 428-1111',
  phoneHref: 'tel:6474281111',
});

/** 'YYYY-MM-DD' from a calendar cell Date using its LOCAL components (what the user tapped). */
export function isoFromCalendarDate(d) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return null;
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/**
 * Coarse client-side date disabling (weekday/closure/horizon/notice-day). The server is the
 * authority: a date allowed here may still come back closed/empty from the availability API.
 */
export function isCalendarDateDisabled(d, nowMs = Date.now(), policy = DEFAULT_SCHEDULE_POLICY) {
  const iso = isoFromCalendarDate(d);
  if (!iso) return true;
  const today = localDateOf(nowMs, policy.timeZone || BOOKING_TIME_ZONE);
  if (iso <= today) return true; // same-day never has 24 h notice
  if (!dateBookability(iso, policy, nowMs).ok) return true;
  return candidateStarts(iso, policy, nowMs).length === 0; // every start inside the notice window
}

/** First date the coarse filter allows (for the calendar's initial month only; no claims shown). */
export function firstCandidateDate(nowMs = Date.now(), policy = DEFAULT_SCHEDULE_POLICY) {
  let d = addDaysIso(localDateOf(nowMs, policy.timeZone || BOOKING_TIME_ZONE), 1);
  for (let i = 0; i < 120; i++, d = addDaysIso(d, 1)) if (dateBookability(d, policy, nowMs).ok && candidateStarts(d, policy, nowMs).length) return d;
  return null;
}

/** Normalise an availability API body / 409 `availability` object into picker state. */
export function pickerView(result, { expanded = false, loading = false, error = false } = {}) {
  if (loading) return { state: 'loading', message: BOOKING_COPY.loading, primary: [], more: [], hasMore: false };
  if (error || !result) return { state: 'unavailable', message: BOOKING_COPY.unavailable, primary: [], more: [], hasMore: false };
  if (result.status === 'unavailable') return { state: 'unavailable', message: BOOKING_COPY.unavailable, primary: [], more: [], hasMore: false };
  if (result.status === 'closed') return { state: 'closed', message: BOOKING_COPY.closed, primary: [], more: [], hasMore: false };
  const slots = [...(result.slots || [])]
    .filter((s) => s && typeof s.time === 'string')
    .sort((a, b) => (a.start && b.start ? Date.parse(a.start) - Date.parse(b.start) : 0));
  if (!slots.length) return { state: 'none', message: BOOKING_COPY.none, primary: [], more: [], hasMore: false };
  const primary = slots.slice(0, PRIMARY_COUNT);
  const rest = slots.slice(PRIMARY_COUNT);
  return {
    state: 'ready',
    message: result.reliability === 'partial' ? BOOKING_COPY.partial : null,
    primary,
    more: expanded ? rest : [],
    hasMore: rest.length > 0,
    total: slots.length,
  };
}

/** Keep the selected time only if it is still offered in `result` for `date`. */
export function reconcileSelection(selectedTime, result, date) {
  if (!selectedTime || !result || result.date !== date) return '';
  return (result.slots || []).some((s) => s.time === selectedTime) ? selectedTime : '';
}

/** Human date line for the success / manage screens (from the ISO string; no locale shift). */
export function formatBookingDate(iso) {
  if (!isIsoDate(iso)) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${days[wd]}, ${months[m - 1]} ${d}, ${y}`;
}

/** Interpret a booking submit/reschedule response that failed, for the picker. */
export function submitFailure(status, body) {
  if (status === 409 && body?.code === 'slot_unavailable') {
    return { kind: 'slot_taken', message: body.error || 'That time was just taken. Please choose another time.', availability: body.availability || null };
  }
  if (status === 400 && body?.code === 'invalid_slot') return { kind: 'invalid_slot', message: body.error || 'Please choose another time.' };
  if (status === 503 || status === 429) return { kind: 'retry', message: body?.error || 'Please try again in a moment, or call (647) 428-1111.' };
  return { kind: 'error', message: 'Something went wrong. Please try again or call (647) 428-1111.' };
}

/** Per-form idempotency key (reused across retries/double-clicks of the SAME request). */
export function newIdempotencyKey() {
  const c = typeof globalThis !== 'undefined' ? globalThis.crypto : null;
  if (c?.randomUUID) return c.randomUUID().replace(/-/g, '');
  let s = '';
  for (let i = 0; i < 32; i++) s += Math.floor(Math.random() * 16).toString(16);
  return s;
}

/**
 * R-B2-REPLAY: the date/time to show after a successful submit = what the SERVER saved
 * (`booking` in the response). A replay of an earlier request may carry a different slot than the
 * form now shows; `changed` flags that so the UI can say so. Without a server slot, show no time.
 */
export function savedSlotFromResponse(data, form = {}) {
  const b = data?.booking;
  if (b && isIsoDate(b.preferred_date)) {
    const changed = b.preferred_date !== form.preferred_date || (b.preferred_time || '') !== (form.preferred_time || '');
    return { date: b.preferred_date, time: b.preferred_time || '', changed };
  }
  return null;
}
