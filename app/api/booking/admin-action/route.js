import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/api-auth';
import {
  sendBookingCustomerConfirmation,
  sendBookingRescheduled,
  sendBookingCancelled,
} from '@/lib/email';

/**
 * Admin actions for bookings: confirm, reschedule, cancel.
 * Each action updates the DB and sends the appropriate customer email.
 */
export async function POST(request) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { bookingId, action, preferred_date, preferred_time, cancel_reason } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ success: false, error: 'Missing bookingId' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    // Fetch current booking
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    let updatedBooking;
    let emailResult;

    switch (action) {
      case 'confirm': {
        const { data, error } = await supabase
          .from('bookings')
          .update({ status: 'confirmed', updated_at: new Date().toISOString() })
          .eq('id', bookingId)
          .select()
          .single();
        if (error) throw error;
        updatedBooking = data;
        console.log('[Booking Confirm] Sending email to:', updatedBooking.customer_email);
        emailResult = await sendBookingCustomerConfirmation({ booking: updatedBooking });
        console.log('[Booking Confirm] Email result:', JSON.stringify(emailResult));
        break;
      }

      case 'reschedule': {
        if (!preferred_date) {
          return NextResponse.json({ success: false, error: 'Missing preferred_date for reschedule' }, { status: 400 });
        }
        const updates = {
          preferred_date,
          preferred_time: preferred_time || null,
          status: 'confirmed', // reschedule re-confirms
          updated_at: new Date().toISOString(),
        };
        const { data, error } = await supabase
          .from('bookings')
          .update(updates)
          .eq('id', bookingId)
          .select()
          .single();
        if (error) throw error;
        updatedBooking = data;
        emailResult = await sendBookingRescheduled({ booking: updatedBooking, oldDate: booking.preferred_date, oldTime: booking.preferred_time });
        break;
      }

      case 'cancel': {
        const { data, error } = await supabase
          .from('bookings')
          .update({ status: 'cancelled', notes: cancel_reason ? `Cancelled: ${cancel_reason}\n${booking.notes || ''}` : booking.notes, updated_at: new Date().toISOString() })
          .eq('id', bookingId)
          .select()
          .single();
        if (error) throw error;
        updatedBooking = data;
        emailResult = await sendBookingCancelled({ booking: updatedBooking, reason: cancel_reason });
        break;
      }

      default:
        return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      emailSent: emailResult?.success || false,
    });
  } catch (error) {
    console.error('Booking admin action error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
