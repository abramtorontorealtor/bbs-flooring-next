import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/api-auth';
import { sendOrderCancelled } from '@/lib/email';

export async function POST(request) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { orderId, reason } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    // Fetch full order
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'cancelled') {
      return NextResponse.json({ error: 'Order is already cancelled' }, { status: 400 });
    }

    // If credit card with Stripe payment intent — cancel the authorization
    let stripeResult = null;
    if (order.payment_method === 'credit_card' && order.stripe_payment_intent_id) {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (stripeKey) {
        const stripe = require('stripe')(stripeKey);
        try {
          // Check current state — if captured, need to refund instead
          const pi = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id);
          if (pi.status === 'requires_capture') {
            // Auth not yet captured — cancel (no fees)
            stripeResult = await stripe.paymentIntents.cancel(order.stripe_payment_intent_id, {
              cancellation_reason: 'abandoned',
            });
          } else if (pi.status === 'succeeded') {
            // Already captured — full refund
            stripeResult = await stripe.refunds.create({
              payment_intent: order.stripe_payment_intent_id,
              reason: 'requested_by_customer',
            });
          }
          // If already cancelled, do nothing
        } catch (stripeErr) {
          console.warn('[Cancel] Stripe operation failed (continuing with DB update):', stripeErr.message);
        }
      }
    }

    // Update order in DB
    const cancelReason = reason || 'out_of_stock';
    await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        payment_status: order.payment_method === 'credit_card' ? 'cancelled' : order.payment_status,
        cancelled_at: new Date().toISOString(),
        cancel_reason: cancelReason,
      })
      .eq('id', orderId);

    // Send cancellation email to customer
    try {
      await sendOrderCancelled({ order, reason: cancelReason });
    } catch (emailErr) {
      console.warn('[Cancel] Customer email failed (non-fatal):', emailErr);
    }

    return NextResponse.json({
      success: true,
      stripe: stripeResult ? { status: stripeResult.status || stripeResult.object } : null,
    });
  } catch (error) {
    console.error('Order cancel error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
