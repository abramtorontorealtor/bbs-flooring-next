import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { sendBookingCustomerConfirmation, sendBookingAdminNotification } from '@/lib/email';

export async function POST(request) {
  try {
    const { booking } = await request.json();

    if (!booking?.customer_email) {
      return NextResponse.json(
        { success: false, error: 'Customer email is required' },
        { status: 400 }
      );
    }

    // Persist booking to database
    const supabase = getSupabaseAdminClient();
    const { data: savedBooking, error: dbError } = await supabase
      .from('bookings')
      .insert({
        customer_name: booking.customer_name || booking.name,
        customer_email: booking.customer_email || booking.email,
        customer_phone: booking.customer_phone || booking.phone,
        customer_address: booking.customer_address || booking.address,
        postal_code: booking.postal_code,
        preferred_date: booking.preferred_date || booking.date,
        preferred_time: booking.preferred_time || booking.time,
        flooring_type: booking.flooring_type,
        square_footage: booking.square_footage || booking.sqft,
        notes: booking.notes,
        status: 'confirmed',
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Booking] DB insert failed:', dbError);
      // Don't fail the request — still send emails
    }

    // Use saved booking with DB-generated ID for emails
    const emailBooking = savedBooking || booking;

    // Send emails in parallel (non-blocking)
    const results = await Promise.allSettled([
      sendBookingCustomerConfirmation({ booking: emailBooking }),
      sendBookingAdminNotification({ booking: emailBooking }),
    ]);

    const customerResult = results[0];
    const customerSent = customerResult.status === 'fulfilled' && customerResult.value?.success;

    if (!customerSent) {
      console.warn('[Booking] Customer email failed:', customerResult.reason || customerResult.value);
    }

    return NextResponse.json({
      success: true,
      emailSent: customerSent,
      bookingId: savedBooking?.id || null,
    });
  } catch (error) {
    console.error('Booking confirmation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
