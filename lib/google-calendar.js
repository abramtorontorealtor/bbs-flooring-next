/**
 * Google Calendar integration for BBS Flooring bookings.
 * Creates/updates/deletes calendar events when bookings are confirmed/rescheduled/cancelled.
 * 
 * Env vars required:
 *   GOOGLE_CALENDAR_CLIENT_ID
 *   GOOGLE_CALENDAR_CLIENT_SECRET
 *   GOOGLE_CALENDAR_REFRESH_TOKEN
 * 
 * Uses OAuth2 refresh token flow — no library dependencies.
 */

const CALENDAR_ID = 'primary';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';
const DEFAULT_TIMEOUT_MS = 4000;

/**
 * Per-request deadline for every Google call (OAuth token + Calendar), in ms.
 * Env GOOGLE_CALENDAR_TIMEOUT_MS overrides the 4000 ms default. The lifecycle
 * adds its own total budget on top (lib/booking/deadline.js).
 */
export function googleTimeoutMs() {
  const n = Number(process.env.GOOGLE_CALENDAR_TIMEOUT_MS);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_TIMEOUT_MS;
}

/**
 * Abort signal for one Google request: fires after googleTimeoutMs(), or earlier
 * if the caller's `signal` aborts. It stays armed while the body is read, so a
 * server that sends headers and then stalls is cut off too.
 */
function requestSignal(signal) {
  const timeout = AbortSignal.timeout(googleTimeoutMs());
  return signal ? AbortSignal.any([timeout, signal]) : timeout;
}

function describeFetchError(err) {
  if (err?.name === 'TimeoutError') return `Google request timed out after ${googleTimeoutMs()}ms`;
  if (err?.name === 'AbortError') return 'Google request aborted (booking sync deadline)';
  return err?.message || String(err);
}

/**
 * Check if Google Calendar integration is configured.
 */
function isCalendarConfigured() {
  return !!(
    process.env.GOOGLE_CALENDAR_CLIENT_ID &&
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET &&
    process.env.GOOGLE_CALENDAR_REFRESH_TOKEN
  );
}

/**
 * Get a fresh access token using the refresh token.
 */
