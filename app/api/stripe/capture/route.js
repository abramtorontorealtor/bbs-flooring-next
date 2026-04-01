import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/api-auth';

export async function POST(request) {
  try {
    // Admin-only: verify caller is admin
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { paymentIntentId, orderId } = await request.json();

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 503 });
    }

    const stripe = require('stripe')(stripeKey);
    let piId = paymentIntentId;

    // If orderId is provided instead of paymentIntentId, look it up
    if (!piId && orderId) {
      const supabase = getSupabaseAdminClient();
      const { data: order, error } = await supabase
        .from('orders')
        .select('stripe_payment_intent_id')
        .eq('id', orderId)
        .single();

      if (error || !order?.stripe_payment_intent_id) {
        return NextResponse.json(
          { error: 'No payment intent found for this order. The Stripe webhook may not have fired yet.' },
          { status: 400 }
        );
      }
      piId = order.stripe_payment_intent_id;
    }

    if (!piId) {
      return NextResponse.json({ error: 'Missing paymentIntentId or orderId' }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.capture(piId);

    // Update order status in Supabase
    if (orderId) {
      const supabase = getSupabaseAdminClient();
      await supabase
        .from('orders')
        .update({ payment_status: 'captured', status: 'paid' })
        .eq('id', orderId);
    }

    return NextResponse.json({
      success: true,
      status: paymentIntent.status,
      amount_captured: paymentIntent.amount_captured / 100,
    });
  } catch (error) {
    console.error('Stripe capture error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to capture payment' },
      { status: 500 }
    );
  }
}
