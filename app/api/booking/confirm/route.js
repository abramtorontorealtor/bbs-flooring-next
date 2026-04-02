import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { sendBookingRequestReceived, sendBookingAdminNotification } from '@/lib/email';

export async function POST(request) {
  try {
    const { booking } = await request.json();

    if (!booking?.customer_email) {
      return NextResponse.json(
        { success: false, error: 'Customer email is required' },
        { status: 400 }
      );
    }

    // Persist booking as PENDING (not confirmed — admin confirms later)
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
        service_type: booking.service_type || 'free_measurement',
        product_name: booking.product_name,
        quote_total: booking.quote_total,
        notes: booking.notes,
        status: 'pending',
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Booking] DB insert failed:', dbError);
    }

    const emailBooking = savedBooking || booking;

    // Send "Request Received" email to customer + admin notification
    const results = await Promise.allSettled([
      sendBookingRequestReceived({ booking: emailBooking }),
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
    console.error('Booking creation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
