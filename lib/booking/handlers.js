/**
 * Testable request-handler cores for the booking API routes (Phase A, A3).
 *
 * Each handler takes (request, deps) and resolves a plain
 *   { status, body, headers? }   — route wraps it in NextResponse.json
 * or { passthrough }             — an already-built response (requireAdmin errors).
 *
 * deps (production: getBookingServerDeps() in ./server.js; tests: fakes):
 *   lifecycle            createBookingLifecycle(...) instance — the ONLY writer
 *   supabase             service-role client (read-only use here: dedupe, token lookup)
 *   checkRateLimit, getClientIP, getVisitorIdFromRequest, identifyVisitor, requireAdmin
 *   findDuplicate?(booking)      override for the 24h dedupe lookup
 *   findBookingByToken?(token)   override for the lookup_token read
 *   logger
 *
 * No handler writes `bookings`, calls Google Calendar, or sends email/Telegram
 * itself — all of that happens inside lifecycle (DB first, then calendar, then notify).
 */
import { customerEmailSent } from './notify.js';

export const CONFIRM_RATE_LIMIT = Object.freeze({ maxRequests: 3, windowMs: 15 * 60 * 1000 });
const GENERIC_SAVE_ERROR = 'We could not save your request. Please try again or call us.';

const json = (status, body, headers) => (headers ? { status, body, headers } : { status, body });
const failFrom = (r) => json(r.httpStatus || 500, { success: false, error: r.error, code: r.code });

async function readJson(request) {
  try {
    const body = await request.json();
    return body && typeof body === 'object' ? body : {};
  } catch {
    return null;
  }
}

/**
 * 24h dedupe (unchanged from the pre-A3 route): same customer (email OR phone)
 * + same preferred date/time, not cancelled = a double-tap/resubmit.
 * Non-atomic by design (Phase B moves this into the DB). Returns the row or null.
 */
export async function findRecentDuplicateBooking(supabase, booking, nowMs = Date.now()) {
  const email = (booking.customer_email || booking.email || '').trim().toLowerCase();
  const phoneDigits = String(booking.customer_phone || booking.phone || '').replace(/\D/g, '');
  const prefDate = booking.preferred_date || booking.date || null;
  const prefTime = booking.preferred_time || booking.time || null;
  if (!prefDate) return null;
  const since = new Date(nowMs - 24 * 60 * 60 * 1000).toISOString();
  const { data: recent } = await supabase
    .from('bookings')
    .select('id, customer_email, customer_phone, preferred_date, preferred_time, status')
    .eq('preferred_date', prefDate)
    .gte('created_at', since)
    .neq('status', 'cancelled')
    .limit(50);
  return (recent || []).find((b) => {
    if ((b.preferred_time || null) !== prefTime) return false;
    const bEmail = (b.customer_email || '').trim().toLowerCase();
    const bPhone = String(b.customer_phone || '').replace(/\D/g, '');
    return (email && bEmail === email) || (phoneDigits.length >= 7 && bPhone === phoneDigits);
  }) || null;
}

/** Client payload → bookings row (same field mapping as the pre-A3 insert). */
export function bookingRowFromRequest(booking, visitorId) {
  return {
    customer_name: booking.customer_name || booking.name,
    customer_email: booking.customer_email || booking.email,
    customer_phone: booking.customer_phone || booking.phone,
    customer_address: booking.customer_address || booking.address,
    postal_code: booking.postal_code,
    preferred_date: booking.preferred_date || booking.date,
    preferred_time: booking.preferred_time || booking.time,
    flooring_type: booking.flooring_type,
    square_footage: booking.square_footage || booking.sqft,
    service_type: booking.service_type || 'free_measurement',
    product_name: booking.product_name,
    quote_total: booking.quote_total,
    notes: booking.notes,
    visitor_id: visitorId,
  };
}

