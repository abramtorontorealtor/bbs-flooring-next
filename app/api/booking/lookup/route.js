import { NextResponse } from 'next/server';
import { getServiceClientOrNull } from '@/lib/supabase';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { handleLookup } from '@/lib/booking/customer-lookup';

/**
 * Look up a customer's bookings by email + full phone (no login).
 * Validation, literal email match, rate limit, customer-safe DTO: lib/booking/customer-lookup.js (R16).
 */
export async function POST(request) {
  const r = await handleLookup(request, { supabase: getServiceClientOrNull(), checkRateLimit, getClientIP, logger: console });
  return NextResponse.json(r.body, { status: r.status, ...(r.headers && { headers: r.headers }) });
}