async function getAccessToken({ signal } = {}) {
  const sig = requestSignal(signal);
  const res = await fetch(TOKEN_URL, {
    signal: sig,
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CALENDAR_CLIENT_ID,
      client_secret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * Parse booking date/time into start/end ISO strings.
 * Bookings have preferred_date ("2026-06-05") and preferred_time ("1:30 PM").
 * Default to 1-hour events. If no time given, create all-day event.
 */
function parseBookingDateTime(booking) {
  const date = booking.preferred_date; // "2026-06-05"
  const timeStr = booking.preferred_time; // "1:30 PM" or "5:00 PM" or null

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  // Google all-day events use an EXCLUSIVE end date (fix R9): end = next calendar day.
  const allDay = () => ({ allDay: true, start: { date }, end: { date: addDays(date, 1) } });

  if (!timeStr) return allDay();

  // Parse "1:30 PM" or "5:00 PM" format
  const match = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return allDay(); // unparseable time → all-day

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  if (hours < 1 || hours > 12 || minutes > 59) return allDay();

  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  const pad = (n) => String(n).padStart(2, '0');
  const startDT = `${date}T${pad(hours)}:${pad(minutes)}:00`;
  // End = start + 1 hour, rolling over to the next day after 11 PM (fix R9: never hour 24).
  const endDate = hours === 23 ? addDays(date, 1) : date;
  const endDT = `${endDate}T${pad((hours + 1) % 24)}:${pad(minutes)}:00`;

  return {
    allDay: false,
    start: { dateTime: startDT, timeZone: 'America/Toronto' },
    end: { dateTime: endDT, timeZone: 'America/Toronto' },
  };
}

/** YYYY-MM-DD + n days (pure calendar arithmetic in UTC; no timezone drift). */
function addDays(date, n) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Exported for tests (fix R9). */
export const __test = { parseBookingDateTime };

/**
 * Build event summary and description from booking data.
 */
function buildEventDetails(booking) {
  const serviceLabels = {
    free_measurement: '📐 Free Measurement',
    consultation: '💬 Consultation',
    stairs_quote: '🪜 Stairs Quote',
    quote_estimate: '📝 Quote Estimate',
  };

  const service = serviceLabels[booking.service_type] || booking.service_type || 'Appointment';
  const name = booking.customer_name || 'Customer';

  // Prefix with status so a pending (unconfirmed) booking is visually distinct on the calendar.
  const statusPrefix =
    booking.status === 'pending' ? '⏳ PENDING — ' :
    booking.status === 'cancelled' ? '❌ CANCELLED — ' :
    '';

  const summary = `${statusPrefix}${service} — ${name}`;

  const lines = [];
  if (booking.customer_name) lines.push(`👤 ${booking.customer_name}`);
  if (booking.customer_phone) lines.push(`📞 ${booking.customer_phone}`);
  if (booking.customer_email) lines.push(`✉️ ${booking.customer_email}`);
  if (booking.customer_address) lines.push(`📍 ${booking.customer_address}`);
  if (booking.postal_code) lines.push(`    ${booking.postal_code}`);
  if (booking.flooring_type) lines.push(`🏠 Flooring: ${booking.flooring_type}`);
  if (booking.product_name) lines.push(`📦 Product: ${booking.product_name}`);
  if (booking.square_footage) lines.push(`📏 Area: ${booking.square_footage} sqft`);
  if (booking.notes) lines.push(`📝 Notes: ${booking.notes}`);
  lines.push(`\n🔗 CRM: https://bbsflooring.ca/admin?tab=crm&source=booking`);

  return {
    summary,
    description: lines.join('\n'),
    location: booking.customer_address
      ? `${booking.customer_address}${booking.postal_code ? ', ' + booking.postal_code : ''}`
      : undefined,
  };
}

/**
 * Create a Google Calendar event for a confirmed booking.
 * Returns the event ID (store it in the booking row for updates/deletes).
 */
export async function createCalendarEvent(booking) {
  if (!isCalendarConfigured()) {
    console.log('[Calendar] Not configured — skipping event creation');
    return { success: false, reason: 'not_configured' };
  }

  try {
    const token = await getAccessToken();
    const dateTime = parseBookingDateTime(booking);

    if (!dateTime) {
      console.log('[Calendar] No date on booking — skipping');
      return { success: false, reason: 'no_date' };
    }

    const { summary, description, location } = buildEventDetails(booking);

    const event = {
      summary,
      description,
      ...(location && { location }),
      start: dateTime.start,
      end: dateTime.end,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 60 },
          { method: 'popup', minutes: 15 },
        ],
      },
    };

    const res = await fetch(`${CALENDAR_API}/calendars/${CALENDAR_ID}/events`, {
      signal: requestSignal(),
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[Calendar] Event creation failed (${res.status}):`, text);
      return { success: false, reason: 'api_error', error: text };
    }

    const created = await res.json();
    console.log(`[Calendar] Event created: ${created.id} — ${summary}`);
    return { success: true, eventId: created.id };
  } catch (err) {
    console.error('[Calendar] Error creating event:', err);
    return { success: false, reason: 'exception', error: err.message };
  }
}

/**
 * Update an existing calendar event (e.g., on reschedule).
 */
export async function updateCalendarEvent(eventId, booking) {
  if (!isCalendarConfigured() || !eventId) {
    return { success: false, reason: !eventId ? 'no_event_id' : 'not_configured' };
  }

  try {
    const token = await getAccessToken();
    const dateTime = parseBookingDateTime(booking);

    if (!dateTime) {
      return { success: false, reason: 'no_date' };
    }

    const { summary, description, location } = buildEventDetails(booking);

    const event = {
      summary,
      description,
      ...(location && { location }),
      start: dateTime.start,
      end: dateTime.end,
    };

    const res = await fetch(`${CALENDAR_API}/calendars/${CALENDAR_ID}/events/${eventId}`, {
      signal: requestSignal(),
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[Calendar] Event update failed (${res.status}):`, text);
      return { success: false, reason: 'api_error', error: text };
    }

    console.log(`[Calendar] Event updated: ${eventId}`);
    return { success: true, eventId };
  } catch (err) {
    console.error('[Calendar] Error updating event:', err);
    return { success: false, reason: 'exception', error: err.message };
  }
}

/**
 * Delete (cancel) a calendar event.
 */
export async function deleteCalendarEvent(eventId) {
  if (!isCalendarConfigured() || !eventId) {
    return { success: false, reason: !eventId ? 'no_event_id' : 'not_configured' };
  }

  try {
    const token = await getAccessToken();

    const res = await fetch(`${CALENDAR_API}/calendars/${CALENDAR_ID}/events/${eventId}`, {
      signal: requestSignal(),
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok && res.status !== 410) {
      const text = await res.text();
      console.error(`[Calendar] Event delete failed (${res.status}):`, text);
      return { success: false, reason: 'api_error', error: text };
    }

    console.log(`[Calendar] Event deleted: ${eventId}`);
    return { success: true };
  } catch (err) {
    console.error('[Calendar] Error deleting event:', err);
    return { success: false, reason: 'exception', error: err.message };
  }
}

// ---------------------------------------------------------------------------
// Status-aware helpers for lib/booking/calendar-sync.js (booking lifecycle).
// Unlike the legacy helpers above these always report `httpStatus`, never
// throw, use caller-supplied (stable) event IDs, and pass sendUpdates=none.
// They never add attendees. Existing helpers above are left unchanged.
// ---------------------------------------------------------------------------

export function isGoogleCalendarConfigured() {
  return isCalendarConfigured();
}

function buildEventBody(booking, { restore = false, withReminders = false } = {}) {
  const dateTime = parseBookingDateTime(booking);
  if (!dateTime) return null;
  const { summary, description, location } = buildEventDetails(booking);
  return {
    summary,
    description,
    ...(location && { location }),
    start: dateTime.start,
    end: dateTime.end,
    ...(restore && { status: 'confirmed' }),
    ...(withReminders && {
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 60 },
          { method: 'popup', minutes: 15 },
        ],
      },
    }),
  };
}

