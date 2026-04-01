import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { paymentIntentId, orderId, reason } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Missing paymentIntentId' }, { status: 400 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json(
        { error: 'Stripe is not configured.' },
        { status: 503 }
      );
    }

    const stripe = require('stripe')(stripeKey);
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId, {
      cancellation_reason: reason || 'requested_by_customer',
    });

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
