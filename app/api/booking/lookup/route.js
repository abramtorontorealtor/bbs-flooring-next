import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';

/**
 * Look up a booking by email + phone (no login required).
 * Returns the booking with its lookup_token so the customer can manage it.
 */
export async function POST(request) {
  try {
    const { email, phone } = await request.json();

    if (!email || !phone) {
      return NextResponse.json({ success: false, error: 'Email and phone are required' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    // Strip non-digits from phone for flexible matching
    const phoneDigits = phone.replace(/\D/g, '');

    // Find bookings matching email (case-insensitive)
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .ilike('customer_email', email.trim())
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    // Filter by phone match (flexible — strip non-digits from DB value too)
    const matched = bookings.filter(b => {
      const dbDigits = (b.customer_phone || '').replace(/\D/g, '');
      // Match last 10 digits (ignore country code)
      return dbDigits.slice(-10) === phoneDigits.slice(-10);
    });

    if (matched.length === 0) {
      return NextResponse.json({ success: false, error: 'No bookings found matching that email and phone number.' }, { status: 404 });
    }

    // Return bookings (with tokens for self-service)
    return NextResponse.json({
      success: true,
      bookings: matched.map(b => ({
        id: b.id,
        lookup_token: b.lookup_token,
        customer_name: b.customer_name,
        preferred_date: b.preferred_date,
        preferred_time: b.preferred_time,
        flooring_type: b.flooring_type,
        status: b.status,
        created_at: b.created_at,
      })),
    });
  } catch (error) {
    console.error('Booking lookup error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
