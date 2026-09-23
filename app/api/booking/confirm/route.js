import { getBookingServerDeps, toNextResponse } from '@/lib/booking/server';
import { handleConfirm } from '@/lib/booking/handlers';

// Public booking submission. Rate limit + 24h dedupe, then the lifecycle
// service persists FIRST; calendar + emails + Telegram only after a saved row.
// Logic lives in lib/booking/handlers.js (unit-tested with fakes).
export async function POST(request) {
  return toNextResponse(await handleConfirm(request, getBookingServerDeps()));
}
