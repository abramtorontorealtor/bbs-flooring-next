import { getBookingServerDeps, toNextResponse } from '@/lib/booking/server';
import { handleCustomerAction } from '@/lib/booking/handlers';

/**
 * Customer self-service: reschedule or cancel via lookup_token (token = auth).
 * Goes through the lifecycle service, so the Google Calendar event is moved /
 * deleted along with the DB change. Logic: lib/booking/handlers.js.
 */
export async function POST(request) {
  return toNextResponse(await handleCustomerAction(request, getBookingServerDeps()));
}
