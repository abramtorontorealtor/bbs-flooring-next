import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
}

export async function POST(request) {
  try {
    const { paymentIntentId, orderId, reason } = await request.json();

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 503 });
    }

    const stripe = require('stripe')(stripeKey);
    let piId = paymentIntentId;

    // Look up payment intent from order if not provided directly
    if (!piId && orderId) {
      const supabase = getSupabaseAdmin();
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
      const supabase = getSupabaseAdmin();
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
