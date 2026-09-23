/**
 * Customer self-service reads (red-team R16). Handler cores for
 *   POST /api/booking/lookup        { email, phone } → the customer's bookings (+ lookup tokens)
 *   POST /api/booking/lookup-token  { token }        → one booking
 * and the customer-safe booking DTO shared with customer-action.
 *
 * Changes vs the pre-fix routes:
 *  - Email must be a real address. It is matched LITERALLY and case-insensitively:
 *    ILIKE wildcards (% _ \) are escaped and the result is re-checked in JS.
 *  - Phone needs at least 10 digits and must equal the stored number's last 10.
 *    A phone of "x" no longer matches blank stored numbers.
 *  - Rate limits per client IP (in-memory, per instance; see the runbook residual).
 *  - Responses are an explicit DTO: never calendar ids, ownership proofs, sync
 *    diagnostics, visitor ids, notes or revision.
 *  - Token must look like a UUID (the column is uuid) before any query.
 *  - No service-role client → 503 (fail closed, never the anon fallback).
 */
export const LOOKUP_RATE_LIMIT = Object.freeze({ maxRequests: 5, windowMs: 15 * 60 * 1000 });
export const TOKEN_RATE_LIMIT = Object.freeze({ maxRequests: 30, windowMs: 15 * 60 * 1000 });
export const CUSTOMER_ACTION_RATE_LIMIT = Object.freeze({ maxRequests: 10, windowMs: 15 * 60 * 1000 });

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CUSTOMER_FIELDS = Object.freeze([
  'id', 'lookup_token', 'customer_name', 'customer_address', 'postal_code',
  'preferred_date', 'preferred_time', 'flooring_type', 'service_type', 'product_name',
  'status', 'created_at',
]);

/** The only booking shape customer endpoints return. */
export function customerBookingView(row) {
  if (!row) return null;
  const out = {};
  for (const k of CUSTOMER_FIELDS) if (row[k] !== undefined) out[k] = row[k];
  return out;
}

/** Customer-safe calendarSync: status only (no event ids, no Google error text). */
export function customerSyncView(cs) {
  return cs ? { status: cs.status } : null;
}

export const isUuid = (s) => typeof s === 'string' && UUID_RE.test(s.trim());
export const escapeLike = (s) => String(s).replace(/[\\%_]/g, (c) => `\\${c}`);

const json = (status, body, headers) => (headers ? { status, body, headers } : { status, body });

export function rateLimited(deps, request, bucket, limits) {
  const ip = deps.getClientIP?.(request) || 'unknown';
  const r = deps.checkRateLimit(`${bucket}:${ip}`, limits);
  if (r.ok) return null;
  return json(429, { success: false, error: 'Too many requests. Please try again later.' },
    { 'Retry-After': String(Math.max(0, Math.ceil((r.resetAt - Date.now()) / 1000))) });
}

async function readJson(request) {
  try { const b = await request.json(); return b && typeof b === 'object' ? b : null; } catch { return null; }
}

export async function handleLookup(request, deps) {
  const log = deps.logger || console;
  const limited = rateLimited(deps, request, 'booking-lookup', LOOKUP_RATE_LIMIT);
  if (limited) return limited;
  if (!deps.supabase) return json(503, { success: false, error: 'Booking lookup is temporarily unavailable. Please call us.' });
  const body = await readJson(request);
  const email = String(body?.email || '').trim().toLowerCase();
  const digits = String(body?.phone || '').replace(/\D/g, '');
  if (!EMAIL_RE.test(email) || digits.length < 10) {
    return json(400, { success: false, error: 'Please enter the email and full phone number you used when booking.' });
  }
  try {
    const { data, error } = await deps.supabase
      .from('bookings')
      .select(CUSTOMER_FIELDS.concat(['customer_email', 'customer_phone']).join(', '))
      .ilike('customer_email', escapeLike(email))
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) throw error;
    const last10 = digits.slice(-10);
    const matched = (data || []).filter((b) => {
      if (String(b.customer_email || '').trim().toLowerCase() !== email) return false;
      const stored = String(b.customer_phone || '').replace(/\D/g, '');
      return stored.length >= 10 && stored.slice(-10) === last10;
    });
    if (!matched.length) {
      return json(404, { success: false, error: 'No bookings found matching that email and phone number.' });
    }
    return json(200, { success: true, bookings: matched.map(customerBookingView) });
  } catch (e) {
    log.error?.('[booking-lookup] failed:', e?.message || e);
    return json(500, { success: false, error: 'Lookup failed. Please try again or call us.' });
  }
}

export async function handleLookupToken(request, deps) {
  const log = deps.logger || console;
  const limited = rateLimited(deps, request, 'booking-token', TOKEN_RATE_LIMIT);
  if (limited) return limited;
  if (!deps.supabase) return json(503, { success: false, error: 'Booking lookup is temporarily unavailable. Please call us.' });
  const body = await readJson(request);
  const token = String(body?.token || '').trim();
  if (!token) return json(400, { success: false, error: 'Missing token' });
  if (!isUuid(token)) return json(404, { success: false, error: 'Booking not found' });
  try {
    const { data, error } = await deps.supabase
      .from('bookings').select(CUSTOMER_FIELDS.join(', ')).eq('lookup_token', token).maybeSingle();
    if (error) throw error;
    if (!data) return json(404, { success: false, error: 'Booking not found' });
    return json(200, { success: true, booking: customerBookingView(data) });
  } catch (e) {
    log.error?.('[booking-lookup-token] failed:', e?.message || e);
    return json(500, { success: false, error: 'Lookup failed. Please try again or call us.' });
  }
}
