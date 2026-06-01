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
async function getAccessToken() {
  const res = await fetch(TOKEN_URL, {
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

  if (!date) return null;

  if (!timeStr) {
    // All-day event
    return {
      allDay: true,
      start: { date },
      end: { date },
    };
  }

  // Parse "1:30 PM" or "5:00 PM" format
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    // Fallback to all-day if time can't be parsed
    return {
      allDay: true,
      start: { date },
      end: { date },
    };
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();

  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  const startDT = `${date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  // End = start + 1 hour
  const endHours = hours + 1;
  const endDT = `${date}T${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

  return {
    allDay: false,
    start: { dateTime: startDT, timeZone: 'America/Toronto' },
    end: { dateTime: endDT, timeZone: 'America/Toronto' },
  };
}

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

  const summary = `${service} — ${name}`;

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
