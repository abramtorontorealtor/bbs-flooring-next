/**
 * Production wiring for the booking lifecycle (Phase A, slice A3).
 *
 * Next.js route files call getBookingServerDeps() and hand the result to the
 * testable handler cores in ./handlers.js. Tests never import this module
 * (it pulls lib/email.js, lib/supabase.js etc.) — they inject fakes instead.
 *
 * Server-only. Uses the service-role Supabase client (bypasses RLS).
 */
import { NextResponse } from 'next/server';
import { getServiceClientOrNull } from '@/lib/supabase';
import * as email from '@/lib/email';
import { sendTelegramAlert, formatBookingAlert } from '@/lib/telegram';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { getVisitorIdFromRequest, identifyVisitor } from '@/lib/identify';
import { requireAdmin } from '@/lib/api-auth';
import { createBookingLifecycle } from './lifecycle.js';
import { createCalendarSync } from './calendar-sync.js';
import { createSupabaseBookingStore } from './supabase-store.js';
import { createBookingNotifier } from './notify.js';
import { createAvailabilityService } from './availability.js';
import { resolveSchedulePolicy } from './schedule-policy.js';
import { listCalendarBusyEvents, availabilityCalendarIds } from '@/lib/google-calendar';

/**
 * Phase B availability wired to Supabase (service role) + the configured blocking calendars.
 * Reads EVERY row on the date (any status) so our own event ids are never counted as external busy.
 */
export function createServerAvailability(supabase, { logger = console } = {}) {
  if (!supabase) return null;
  const ids = availabilityCalendarIds();
  return createAvailabilityService({
    policy: resolveSchedulePolicy(),
    logger,
    async listBookingsForDate(date) {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, status, preferred_date, preferred_time, calendar_event_id')
        .eq('preferred_date', date)
        .limit(500);
      if (error) throw new Error(error.message || 'bookings read failed');
      return data || [];
    },
    listGoogleEvents: ids.length === 0 ? null : async ({ timeMin, timeMax, signal }) => {
      const all = [];
      for (const id of ids) {
        const r = await listCalendarBusyEvents(id, { timeMin, timeMax, signal });
        if (!r.ok) return r; // any calendar unread → partial, never "fully booked"
        all.push(...r.events);
      }
      return { ok: true, events: all };
    },
  });
}

/**
 * One lifecycle service bound to a Supabase client.
 * `silent:true` → no notifications (legacy /api/booking/reschedule never emailed).
 */
export function createServerLifecycle(supabase = getServiceClientOrNull(), { logger = console, silent = false } = {}) {
  return createBookingLifecycle({
    db: createSupabaseBookingStore(supabase),
    calendar: createCalendarSync(),
    notify: silent ? null : createBookingNotifier({
      email,
      telegram: { sendTelegramAlert, formatBookingAlert },
      logger,
    }),
    logger,
  });
}

/** Everything the handler cores need, wired to real services. */
export function getBookingServerDeps({ silent = false } = {}) {
  // Fix R15: service role or nothing. Handlers answer 503 when supabase is null
  // (the old getSupabaseAdminClient silently fell back to the anon key).
  const supabase = getServiceClientOrNull();
  if (!supabase) console.error('[booking] SUPABASE_SERVICE_ROLE_KEY missing: booking API fails closed (503)');
  return {
    supabase,
    lifecycle: supabase ? createServerLifecycle(supabase, { silent }) : null,
    availability: createServerAvailability(supabase),
    checkRateLimit,
    getClientIP,
    getVisitorIdFromRequest,
    identifyVisitor,
    requireAdmin,
    logger: console,
  };
}

/** Handler result → NextResponse. */
export function toNextResponse(result) {
  if (result?.passthrough) return result.passthrough;
  const init = { status: result?.status || 500 };
  if (result?.headers) init.headers = result.headers;
  return NextResponse.json(result?.body ?? { success: false, error: 'Unexpected error' }, init);
}
