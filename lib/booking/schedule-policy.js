/**
 * Measurement scheduling policy (Phase B, B1). Pure: no I/O, and nothing depends on the
 * server's or browser's time zone. Every wall-clock value is America/Toronto.
 *
 * Defaults keep the CURRENT site behaviour (FreeMeasurementClient / QuoteBookingClient /
 * ViewBookingClient as of be5ae15): 7 start times, Mon–Sat, 24 h notice, 60-day picker,
 * 1-hour visits. Horizon (B1-R11): PLAN said "three calendar months", but all three live pickers
 * disable dates > 60 days after today (FreeMeasurementClient:403, QuoteBookingClient:442,
 * ViewBookingClient:364). The source-backed 60 days is kept; PLAN corrected. These are the baseline, not newly approved business policy.
 * Open policy decisions (Abram): duration, travel buffer, whether 5:00 PM stays, a real daily cap,
 * which calendar(s) block measurement time. Until decided: buffer 0, no cap.
 *
 * Env overrides (all optional, invalid values ignored):
 *   BOOKING_DURATION_MINUTES, BOOKING_BUFFER_MINUTES, BOOKING_DAILY_CAP,
 *   BOOKING_HORIZON_DAYS, BOOKING_CLOSED_DATES (comma-separated YYYY-MM-DD)
 */

export const BOOKING_TIME_ZONE = 'America/Toronto';

export const DEFAULT_SCHEDULE_POLICY = Object.freeze({
  timeZone: BOOKING_TIME_ZONE,
  candidateTimes: Object.freeze(['11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '5:00 PM']),
  weekdays: Object.freeze([1, 2, 3, 4, 5, 6]), // 0 = Sunday
  minNoticeMinutes: 24 * 60,
  durationMinutes: 60,
  bufferMinutes: 0,
  horizonDays: 60,
  closures: Object.freeze([]),
  dailyCap: null,
});

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
const MINUTE = 60 * 1000;

const posInt = (v, { min = 0, max = Infinity } = {}) => {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
};

export function isIsoDate(s) {
  if (typeof s !== 'string' || !DATE_RE.test(s)) return false;
  const d = new Date(`${s}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/** "1:30 PM" → 810 (minutes after midnight), null if not a valid 12-hour time. */
export function parseTime12(s) {
  const m = typeof s === 'string' && s.trim().match(TIME_RE);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 1 || h > 12 || min > 59) return null;
  const pm = m[3].toUpperCase() === 'PM';
  if (pm && h !== 12) h += 12;
  if (!pm && h === 12) h = 0;
  return h * 60 + min;
}

export function formatTime12(minutes) {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${String(m).padStart(2, '0')} ${h24 < 12 ? 'AM' : 'PM'}`;
}

export function addDaysIso(date, n) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday, for a calendar date (no time zone involved). */
export function weekdayOf(date) {
  return new Date(`${date}T12:00:00Z`).getUTCDay();
}

const partsFmt = new Map();
function fmtFor(tz) {
  if (!partsFmt.has(tz)) {
    partsFmt.set(tz, new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }));
  }
  return partsFmt.get(tz);
}

/** Offset (ms) of `tz` from UTC at instant `ms` (EDT = -4 h). */
export function tzOffsetMs(ms, tz = BOOKING_TIME_ZONE) {
  const base = Math.floor(ms / 1000) * 1000;
  const p = Object.fromEntries(fmtFor(tz).formatToParts(new Date(base)).map((x) => [x.type, x.value]));
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
  return asUtc - base;
}

/**
 * Wall-clock `date` + `minutes` in `tz` → UTC ms (DST-aware, LENIENT). Ambiguous fall-back
 * times resolve to the EARLIER occurrence; nonexistent spring-forward times shift. Use
 * zonedWallTimeToUtcMs when the wall time must really exist.
 */
export function zonedTimeToUtcMs(date, minutes, tz = BOOKING_TIME_ZONE) {
  const [y, mo, d] = date.split('-').map(Number);
  const guess = Date.UTC(y, mo - 1, d, 0, minutes);
  const off1 = tzOffsetMs(guess, tz);
  let t = guess - off1;
  const off2 = tzOffsetMs(t, tz);
  if (off2 !== off1) t = guess - off2;
  return t;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Minutes after local midnight of instant `ms` in `tz`. */
export function localMinutesOf(ms, tz = BOOKING_TIME_ZONE) {
  const local = ms + tzOffsetMs(ms, tz);
  return Math.round((((local % DAY_MS) + DAY_MS) % DAY_MS) / MINUTE);
}

/**
 * STRICT wall-time conversion (fix B1-R10): null when `date`+`minutes` does not exist in `tz`
 * (spring-forward gap) or minutes is outside [0, 1440). Ambiguous fall-back times → the earlier
 * occurrence (documented policy; current defaults never hit either case).
 */
export function zonedWallTimeToUtcMs(date, minutes, tz = BOOKING_TIME_ZONE) {
  if (!isIsoDate(date) || !Number.isInteger(minutes) || minutes < 0 || minutes >= 1440) return null;
  const t = zonedTimeToUtcMs(date, minutes, tz);
  return localDateOf(t, tz) === date && localMinutesOf(t, tz) === minutes ? t : null;
}

const DT_RE = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?$/i;

/**
 * RFC3339-ish dateTime → UTC ms (fix B1-R5). With an offset/Z it is absolute; without one it is
 * wall time in `tz` (the event's own timeZone), never the server's zone. NaN if unparseable.
 */
export function parseZonedDateTime(str, tz = BOOKING_TIME_ZONE) {
  const m = typeof str === 'string' && str.trim().match(DT_RE);
  if (!m || !isIsoDate(m[1])) return NaN;
  if (m[5]) return Date.parse(str);
  const h = Number(m[2]); const mi = Number(m[3]); const sec = Number(m[4] || 0);
  if (h > 23 || mi > 59 || sec > 59) return NaN;
  try { return zonedTimeToUtcMs(m[1], h * 60 + mi, tz) + sec * 1000; } catch { return NaN; }
}

/** Calendar date (YYYY-MM-DD) of instant `ms` in `tz`. */
export function localDateOf(ms, tz = BOOKING_TIME_ZONE) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date(ms));
}

