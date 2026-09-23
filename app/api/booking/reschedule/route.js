import { getBookingServerDeps, toNextResponse } from '@/lib/booking/server';
import { handleLegacyReschedule } from '@/lib/booking/handlers';

// DEPRECATED legacy admin reschedule route — kept for backward compat.
// Use /api/booking/admin-action with action='reschedule' instead.
// Now routed through the lifecycle service (calendar event moves); still sends
// no emails, as before.
export async function POST(request) {
  return toNextResponse(await handleLegacyReschedule(request, getBookingServerDeps({ silent: true })));
}
