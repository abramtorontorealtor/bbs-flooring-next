/**
 * Client-side interpretation of a POST /api/booking/confirm response
 * (Phase A, A3). Pure: no DOM, no fetch — unit-tested under node:test.
 *
 *   success          → only when res.ok && data.success && data.bookingId
 *   fireConversion   → only for a NEWLY persisted booking (not a duplicate)
 *
 * GA4 / Google Ads / Meta conversion events must be gated on fireConversion.
 */
export function interpretBookingSubmit(res, data) {
  const ok = !!res?.ok;
  const body = data && typeof data === 'object' ? data : {};
  const bookingId = typeof body.bookingId === 'string' || typeof body.bookingId === 'number'
    ? String(body.bookingId) : null;
  const success = ok && body.success === true && !!bookingId;
  const duplicate = success && body.duplicate === true;
  return {
    success,
    duplicate,
    fireConversion: success && !duplicate,
    bookingId: success ? bookingId : null,
    error: success ? null : (typeof body.error === 'string' ? body.error : null),
  };
}

/** Parse a fetch Response body as JSON without throwing (null on bad/empty body). */
export async function readJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
