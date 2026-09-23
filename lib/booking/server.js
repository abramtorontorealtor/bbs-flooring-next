/**
 * Production wiring for the booking lifecycle (Phase A, slice A3).
 *
 * Next.js route files call getBookingServerDeps() and hand the result to the
 * testable handler cores in ./handlers.js. Tests never import this module
 * (it pulls lib/email.js, lib/supabase.js etc.) — they inject fakes instead.
 *
 * Server-only. Uses the service-role Supabase client (bypasses RLS).
 */
import { getSupabaseAdminClient } from '@/lib/supabase';
import * as email from '@/lib/email';
import { sendTelegramAlert, formatBookingAlert } from '@/lib/telegram';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { getVisitorIdFromRequest, identifyVisitor } from '@/lib/identify';
import { requireAdmin } from '@/lib/api-auth';
import { createBookingLifecycle } from './lifecycle.js';
import { createCalendarSync } from './calendar-sync.js';
import { createSupabaseBookingStore } from './supabase-store.js';
import { createBookingNotifier } from './notify.js';

/** One lifecycle service bound to a Supabase client. */
export function createServerLifecycle(supabase = getSupabaseAdminClient(), { logger = console } = {}) {
  return createBookingLifecycle({
    db: createSupabaseBookingStore(supabase),
    calendar: createCalendarSync(),
    notify: createBookingNotifier({
      email,
      telegram: { sendTelegramAlert, formatBookingAlert },
      logger,
    }),
    logger,
  });
}

/** Everything the handler cores need, wired to real services. */
export function getBookingServerDeps() {
  const supabase = getSupabaseAdminClient();
  return {
    supabase,
    lifecycle: createServerLifecycle(supabase),
    checkRateLimit,
    getClientIP,
    getVisitorIdFromRequest,
    identifyVisitor,
    requireAdmin,
    logger: console,
  };
}
