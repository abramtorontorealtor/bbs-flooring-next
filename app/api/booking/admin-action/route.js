import { getBookingServerDeps, toNextResponse } from '@/lib/booking/server';
import { handleAdminAction } from '@/lib/booking/handlers';

/**
 * Admin booking actions: confirm, reschedule, cancel, complete (requireAdmin).
 * All go through the lifecycle service: DB first, then calendar, then the
 * customer email. Response includes `calendarSync` so the CRM can warn.
 * Logic: lib/booking/handlers.js.
 */
export async function POST(request) {
  return toNextResponse(await handleAdminAction(request, getBookingServerDeps()));
}
