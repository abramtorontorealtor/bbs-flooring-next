import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';

/** Fetch a booking by its lookup_token (for customer self-service). */
export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, error: 'Missing token' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('lookup_token', token)
      .single();

    if (error || !booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('Booking token lookup error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
