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
import { createAvailabilitySources } from './availability-sources.js';
import { resolveSchedulePolicy } from './schedule-policy.js';
import { createSlotGate } from './reservation.js';
import { listCalendarBusyEvents, availabilityCalendarIds } from '@/lib/google-calendar';

/** Phase B availability wired to Supabase + the configured blocking calendars (none by default). */
export function createServerAvailability(supabase, { logger = console } = {}) {
  if (!supabase) return null;
  const src = createAvailabilitySources(supabase);
  const ids = availabilityCalendarIds();
  return createAvailabilityService({
    policy: resolveSchedulePolicy(),
    logger,
    listLiveBookings: src.listLiveBookings,
    resolveOwnedEventIds: src.resolveOwnedEventIds,
    // Every configured calendar is read; blocks from calendars that answered are kept even when
    // another fails (B1-R8) and the result is then 'partial'.
    listGoogleEvents: ids.length === 0 ? null : async ({ timeMin, timeMax, signal, collect }) => {
      // collect() receives each page as it arrives, so an outer timeout keeps known blocks (recheck S1).
      const results = await Promise.all(ids.map((id) => listCalendarBusyEvents(id, { timeMin, timeMax, signal, onPage: collect })));
      const events = results.flatMap((r) => r.events || []);
      const failed = results.find((r) => !r.ok);
      return failed ? { ok: false, partial: true, code: failed.code, events } : { ok: true, events };
    },
  });
}

/**
 * One lifecycle service bound to a Supabase client.
 * `silent:true` → no notifications (legacy /api/booking/reschedule never emailed).
 */
export function createServerLifecycle(supabase = getServiceClientOrNull(), { logger = console, silent = false } = {}) {
  // B2: policy + fresh availability (DB + configured calendars) before the atomic reservation.
  const policy = resolveSchedulePolicy();
  const slotGate = createSlotGate({ policy, availability: createServerAvailability(supabase, { logger }), logger });
  return createBookingLifecycle({
    slotGate,
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
    // B1-R1: real token resolver for availability's reschedule exclusion.
    findBookingByToken: supabase ? createAvailabilitySources(supabase).findBookingByToken : null,
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