// ── POST /api/booking/confirm ──────────────────────────────────────────────
export async function handleConfirm(request, deps) {
  const log = deps.logger || console;
  try {
    // 1. Rate limit — before any DB work.
    const ip = deps.getClientIP(request);
    const limit = deps.checkRateLimit(`booking:${ip}`, CONFIRM_RATE_LIMIT);
    if (!limit.ok) {
      return json(429,
        { success: false, error: 'Too many booking requests. Please try again later.' },
        { 'Retry-After': String(Math.max(0, Math.ceil((limit.resetAt - Date.now()) / 1000))) });
    }

    const parsed = await readJson(request);
    const booking = parsed?.booking;
    if (!booking?.customer_email) {
      return json(400, { success: false, error: 'Customer email is required' });
    }

    const visitorId = deps.getVisitorIdFromRequest(request, booking);

    // 2. Dedupe — before create(). A lookup failure never blocks a booking.
    try {
      const dup = deps.findDuplicate
        ? await deps.findDuplicate(booking)
        : await findRecentDuplicateBooking(deps.supabase, booking);
      if (dup?.id) {
        log.log?.('[Booking] Duplicate submission suppressed:', dup.id);
        return json(200, { success: true, emailSent: false, bookingId: dup.id, duplicate: true });
      }
    } catch (e) {
      log.warn?.('[Booking] Dedupe check failed (continuing):', e?.message);
    }

    // 3. Persist (+ calendar + notify, in that order, inside the service).
    const r = await deps.lifecycle.create(bookingRowFromRequest(booking, visitorId));
    if (!r.success) {
      // DB failure: no emails, no Telegram, no calendar (lifecycle rule 1).
      return json(r.httpStatus || 500, {
        success: false,
        error: r.code === 'db_error' ? GENERIC_SAVE_ERROR : r.error,
        code: r.code,
      });
    }

    // 4. Identity link — only for a persisted row, never fails the request.
    try {
      await deps.identifyVisitor(deps.supabase, {
        visitorId,
        email: booking.customer_email || booking.email,
        phone: booking.customer_phone || booking.phone,
        name: booking.customer_name || booking.name,
        source: 'booking',
      });
    } catch (e) {
      log.warn?.('[Booking] identifyVisitor failed (ignored):', e?.message);
    }

    return json(200, {
      success: true,
      emailSent: customerEmailSent(r, 'created'),
      bookingId: r.booking.id,
      calendarSync: r.calendarSync,
    });
  } catch (error) {
    log.error?.('Booking creation error:', error?.message || error);
    return json(500, { success: false, error: GENERIC_SAVE_ERROR });
  }
}

// ── POST /api/booking/customer-action (lookup_token auth) ──────────────────
async function defaultFindByToken(supabase, token) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('lookup_token', token)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function handleCustomerAction(request, deps) {
  const log = deps.logger || console;
  try {
    const parsed = await readJson(request);
    if (!parsed) return json(400, { success: false, error: 'Invalid request body' });
    const { token, action, preferred_date, preferred_time, cancel_reason } = parsed;
    if (!token) return json(400, { success: false, error: 'Missing token' });

    let booking;
    try {
      booking = deps.findBookingByToken
        ? await deps.findBookingByToken(token)
        : await defaultFindByToken(deps.supabase, token);
    } catch (e) {
      log.error?.('[customer-action] token lookup failed:', e?.message);
      booking = null;
    }
    if (!booking?.id) return json(404, { success: false, error: 'Booking not found' });

    let r;
    switch (action) {
      case 'reschedule':
        if (!preferred_date) return json(400, { success: false, error: 'Missing preferred_date' });
        // Moves the SAME calendar event; status → pending (admin re-confirms).
        r = await deps.lifecycle.reschedule(booking.id, { date: preferred_date, time: preferred_time || null }, 'customer');
        break;
      case 'cancel':
        // Deletes the calendar event; id cleared only after an acknowledged delete.
        r = await deps.lifecycle.cancel(booking.id, cancel_reason || '', 'customer');
        break;
      default:
        return json(400, { success: false, error: `Unknown action: ${action}` });
    }

    if (!r.success) {
      // Pre-A3 contract: completed/cancelled bookings → 400.
      const status = r.code === 'invalid_state' ? 400 : (r.httpStatus || 500);
      return json(status, { success: false, error: r.error, code: r.code });
    }
    return json(200, { success: true, booking: r.booking, calendarSync: r.calendarSync });
  } catch (error) {
    log.error?.('Customer booking action error:', error?.message || error);
    return json(500, { success: false, error: 'Something went wrong. Please try again or call us.' });
  }
}

