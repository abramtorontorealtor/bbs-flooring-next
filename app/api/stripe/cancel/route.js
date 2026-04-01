import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/api-auth';

export async function POST(request) {
  try {
    // Admin-only: verify caller is admin
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { paymentIntentId, orderId, reason } = await request.json();

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 503 });
    }

    const stripe = require('stripe')(stripeKey);
    let piId = paymentIntentId;

    // Look up payment intent from order if not provided directly
    if (!piId && orderId) {
      const supabase = getSupabaseAdminClient();
      const { data: order, error } = await supabase
        .from('orders')
        .select('stripe_payment_intent_id')
        .eq('id', orderId)
        .single();

      if (error || !order?.stripe_payment_intent_id) {
        return NextResponse.json(
          { error: 'No payment intent found for this order.' },
          { status: 400 }
        );
      }
      piId = order.stripe_payment_intent_id;
    }

    if (!piId) {
      return NextResponse.json({ error: 'Missing paymentIntentId or orderId' }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.cancel(piId, {
      cancellation_reason: reason || 'requested_by_customer',
    });

    // Update order status
    if (orderId) {
      const supabase = getSupabaseAdminClient();
      await supabase
        .from('orders')
        .update({ payment_status: 'cancelled', status: 'cancelled' })
        .eq('id', orderId);
    }

    return NextResponse.json({
      success: true,
      status: paymentIntent.status,
    });
  } catch (error) {
    console.error('Stripe cancel error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel payment' },
      { status: 500 }
    );
  }
}
