import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { sendScheduleNotification } from '@/lib/email';
import { requireAdmin } from '@/lib/api-auth';

/**
 * One-shot pickup confirmation: saves address + reference + date, then emails customer.
 * Replaces the old two-step chain (pickup-address → schedule) that silently dropped emails.
 */
export async function POST(request) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { orderId, pickupAddress, pickupReference, scheduledDate, scheduledNote } = await request.json();

    if (!orderId || !pickupAddress || !scheduledDate) {
      return NextResponse.json(
        { error: 'Missing required fields (orderId, pickupAddress, scheduledDate)' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();

    // Verify order exists and payment is captured
    const { data: existing, error: fetchError } = await supabase
      .from('orders')
      .select('payment_status, customer_email')
      .eq('id', orderId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const isPaid = ['captured', 'completed', 'paid'].includes(existing.payment_status);
    if (!isPaid) {
      return NextResponse.json(
        { error: 'Payment must be captured before sending pickup confirmation' },
        { status: 400 }
      );
    }

    // Save everything in one update
    const { data: order, error: updateError } = await supabase
      .from('orders')
      .update({
        pickup_address: pickupAddress,
        pickup_reference: pickupReference || null,
        scheduled_date: scheduledDate,
        scheduled_note: scheduledNote || null,
      })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Send the email
    let emailSent = false;
    if (order.customer_email) {
      try {
        const result = await sendScheduleNotification({ order });
        emailSent = result?.success !== false;
        console.log(`[PickupConfirmation] Email ${emailSent ? 'sent' : 'failed'} for order ${order.order_number}`);
      } catch (emailErr) {
        console.error('[PickupConfirmation] Email error:', emailErr.message || emailErr);
      }
    }

    return NextResponse.json({ success: true, emailSent, order });
  } catch (error) {
    console.error('Pickup confirmation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send pickup confirmation' },
      { status: 500 }
    );
  }
}