// ── POST /api/booking/admin-action (requireAdmin) ──────────────────────────
export const ADMIN_ACTIONS = Object.freeze(['confirm', 'reschedule', 'cancel', 'complete']);

async function adminGate(deps) {
  const { error } = await deps.requireAdmin();
  return error ? { passthrough: error } : null;
}

export async function handleAdminAction(request, deps) {
  const log = deps.logger || console;
  try {
    const denied = await adminGate(deps);
    if (denied) return denied;

    const parsed = await readJson(request);
    if (!parsed) return json(400, { success: false, error: 'Invalid request body' });
    const { bookingId, action, preferred_date, preferred_time, cancel_reason } = parsed;
    if (!bookingId) return json(400, { success: false, error: 'Missing bookingId' });

    let r;
    let notifyType = null;
    switch (action) {
      case 'confirm':
        r = await deps.lifecycle.confirm(bookingId);
        notifyType = 'confirmed';
        break;
      case 'reschedule':
        if (!preferred_date) {
          return json(400, { success: false, error: 'Missing preferred_date for reschedule' });
        }
        r = await deps.lifecycle.reschedule(bookingId, { date: preferred_date, time: preferred_time || null }, 'admin');
        notifyType = 'rescheduled';
        break;
      case 'cancel':
        r = await deps.lifecycle.cancel(bookingId, cancel_reason || '', 'admin');
        notifyType = 'cancelled';
        break;
      case 'complete':
        // Status flip + revision only — no calendar change, no email (decision 1/8d).
        r = await deps.lifecycle.complete(bookingId);
        break;
      default:
        return json(400, { success: false, error: `Unknown action: ${action}` });
    }

    if (!r.success) return failFrom(r);
    return json(200, {
      success: true,
      action,
      booking: r.booking,
      emailSent: notifyType ? customerEmailSent(r, notifyType) : false,
      // CRM warns on status 'failed' | 'pending' (A4 badge); null for complete.
      calendarSync: r.calendarSync,
    });
  } catch (error) {
    log.error?.('Booking admin action error:', error?.message || error);
    return json(500, { success: false, error: 'Booking action failed' });
  }
}

// ── POST /api/booking/reschedule (LEGACY, requireAdmin) ─────────────────────
// No caller found (grep, Sep 23 2026). Kept for compat; routed through the
// lifecycle admin reschedule so the calendar event moves too. Contract kept:
// same body/response shape, no emails (deps.lifecycle is built silent).
export async function handleLegacyReschedule(request, deps) {
  const log = deps.logger || console;
  try {
    const denied = await adminGate(deps);
    if (denied) return denied;
    log.warn?.('[DEPRECATED] POST /api/booking/reschedule — use /api/booking/admin-action { action:"reschedule" }');

    const parsed = await readJson(request);
    if (!parsed) return json(400, { success: false, error: 'Invalid request body' });
    const { bookingId, preferred_date, preferred_time } = parsed;
    if (!bookingId) return json(400, { success: false, error: 'Missing bookingId' });
    if (!preferred_date) return json(400, { success: false, error: 'Missing preferred_date' });

    const r = await deps.lifecycle.reschedule(bookingId, { date: preferred_date, time: preferred_time || null }, 'admin');
    if (!r.success) return failFrom(r);
    return json(200, { success: true, booking: r.booking, calendarSync: r.calendarSync, deprecated: true });
  } catch (error) {
    log.error?.('Booking reschedule error:', error?.message || error);
    return json(500, { success: false, error: 'Failed to reschedule booking' });
  }
}