async function calendarRequest(method, path, body, { signal, ifMatch = null } = {}) {
  if (!isCalendarConfigured()) {
    return { success: false, reason: 'not_configured', httpStatus: null, error: 'calendar not configured' };
  }
  if (signal?.aborted) {
    return { success: false, reason: 'aborted', httpStatus: null, error: 'Google request aborted (booking sync deadline)' };
  }
  try {
    // Token and calendar call each get their own deadline (plus the caller's signal).
    const token = await getAccessToken({ signal });
    const sep = path.includes('?') ? '&' : '?';
    const res = await fetch(`${CALENDAR_API}/calendars/${CALENDAR_ID}${path}${sep}sendUpdates=none`, {
      signal: requestSignal(signal),
      method,
      headers: {
        Authorization: 'Bearer ' + token,
        ...(body && { 'Content-Type': 'application/json' }),
        // Conditional write (fix R7): Google answers 412 if the event changed since this etag.
        ...(ifMatch && { 'If-Match': ifMatch }),
      },
      ...(body && { body: JSON.stringify(body) }),
    });
    const text = res.status === 204 ? '' : await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch { json = null; }
    if (!res.ok) {
      return { success: false, reason: 'api_error', httpStatus: res.status, error: text };
    }
    return { success: true, httpStatus: res.status, json };
  } catch (err) {
    const timedOut = err?.name === 'TimeoutError' || err?.name === 'AbortError';
    return {
      success: false,
      reason: timedOut ? 'timeout' : 'exception',
      httpStatus: null,
      error: describeFetchError(err),
    };
  }
}

/** Insert an event with an explicit (stable) ID. Google answers 409 if the ID already exists. */
export async function insertCalendarEventWithId(eventId, booking, { signal } = {}) {
  const body = buildEventBody(booking, { withReminders: true });
  if (!body) return { success: false, reason: 'no_date', httpStatus: null, error: 'booking has no date' };
  const r = await calendarRequest('POST', '/events', { id: eventId, ...body }, { signal });
  return r.success ? { success: true, httpStatus: r.httpStatus, eventId: r.json?.id || eventId } : r;
}

/** GET an event (including cancelled ones — Google keeps them with status:'cancelled'). */
export async function getCalendarEvent(eventId, { signal } = {}) {
  const r = await calendarRequest('GET', `/events/${encodeURIComponent(eventId)}`, null, { signal });
  return r.success ? { success: true, httpStatus: r.httpStatus, event: r.json } : r;
}

/**
 * PATCH an event from booking state; `restore` also sets status:'confirmed' (undo a cancelled event).
 * `ifMatch` = etag from a prior GET → conditional write; 412 when the event changed meanwhile
 * (https://developers.google.com/workspace/calendar/api/guides/version-resources).
 */
export async function patchCalendarEvent(eventId, booking, { restore = false, signal, ifMatch = null } = {}) {
  const body = buildEventBody(booking, { restore });
  if (!body) return { success: false, reason: 'no_date', httpStatus: null, error: 'booking has no date' };
  const r = await calendarRequest('PATCH', `/events/${encodeURIComponent(eventId)}`, body, { signal, ifMatch });
  return r.success ? { success: true, httpStatus: r.httpStatus, eventId, event: r.json } : r;
}

/**
 * Fenced tombstone (fix R7): PATCH { status:'cancelled', extendedProperties.private.bbs_fence }
 * with a fresh nonce. Because the nonce changes the event, its etag moves even when it was
 * already cancelled, so every in-flight If-Match write holding an older etag gets 412.
 * PATCH merges `extendedProperties.private` keys, so other private/shared properties stay.
 */
export async function markCalendarEventCancelled(eventId, { signal, fence } = {}) {
  const body = {
    status: 'cancelled',
    ...(fence && { extendedProperties: { private: { bbs_fence: String(fence) } } }),
  };
  const r = await calendarRequest('PATCH', `/events/${encodeURIComponent(eventId)}`, body, { signal });
  return r.success ? { success: true, httpStatus: r.httpStatus, eventId, event: r.json } : r;
}

/** DELETE an event, reporting the raw HTTP status (caller decides whether 404/410 = already absent). */
export async function deleteCalendarEventById(eventId, { signal } = {}) {
  const r = await calendarRequest('DELETE', `/events/${encodeURIComponent(eventId)}`, null, { signal });
  return r.success ? { success: true, httpStatus: r.httpStatus } : r;
}
