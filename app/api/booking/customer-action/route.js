import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { sendBookingRescheduled, sendBookingCancelled, sendBookingAdminNotification } from '@/lib/email';

/**
 * Customer self-service: reschedule or cancel via lookup_token.
 * No login required — token acts as auth.
 */
export async function POST(request) {
  try {
    const { token, action, preferred_date, preferred_time, cancel_reason } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, error: 'Missing token' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    // Find booking by token
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('lookup_token', token)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    // Don't allow changes to completed/cancelled bookings
    if (['completed', 'cancelled'].includes(booking.status)) {
      return NextResponse.json({ success: false, error: `Cannot modify a ${booking.status} booking` }, { status: 400 });
    }

    let updatedBooking;

    switch (action) {
      case 'reschedule': {
        if (!preferred_date) {
          return NextResponse.json({ success: false, error: 'Missing preferred_date' }, { status: 400 });
        }

        const oldDate = booking.preferred_date;
        const oldTime = booking.preferred_time;

        const { data, error } = await supabase
          .from('bookings')
          .update({
            preferred_date,
            preferred_time: preferred_time || null,
            status: 'pending', // customer reschedule goes back to pending for admin re-confirmation
            updated_at: new Date().toISOString(),
          })
          .eq('id', booking.id)
          .select()
          .single();
        if (error) throw error;
        updatedBooking = data;

        // Notify customer + admin
        await Promise.allSettled([
          sendBookingRescheduled({ booking: updatedBooking, oldDate, oldTime }),
          sendBookingAdminNotification({ booking: updatedBooking, isReschedule: true }),
        ]);
        break;
      }

      case 'cancel': {
        const { data, error } = await supabase
          .from('bookings')
          .update({
            status: 'cancelled',
            notes: cancel_reason
              ? `Customer cancelled: ${cancel_reason}\n${booking.notes || ''}`
              : `Customer cancelled\n${booking.notes || ''}`,
            updated_at: new Date().toISOString(),
          })
          .eq('id', booking.id)
          .select()
          .single();
        if (error) throw error;
        updatedBooking = data;

        await Promise.allSettled([
          sendBookingCancelled({ booking: updatedBooking, reason: cancel_reason, cancelledByCustomer: true }),
          sendBookingAdminNotification({ booking: updatedBooking, isCancellation: true }),
        ]);
        break;
      }

      default:
        return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error) {
    console.error('Customer booking action error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
