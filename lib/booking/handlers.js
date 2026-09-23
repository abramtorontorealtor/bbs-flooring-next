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
 *   findBookingByToken?(token)   override for the lookup_token read
 *   timeouts?                    overrides for ./deadline.js budgets (identifyMs used here)
 *   logger
 *
 * No handler writes `bookings`, calls Google Calendar, or sends email/Telegram
 * itself — all of that happens inside lifecycle (DB first, then calendar, then notify).
 */
import { customerEmailSent } from './notify.js';
import { resolveBookingTimeouts, withDeadline } from './deadline.js';
import { idempotencyKeyHash } from './reservation.js';
import {
  customerBookingView, customerSyncView, rateLimited, CUSTOMER_ACTION_RATE_LIMIT,
} from './customer-lookup.js';

// Fix R15: no service-role client → refuse (never run the lifecycle on the anon fallback).
const UNAVAILABLE = { status: 503, body: { success: false, error: 'Booking service is temporarily unavailable. Please call us.' } };

export const CONFIRM_RATE_LIMIT = Object.freeze({ maxRequests: 3, windowMs: 15 * 60 * 1000 });
const GENERIC_SAVE_ERROR = 'We could not save your request. Please try again or call us.';

const json = (status, body, headers) => (headers ? { status, body, headers } : { status, body });
// B2: 409 slot conflicts carry sanitized refreshed options; 503 is retriable.
const failFrom = (r) => json(r.httpStatus || 500, {
  success: false, error: r.error, code: r.code,
  ...(r.availability !== undefined && { availability: r.availability }),
}, r.httpStatus === 503 ? { 'Retry-After': '5' } : undefined);

async function readJson(request) {
  try {
    const body = await request.json();
    return body && typeof body === 'object' ? body : {};
  } catch {
    return null;
  }
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

    if (!deps.supabase) return UNAVAILABLE;
    const parsed = await readJson(request);
    const booking = parsed?.booking;
    if (!booking?.customer_email) {
      return json(400, { success: false, error: 'Customer email is required' });
    }

    const visitorId = deps.getVisitorIdFromRequest(request, booking);

    // 2+3. Policy check, fresh availability, then the ATOMIC reservation (B2). The 24 h
    //      same-contact dedupe and the owner-scoped idempotency key are checked inside the
    //      reservation lock; a replay returns the original booking with no email/conversion.
    const clientKey = (typeof request.headers?.get === 'function' && request.headers.get('idempotency-key'))
      || booking.idempotency_key || null;
    const keyHash = idempotencyKeyHash(clientKey, {
      email: booking.customer_email || booking.email, phone: booking.customer_phone || booking.phone,
    });
    const r = await deps.lifecycle.create(bookingRowFromRequest(booking, visitorId), { idempotencyKeyHash: keyHash });
    if (!r.success) {
      // No row written: no emails, no Telegram, no calendar (lifecycle rule 1).
      return failFrom(r.code === 'db_error' ? { ...r, error: GENERIC_SAVE_ERROR } : r);
    }
    if (r.duplicate) {
      log.log?.('[Booking] Duplicate submission (replay):', r.booking.id);
      return json(200, { success: true, emailSent: false, bookingId: r.booking.id, duplicate: true });
    }

    // 4. Identity link, only for a persisted row. It is bounded (fix R1) and
    //    never fails or delays the request past identifyMs.
    try {
      const { identifyMs } = resolveBookingTimeouts(deps.timeouts);
      await withDeadline(() => deps.identifyVisitor(deps.supabase, {
        visitorId,
        email: booking.customer_email || booking.email,
        phone: booking.customer_phone || booking.phone,
        name: booking.customer_name || booking.name,
        source: 'booking',
      }), identifyMs, 'identifyVisitor');
    } catch (e) {
      log.warn?.('[Booking] identifyVisitor failed (ignored):', e?.message);
    }

    return json(200, {
      success: true,
      emailSent: customerEmailSent(r, 'created'),
      bookingId: r.booking.id,
      // Public endpoint: status only (no event ids / provider diagnostics).
      calendarSync: customerSyncView(r.calendarSync),
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
    // Fix R16: throttle token-driven mutations per IP (in-memory, per instance).
    const limited = rateLimited(deps, request, 'booking-customer-action', CUSTOMER_ACTION_RATE_LIMIT);
    if (limited) return limited;
    if (!deps.supabase) return UNAVAILABLE;
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
      if (r.code === 'invalid_state') return json(400, { success: false, error: r.error, code: r.code });
      return failFrom(r);
    }
    // Fix R16: customer-safe DTO (no calendar ids, proofs, sync diagnostics, notes).
    return json(200, { success: true, booking: customerBookingView(r.booking), calendarSync: customerSyncView(r.calendarSync) });
  } catch (error) {
    log.error?.('Customer booking action error:', error?.message || error);
    return json(500, { success: false, error: 'Something went wrong. Please try again or call us.' });
  }
}

// ── POST /api/booking/admin-action (requireAdmin) ──────────────────────────
export const ADMIN_ACTIONS = Object.freeze(['confirm', 'reschedule', 'cancel', 'complete', 'retry_sync', 'trust_calendar_event', 'resolve_calendar_uncertainty']);

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
    const { bookingId, action, preferred_date, preferred_time, cancel_reason, eventId, marker } = parsed;
    if (!bookingId) return json(400, { success: false, error: 'Missing bookingId' });
    if (!deps.supabase) return UNAVAILABLE;

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
      case 'retry_sync':
        // Re-run calendar reconciliation from the CURRENT DB row (A4, PLAN item 6).
        // Never notifies — the customer is not re-emailed because sync ran.
        r = await deps.lifecycle.retrySync(bookingId);
        break;
      case 'trust_calendar_event':
        // Fix R15: admin has checked this booking's calendar event in Google Calendar and
        // vouches for it. Writes ownership proofs only (no Google call, no email).
        r = await deps.lifecycle.trustCalendarEvent(bookingId, { eventId: eventId ?? null });
        break;
      case 'resolve_calendar_uncertainty':
        // Fix R7: admin checked Google Calendar by hand; clears the uncertain-create marker it was shown.
        r = await deps.lifecycle.resolveCalendarUncertainty(bookingId, { marker: marker ?? null });
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
      // Fix R6: identical transition → nothing changed, no email sent (not an email failure).
      ...(r.noop && { unchanged: true }),
      // B2: admin moved outside the online schedule policy (deliberate, logged).
      ...(r.policyOverride && { policyOverride: true }),
      // Fix R5: email deliberately not sent because a newer change superseded it.
      ...(r.notifications?.some((n) => n.reason === 'superseded') && { emailSuperseded: true }),
      // CRM: red badge + Retry on 'failed', amber note on 'pending'; null for complete.
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
    if (!deps.supabase) return UNAVAILABLE;

    const r = await deps.lifecycle.reschedule(bookingId, { date: preferred_date, time: preferred_time || null }, 'admin');
    if (!r.success) return failFrom(r);
    return json(200, { success: true, booking: r.booking, calendarSync: r.calendarSync, deprecated: true });
  } catch (error) {
    log.error?.('Booking reschedule error:', error?.message || error);
    return json(500, { success: false, error: 'Failed to reschedule booking' });
  }
}
