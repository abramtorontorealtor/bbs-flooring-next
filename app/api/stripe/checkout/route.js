import { NextResponse } from 'next/server';

// Stripe checkout session creator
// TODO: Wire to Stripe SDK when ready for production
export async function POST(request) {
  try {
    const { orderId, amount, customerEmail, orderNumber } = await request.json();

    if (!orderId || !amount || !customerEmail || !orderNumber) {
      return NextResponse.json(
        { error: 'Missing required fields (orderId, amount, customerEmail, orderNumber)' },
        { status: 400 }
      );
    }

    // Stripe requires STRIPE_SECRET_KEY env var
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    const stripe = require('stripe')(stripeKey);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      payment_intent_data: {
        capture_method: 'manual', // Authorize only — capture after stock verification
      },
      customer_email: customerEmail,
      line_items: [{
        price_data: {
          currency: 'cad',
          product_data: {
            name: `BBS Flooring Order ${orderNumber}`,
          },
          unit_amount: Math.round(amount * 100), // Stripe uses cents
        },
        quantity: 1,
      }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bbsflooring.ca'}/checkout?payment_success=true&order_number=${encodeURIComponent(orderNumber)}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bbsflooring.ca'}/checkout`,
      metadata: {
        order_id: orderId,
        order_number: orderNumber,
      },
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
