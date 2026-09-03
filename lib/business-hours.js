/**
 * Showroom open/closed helper — single source of truth for time-aware CTAs.
 *
 * Hours (BUSINESS-FACTS.md): Mon–Sat 10:00–17:00 America/Toronto, closed Sunday.
 * Pure functions, no React. Safe on server and client. Never hardcode a UTC offset —
 * Intl handles EDT/EST.
 */

export const SHOWROOM_TZ = 'America/Toronto';
export const OPEN_HOUR = 10; // 10:00
export const CLOSE_HOUR = 17; // 17:00 (exclusive)
export const HOURS_LABEL = 'Mon–Sat 10am–5pm';

const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** @returns {{ weekday: number, hour: number, minute: number }} local Toronto clock for `date` */
export function getTorontoClock(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: SHOWROOM_TZ,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value;
  const hour = Number(get('hour')) % 24; // some engines emit "24" for midnight
  return {
    weekday: WEEKDAY_INDEX[get('weekday')] ?? 0,
    hour,
    minute: Number(get('minute')),
  };
}

/** True when a human is answering the showroom phone. */
export function isShowroomOpen(date = new Date()) {
  const { weekday, hour } = getTorontoClock(date);
  if (weekday === 0) return false; // Sunday
  return hour >= OPEN_HOUR && hour < CLOSE_HOUR;
}

/** Short copy for "when we're back" — e.g. "10am tomorrow" / "10am Monday". */
export function nextOpenLabel(date = new Date()) {
  const { weekday, hour } = getTorontoClock(date);
  if (weekday === 0) return '10am Monday';
  if (weekday === 6 && hour >= CLOSE_HOUR) return '10am Monday';
  if (hour < OPEN_HOUR) return '10am today';
  return '10am tomorrow';
}
