/**
 * Phase B, B2: server-side slot enforcement + reservation helpers. Server-only (node:crypto).
 *
 * Order for every create / reschedule (customer, admin, legacy):
 *   1. Policy: customer requests must be a listed start that respects notice/horizon/weekday/
 *      closures (validateRequestedSlot) → 400 invalid_slot. Admin reschedules are a deliberate,
 *      LOGGED policy override (the CRM has always allowed any date/time); still a valid date and
 *      12-hour time, and still subject to the occupancy/cap check below.
 *   2. Fresh availability close to commit (DB + configured Google calendars). A DB outage →
 *      503 unavailable (never "fully booked"); slot not offered → 409 with refreshed options.
 *      Google partial/unreachable → known blocks still apply; the DB reservation decides.
 *   3. Atomic DB reservation (service-role RPC, one advisory lock for the single measurement
 *      resource): overlap + buffer + cap re-checked under the lock, then insert/update.
 * Admin off-policy: the exact requested interval is still checked against live bookings and opaque
 * Google events (R-B2-ADMIN); only the online schedule policy is bypassed.
 * Google and Postgres cannot share a transaction: a manual Google edit between step 2 and the
 * commit is not caught (documented residual; confirmation stays manual).
 */
import { createHash } from 'node:crypto';
import { slotInterval, dayInterval, isIsoDate, parseTime12, validateRequestedSlot } from './schedule-policy.js';
import { publicAvailabilityView, isSlotOffered } from './availability.js';

const KEY_RE = /^[A-Za-z0-9_-]{16,128}$/;

/**
 * Owner-scoped idempotency hash. The client key alone never identifies a booking: it is hashed
 * together with the normalised email + phone digits the request carries, so a guessed/stolen key
 * submitted under different contact details matches nothing (and discloses nothing).
 * Invalid/missing key → null (no idempotency; the 24 h same-contact dedupe still applies).
 */
export function idempotencyKeyHash(clientKey, { email, phone } = {}) {
  if (typeof clientKey !== 'string' || !KEY_RE.test(clientKey)) return null;
  const e = String(email || '').trim().toLowerCase();
  const p = String(phone || '').replace(/\D/g, '');
  if (!e && p.length < 7) return null;
  return createHash('sha256').update(`bbs-booking-v1|${e}|${p}|${clientKey}`).digest('hex');
}

/** RPC slot arguments for a booking's (new) date/time. Untimed = whole local day (same as occupancy). */
export function reservationSlot(date, time, policy) {
  if (!isIsoDate(date)) return null;
  const iv = time ? slotInterval(date, time, policy) : null;
  // A NEW request with a time that is unreadable or does not exist on that date (spring-forward
  // gap, e.g. 2:30 AM on 2026-03-08) is refused (400). Existing rows use bookingOccupancy's
  // whole-day fallback instead; that is occupancy, not a new request.
  if (time && !iv) return null;
  const w = iv || dayInterval(date, policy);
  return {
    start: new Date(w.start).toISOString(),
    end: new Date(w.end).toISOString(),
    localDate: date,
    durationMinutes: policy.durationMinutes,
    padMinutes: policy.bufferMinutes || 0,
    dailyCap: policy.dailyCap ?? null,
  };
}

const fail = (code, error, httpStatus, extra = {}) => ({ success: false, code, error, httpStatus, ...extra });

export const SLOT_TAKEN_MESSAGE = 'Sorry, that time was just taken. Please choose another time. Your details are still filled in.';
export const RESERVATION_UNAVAILABLE_MESSAGE = 'We could not check the schedule just now. Please try again in a moment, or call us at (647) 428-1111.';

/**
 * @param policy        resolved schedule policy
 * @param availability  availability service ({ forDate }) or null (DB reservation only)
 * @param now           () => ms
 */
export function createSlotGate({ policy, availability = null, now = () => Date.now(), logger = console }) {
  async function freshView(date, excludeBookingId) {
    if (!availability) return null;
    try { return publicAvailabilityView(await availability.forDate(date, { excludeBookingId })); } catch { return null; }
  }

  /**
   * → { ok:true, slot, override? } | failure { success:false, code, httpStatus, error, availability? }
   * actor: 'customer' | 'server' (public create) | 'admin'
   */
  async function check({ date, time, actor, excludeBookingId = null }) {
    const nowMs = now();
    let override = false;
    if (actor === 'admin') {
      if (!isIsoDate(date)) return fail('invalid_slot', 'Invalid or missing preferred_date', 400);
      if (time && parseTime12(time) == null) return fail('invalid_slot', 'Invalid preferred_time', 400);
      const v = time ? validateRequestedSlot(date, time, policy, nowMs) : { ok: false };
      override = !v.ok;
      if (override) logger.warn?.(`[booking] admin schedule-policy override: ${date} ${time || '(no time)'}`);
    } else {
      const v = validateRequestedSlot(date, time, policy, nowMs);
      if (!v.ok) return fail('invalid_slot', v.error, 400, { reason: v.reason });
    }
    const slot = reservationSlot(date, time, policy);
    if (!slot) return fail('invalid_slot', 'That time doesn\'t exist on that date. Please choose another time.', 400);

    if (availability && override) {
      // R-B2-ADMIN: a policy override is not an occupancy override. Check the exact requested
      // interval against live bookings (self excluded) and opaque Google events.
      if (typeof availability.checkInterval !== 'function') return fail('unavailable', RESERVATION_UNAVAILABLE_MESSAGE, 503);
      let c;
      try {
        c = await availability.checkInterval(date, { start: Date.parse(slot.start), end: Date.parse(slot.end) }, { excludeBookingId });
      } catch { c = { status: 'unavailable' }; }
      if (!c || c.status === 'unavailable') return fail('unavailable', RESERVATION_UNAVAILABLE_MESSAGE, 503);
      if (c.status === 'busy') {
        return fail('slot_unavailable', 'That time overlaps another booking or a busy calendar event.', 409);
      }
    }

    if (availability && !override) {
      let r;
      try { r = await availability.forDate(date, { excludeBookingId }); } catch { r = { status: 'unavailable' }; }
      if (!r || r.status === 'unavailable' || r.status === 'invalid') {
        return fail('unavailable', RESERVATION_UNAVAILABLE_MESSAGE, 503);
      }
      if (!isSlotOffered(r, time)) {
        return fail('slot_unavailable', SLOT_TAKEN_MESSAGE, 409, { availability: publicAvailabilityView(r) });
      }
    }
    return { ok: true, slot, ...(override && { override: true }) };
  }

  /** 409 body after the atomic DB check said conflict: refreshed options (best effort). */
  async function conflict(date, excludeBookingId, reason) {
    return fail('slot_unavailable', reason === 'cap_reached'
      ? 'That day just filled up. Please choose another date. Your details are still filled in.'
      : SLOT_TAKEN_MESSAGE, 409, { availability: await freshView(date, excludeBookingId) });
  }

  return { check, conflict, policy };
}
