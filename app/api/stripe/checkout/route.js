import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';

// ── Fraud: Velocity limiting ────────────────────────────────────
// Max orders per email within a time window (prevents card testing)
const MAX_ORDERS_PER_EMAIL = 3;
const VELOCITY_WINDOW_HOURS = 1;
const MIN_CC_AMOUNT = 10;

async function checkVelocity(supabase, email) {
  const windowStart = new Date(Date.now() - VELOCITY_WINDOW_HOURS * 60 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('customer_email', email)
    .gte('created_at', windowStart);

  if (error) return { ok: true }; // Don't block on DB errors
  return { ok: (count || 0) < MAX_ORDERS_PER_EMAIL, count };
}

export async function POST(request) {
  try {
    // SECURITY: never trust a client-sent amount. We accept orderId only and
    // re-read the authoritative total (and email) from the DB order record.
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing required field (orderId)' },
        { status: 400 }
      );
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    const supabase = getSupabaseAdminClient();

    // ── SECURITY: authoritative amount comes from the DB, not the client ──
    const { data: dbOrder, error: orderErr } = await supabase
      .from('orders')
      .select('total, customer_email, order_number, customer_name, shipping_city, shipping_postal_code, payment_status')
      .eq('id', orderId)
      .single();

    if (orderErr || !dbOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (dbOrder.payment_status === 'completed') {
      return NextResponse.json({ error: 'Order is already paid.' }, { status: 409 });
    }

    const amount = Number(dbOrder.total);
    const customerEmail = dbOrder.customer_email;
    const orderNumber = dbOrder.order_number;
    const customerName = dbOrder.customer_name;
    const shippingCity = dbOrder.shipping_city;
    const shippingPostalCode = dbOrder.shipping_postal_code;

    if (!amount || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Order total is invalid.' }, { status: 400 });
    }

    // ── Fraud Check: Minimum amount (now on the trusted DB total) ──
    if (amount < MIN_CC_AMOUNT) {
      return NextResponse.json(
        { error: `Minimum order amount for credit card is $${MIN_CC_AMOUNT}. For smaller orders, please use e-Transfer.` },
        { status: 400 }
      );
    }

    // ── Fraud Check: Velocity ──
    const velocity = await checkVelocity(supabase, customerEmail);
    if (!velocity.ok) {
      return NextResponse.json(
        { error: 'Too many orders from this email. Please wait or contact us at (647) 428-1111.' },
        { status: 429 }
      );
    }

    const stripe = require('stripe')(stripeKey);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bbsflooring.ca';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',

      // ── Fraud: Collect billing address for AVS (Address Verification) ──
      billing_address_collection: 'required',

      payment_intent_data: {
        capture_method: 'manual', // Authorize only — capture after stock verification
        
        // ── Fraud: Statement descriptor — clear name on card statements ──
        statement_descriptor: 'BBS FLOORING',
        statement_descriptor_suffix: orderNumber, // e.g. "BBS-10001" — Stripe needs at least one letter
        
        // ── Fraud: Metadata for Stripe Radar rules ──
        metadata: {
          order_id: orderId,
          order_number: orderNumber,
          customer_name: customerName || '',
          shipping_city: shippingCity || '',
          shipping_postal_code: shippingPostalCode || '',
        },
      },

      // ── Fraud: 3D Secure — request SCA when supported ──
      // Shifts chargeback liability from merchant to issuing bank
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic',
        },
      },

      customer_email: customerEmail,
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 60 min expiry → triggers checkout.session.expired webhook

      line_items: [{
        price_data: {
          currency: 'cad',
          product_data: {
            name: `BBS Flooring — Order ${orderNumber}`,
            description: 'Premium flooring products',
          },
          unit_amount: Math.round(amount * 100), // Stripe uses cents
        },
        quantity: 1,
      }],

      success_url: `${siteUrl}/checkout?payment_success=true&order_number=${encodeURIComponent(orderNumber)}`,
      cancel_url: `${siteUrl}/checkout?resume_order=${encodeURIComponent(orderNumber)}`,

      metadata: {
        order_id: orderId,
        order_number: orderNumber,
      },

      // ── Fraud: Custom text — reduces "I don't recognize this charge" disputes ──
      custom_text: {
        submit: {
          message: 'Your card will be authorized (not charged) until we verify stock. You\'ll see "BBS FLOORING" on your statement.',
        },
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
