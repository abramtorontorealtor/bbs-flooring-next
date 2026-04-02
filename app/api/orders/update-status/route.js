import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { sendOrderStatusUpdate } from '@/lib/email';

/**
 * Server-side order status update with email notifications.
 * All status changes go through here — no more raw client-side DB updates.
 */
export async function POST(request) {
  try {
    const { orderId, newStatus } = await request.json();

    if (!orderId || !newStatus) {
      return NextResponse.json({ error: 'Missing orderId or newStatus' }, { status: 400 });
    }

    const validStatuses = [
      'pending_payment', 'awaiting_payment', 'pending', 'confirmed', 'paid',
      'processing', 'shipped', 'delivered', 'cancelled', 'abandoned',
      'quote_requested', 'refunded',
    ];

    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const oldStatus = order.status;

    // Update the order status
    const updates = { status: newStatus };

    // Auto-set payment_status for certain transitions
    if (newStatus === 'cancelled') {
      updates.payment_status = order.payment_status === 'authorized' ? 'cancelled' : order.payment_status;
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId);

    if (updateError) throw updateError;

    // Send email notification for meaningful transitions
    const emailTransitions = ['processing', 'shipped', 'delivered'];
    if (emailTransitions.includes(newStatus) && order.customer_email) {
      try {
        await sendOrderStatusUpdate({
          order: { ...order, status: newStatus },
          oldStatus,
        });
      } catch (emailErr) {
        console.error('[UpdateStatus] Email send error (non-fatal):', emailErr);
      }
    }

    return NextResponse.json({ success: true, oldStatus, newStatus });
  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update status' }, { status: 500 });
  }
}
