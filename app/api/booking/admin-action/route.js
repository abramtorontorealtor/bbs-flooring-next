import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/api-auth';
import {
  sendBookingCustomerConfirmation,
  sendBookingRescheduled,
  sendBookingCancelled,
} from '@/lib/email';
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '@/lib/google-calendar';

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

        // Update the existing (PENDING) calendar event created on submission, or create one
        // if it's missing. MUST be awaited so it isn't killed when the serverless fn returns.
        try {
          const calResult = booking.calendar_event_id
            ? await updateCalendarEvent(booking.calendar_event_id, updatedBooking)
            : await createCalendarEvent(updatedBooking);
          if (calResult?.success && calResult.eventId && !booking.calendar_event_id) {
            await supabase.from('bookings').update({ calendar_event_id: calResult.eventId }).eq('id', bookingId);
            console.log('[Booking Confirm] Calendar event saved:', calResult.eventId);
          }
        } catch (err) {
          console.error('[Booking Confirm] Calendar error:', err);
        }
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

        // Move the existing calendar event to the new date/time (or create if missing).
        // MUST be awaited so it isn't killed when the serverless fn returns.
        try {
          const calResult = booking.calendar_event_id
            ? await updateCalendarEvent(booking.calendar_event_id, updatedBooking)
            : await createCalendarEvent(updatedBooking);
          if (calResult?.success && calResult.eventId && !booking.calendar_event_id) {
            await supabase.from('bookings').update({ calendar_event_id: calResult.eventId }).eq('id', bookingId);
          }
        } catch (err) {
          console.error('[Booking Reschedule] Calendar error:', err);
        }
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

        // Delete the calendar event. MUST be awaited so it isn't killed when the fn returns.
        if (booking.calendar_event_id) {
          try {
            await deleteCalendarEvent(booking.calendar_event_id);
            await supabase.from('bookings').update({ calendar_event_id: null }).eq('id', bookingId);
          } catch (err) {
            console.error('[Booking Cancel] Calendar error:', err);
          }
        }
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
