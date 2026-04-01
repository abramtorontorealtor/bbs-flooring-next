import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { paymentIntentId, orderId } = await request.json();

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
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

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
