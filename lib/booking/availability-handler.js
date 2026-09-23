/**
 * GET /api/booking/availability?date=YYYY-MM-DD[&token=<lookup_token>]  (Phase B, B1)
 *
 * Public, rate limited, never cached. `token` (optional) = the customer's own lookup token when
 * rescheduling: the server resolves it to a booking and excludes ONLY that booking's own time.
 * There is no public excludeBookingId. Unknown token → treated as no token (no oracle).
 * Response: publicAvailabilityView (slot ids/times/instants, status, reliability). No PII.
 */
import { publicAvailabilityView } from './availability.js';
import { isIsoDate } from './schedule-policy.js';
import { rateLimited } from './customer-lookup.js';

export const AVAILABILITY_RATE_LIMIT = Object.freeze({ maxRequests: 60, windowMs: 5 * 60 * 1000 });
export const NO_STORE = Object.freeze({ 'Cache-Control': 'no-store, max-age=0' });

const json = (status, body, headers = NO_STORE) => ({ status, body, headers: { ...NO_STORE, ...headers } });

export async function handleAvailability(request, deps) {
  const log = deps.logger || console;
  try {
    const limited = rateLimited(deps, request, 'booking-availability', AVAILABILITY_RATE_LIMIT);
    if (limited) return { ...limited, headers: { ...NO_STORE, ...limited.headers } };
    const url = new URL(request.url);
    const date = url.searchParams.get('date') || '';
    if (!isIsoDate(date)) return json(400, { success: false, error: 'Invalid date' });
    if (!deps.availability) return json(503, { success: false, error: 'Availability is temporarily unavailable. Please call us.' });

    let excludeBookingId = null;
    const token = (url.searchParams.get('token') || '').trim();
    if (token && deps.findBookingByToken) {
      try {
        const b = await deps.findBookingByToken(token);
        if (b?.id && (b.status === 'pending' || b.status === 'confirmed')) excludeBookingId = b.id;
      } catch (e) {
        log.warn?.('[availability] token lookup failed (ignored):', e?.message);
      }
    }
    const r = await deps.availability.forDate(date, { excludeBookingId });
    if (r.status === 'invalid') return json(400, { success: false, error: 'Invalid date' });
    if (r.status === 'unavailable') {
      return json(503, { success: false, ...publicAvailabilityView(r), error: 'We could not check times right now. Please call us or request a time.' });
    }
    return json(200, { success: true, ...publicAvailabilityView(r) });
  } catch (err) {
    log.error?.('[availability] error:', err?.message || err);
    return json(500, { success: false, error: 'Availability check failed' });
  }
}
