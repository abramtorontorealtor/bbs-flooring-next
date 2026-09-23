import { getBookingServerDeps, toNextResponse } from '@/lib/booking/server';
import { handleAvailability } from '@/lib/booking/availability-handler';

// Real measurement availability (Phase B). Never cached: every request reads fresh state.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  return toNextResponse(await handleAvailability(request, getBookingServerDeps()));
}