export function resolveSchedulePolicy(overrides = {}, env = (typeof process !== 'undefined' ? process.env : {}) || {}) {
  const p = { ...DEFAULT_SCHEDULE_POLICY };
  const dur = posInt(env.BOOKING_DURATION_MINUTES, { min: 15, max: 480 });
  if (dur != null) p.durationMinutes = dur;
  const buf = posInt(env.BOOKING_BUFFER_MINUTES, { min: 0, max: 240 });
  if (buf != null) p.bufferMinutes = buf;
  const cap = posInt(env.BOOKING_DAILY_CAP, { min: 1, max: 50 });
  if (cap != null) p.dailyCap = cap;
  const hz = posInt(env.BOOKING_HORIZON_DAYS, { min: 1, max: 366 });
  if (hz != null) p.horizonDays = hz;
  if (env.BOOKING_CLOSED_DATES) {
    p.closures = String(env.BOOKING_CLOSED_DATES).split(',').map((s) => s.trim()).filter(isIsoDate);
  }
  return Object.freeze({ ...p, ...overrides });
}

/** Interval [start, end) in UTC ms of a visit at `date` + `time` (12-hour string or minutes). */
export function slotInterval(date, time, policy = DEFAULT_SCHEDULE_POLICY) {
  const minutes = typeof time === 'number' ? time : parseTime12(time);
  if (!isIsoDate(date) || minutes == null) return null;
  const start = zonedWallTimeToUtcMs(date, minutes, policy.timeZone);
  if (start == null) return null; // nonexistent local time (DST gap): never silently shifted
  return { start, end: start + policy.durationMinutes * MINUTE };
}

/** Whole local day [00:00, next 00:00) in UTC ms (23 or 25 h on DST days). */
export function dayInterval(date, policy = DEFAULT_SCHEDULE_POLICY) {
  return {
    start: zonedTimeToUtcMs(date, 0, policy.timeZone),
    end: zonedTimeToUtcMs(addDaysIso(date, 1), 0, policy.timeZone),
  };
}

/** Is this calendar date bookable at all? { ok } or { ok:false, reason }. */
export function dateBookability(date, policy, nowMs) {
  if (!isIsoDate(date)) return { ok: false, reason: 'invalid_date' };
  const today = localDateOf(nowMs, policy.timeZone);
  if (date < today) return { ok: false, reason: 'past' };
  if (date > addDaysIso(today, policy.horizonDays)) return { ok: false, reason: 'beyond_horizon' };
  if (!policy.weekdays.includes(weekdayOf(date))) return { ok: false, reason: 'closed_weekday' };
  if (policy.closures.includes(date)) return { ok: false, reason: 'closure' };
  return { ok: true };
}

/** Policy candidate starts for `date` that respect minimum notice (before any occupancy check). */
export function candidateStarts(date, policy, nowMs) {
  if (!dateBookability(date, policy, nowMs).ok) return [];
  const earliest = nowMs + policy.minNoticeMinutes * MINUTE;
  return policy.candidateTimes
    .map((time) => ({ time, minutes: parseTime12(time) }))
    .filter((c) => c.minutes != null)
    .map((c) => ({ ...c, ...slotInterval(date, c.minutes, policy) }))
    .filter((c) => Number.isFinite(c.start) && c.start >= earliest)
    .sort((a, b) => a.start - b.start);
}

const REASON_TEXT = {
  invalid_date: 'Please choose a valid date.',
  past: 'Please choose a future date.',
  beyond_horizon: 'That date is too far ahead to book online. Please choose an earlier date or call us.',
  closed_weekday: 'We don\'t book measurements on that day. Please choose Monday to Saturday.',
  closure: 'We\'re closed that day. Please choose another date.',
};

/**
 * Policy check for a customer-chosen slot. Occupancy is NOT checked here (see availability.js).
 * { ok:true, minutes } or { ok:false, code:'invalid_slot', error }.
 */
export function validateRequestedSlot(date, time, policy, nowMs) {
  const day = dateBookability(date, policy, nowMs);
  if (!day.ok) return { ok: false, code: 'invalid_slot', reason: day.reason, error: REASON_TEXT[day.reason] };
  const minutes = parseTime12(time);
  if (minutes == null) return { ok: false, code: 'invalid_slot', reason: 'missing_time', error: 'Please choose a time.' };
  const cand = candidateStarts(date, policy, nowMs).find((c) => c.minutes === minutes);
  if (!cand) {
    const listed = policy.candidateTimes.some((t) => parseTime12(t) === minutes);
    return listed
      ? { ok: false, code: 'invalid_slot', reason: 'notice', error: 'That time is less than 24 hours away. Please choose a later time.' }
      : { ok: false, code: 'invalid_slot', reason: 'not_offered', error: 'Please choose one of the listed times.' };
  }
  return { ok: true, minutes };
}
