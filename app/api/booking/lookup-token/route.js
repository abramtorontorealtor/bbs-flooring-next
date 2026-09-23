import { NextResponse } from 'next/server';
import { getServiceClientOrNull } from '@/lib/supabase';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { handleLookupToken } from '@/lib/booking/customer-lookup';

/** Fetch one booking by lookup_token (customer self-service). Customer-safe DTO only (R16). */
export async function POST(request) {
  const r = await handleLookupToken(request, { supabase: getServiceClientOrNull(), checkRateLimit, getClientIP, logger: console });
  return NextResponse.json(r.body, { status: r.status, ...(r.headers && { headers: r.headers }) });
}
