import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';

/**
 * Resume a previously abandoned credit card order.
 * Creates a fresh Stripe Checkout session for the same order.
 * Works for both guests and logged-in users — the order number is the key.
 */
export async function POST(request) {
  try {
    const { orderNumber } = await request.json();

    if (!orderNumber) {
      return NextResponse.json({ error: 'Missing order number' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    // Find the order — must be in a resumable state
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only allow resuming orders that haven't been paid/cancelled
    const resumableStatuses = ['awaiting_payment', 'abandoned'];
    if (!resumableStatuses.includes(order.status)) {
      return NextResponse.json(
        { error: 'This order cannot be resumed — it may already be processed.' },
        { status: 400 }
      );
    }

    if (order.payment_method !== 'credit_card') {
      return NextResponse.json(
        { error: 'Only credit card orders can be resumed online. Please call us for e-transfer orders.' },
        { status: 400 }
      );
    }

    // Create a fresh Stripe checkout session
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
    }

    const stripe = require('stripe')(stripeKey);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      payment_intent_data: {
        capture_method: 'manual', // Same as original — authorize only
      },
      customer_email: order.customer_email,
      line_items: [{
        price_data: {
          currency: 'cad',
          product_data: {
            name: `BBS Flooring Order ${order.order_number}`,
          },
          unit_amount: Math.round(order.total * 100),
        },
        quantity: 1,
      }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bbsflooring.ca'}/checkout?payment_success=true&order_number=${encodeURIComponent(order.order_number)}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bbsflooring.ca'}/checkout?resume_order=${encodeURIComponent(order.order_number)}`,
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
      },
    });

    // Update order back to awaiting_payment (in case it was marked abandoned)
    await supabase
      .from('orders')
      .update({ status: 'awaiting_payment', payment_status: 'awaiting_payment' })
      .eq('id', order.id);

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('Resume order error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to resume order' },
      { status: 500 }
    );
  }
}
