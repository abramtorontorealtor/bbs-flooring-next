import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { sendOrderCustomerConfirmation, sendOrderAdminNotification, sendAbandonedCartRecovery } from '@/lib/email';
import { sendTelegramAlert, formatOrderAlert } from '@/lib/telegram';

// Stripe webhook handler — receives events after checkout completion.
// Critical: stores payment_intent ID so admin can capture pre-authed payments.
// Also triggers order confirmation emails (moved from orders/create to avoid
// premature emails when customers abandon at the Stripe checkout screen).

export async function POST(request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const stripe = require('stripe')(stripeKey);
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event;

  // SECURITY (F3): signature verification is MANDATORY. Never parse raw/unsigned events —
  // an attacker could POST a fake checkout.session.completed to mark an order paid.
  if (!webhookSecret) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not set — refusing to process unsigned events.');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      const orderNumber = session.metadata?.order_number;
      const paymentIntentId = session.payment_intent;

      if (!orderId && !orderNumber) {
        console.warn('[Stripe Webhook] checkout.session.completed with no order metadata');
        break;
      }

      // ── Idempotency (F7): Stripe retries the same event on timeout/cold-start.
      // If this order is already authorized/captured, acknowledge and skip re-sending
      // confirmation emails + Telegram alerts (was firing 3–5 duplicates per retry).
      const idemFilter = orderId ? { id: orderId } : { order_number: orderNumber };
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('payment_status')
        .match(idemFilter)
        .single();
      if (existingOrder && ['authorized', 'captured', 'paid'].includes(existingOrder.payment_status)) {
        console.log(`[Stripe Webhook] Duplicate checkout.session.completed for ${orderNumber || orderId} (payment_status=${existingOrder.payment_status}) — already processed, skipping.`);
        break;
      }

      // ── Extract billing address from Stripe for fraud detection ──
      const billing = session.customer_details?.address || {};
      const billingUpdate = {
        stripe_payment_intent_id: paymentIntentId,
        stripe_session_id: session.id,
        payment_status: 'authorized', // manual capture — authorized but not yet captured
        status: 'pending', // awaiting stock verification + capture
        billing_address: [billing.line1, billing.line2].filter(Boolean).join(', ') || null,
        billing_city: billing.city || null,
        billing_postal_code: billing.postal_code || null,
        billing_country: billing.country || null,
      };

      // Find and update the order
      const filter = orderId ? { id: orderId } : { order_number: orderNumber };
      const { data: updatedOrder, error } = await supabase
        .from('orders')
        .update(billingUpdate)
        .match(filter)
        .select()
        .single();

      if (error) {
        console.error('[Stripe Webhook] Failed to update order:', error);
      } else {
        console.log(`[Stripe Webhook] Order ${orderNumber || orderId} updated with payment_intent ${paymentIntentId}`);

        // ── Fraud: Check billing vs shipping address mismatch ──
        let fraudFlag = false;
        if (updatedOrder.shipping_postal_code && billingUpdate.billing_postal_code) {
          const shipPC = (updatedOrder.shipping_postal_code || '').toUpperCase().replace(/\s/g, '');
          const billPC = (billingUpdate.billing_postal_code || '').toUpperCase().replace(/\s/g, '');
          // Flag if postal codes don't share the same FSA (first 3 chars) OR billing is outside Canada
          const postalMismatch = shipPC.substring(0, 3) !== billPC.substring(0, 3);
          const foreignCard = billingUpdate.billing_country && billingUpdate.billing_country !== 'CA';
          
          if (postalMismatch || foreignCard) {
            fraudFlag = true;
            await supabase.from('orders').update({ fraud_flag: true }).match(filter);
            console.warn(`[Stripe Webhook] ⚠️ FRAUD FLAG on ${orderNumber}: billing ${billPC} (${billingUpdate.billing_country}) vs shipping ${shipPC}`);
          }
        }

        // NOW send confirmation emails — payment is actually authorized
        try {
          const emailOrder = { 
            ...updatedOrder, 
            order_number: updatedOrder.order_number || orderNumber,
            fraud_flag: fraudFlag,
          };
          await Promise.all([
            sendOrderCustomerConfirmation({ order: emailOrder }),
            sendOrderAdminNotification({ order: emailOrder }),
          ]);
          await sendTelegramAlert(formatOrderAlert({ order: { ...emailOrder, payment_method: 'credit_card' } }));
          console.log(`[Stripe Webhook] Confirmation emails sent for ${orderNumber || orderId}`);
        } catch (emailErr) {
          console.error('[Stripe Webhook] Email send error (non-fatal):', emailErr);
        }
      }
      break;
    }

    case 'checkout.session.expired': {
      // Customer started checkout but never completed payment (Stripe sessions expire after 24h by default).
      // Send abandoned cart recovery email with a link to resume the order.
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      const orderNumber = session.metadata?.order_number;

      if (!orderId && !orderNumber) break;

      const filter = orderId ? { id: orderId } : { order_number: orderNumber };
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .match(filter)
        .single();

      if (order && order.status === 'awaiting_payment') {
        // Update status to abandoned
        await supabase
          .from('orders')
          .update({ status: 'abandoned', payment_status: 'expired' })
          .match(filter);

        // Send recovery email
        try {
          await sendAbandonedCartRecovery({ order });
          console.log(`[Stripe Webhook] Abandoned cart recovery email sent for ${orderNumber || orderId}`);
        } catch (emailErr) {
          console.error('[Stripe Webhook] Recovery email error:', emailErr);
        }
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object;
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('stripe_payment_intent_id', pi.id);

      if (error) console.error('[Stripe Webhook] Failed to update failed payment:', error);
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object;
      const piId = charge.payment_intent;
      if (piId) {
        const { error } = await supabase
          .from('orders')
          .update({ payment_status: 'refunded', status: 'refunded' })
          .eq('stripe_payment_intent_id', piId);

        if (error) console.error('[Stripe Webhook] Failed to update refund:', error);
      }
      break;
    }

    default:
      // Unhandled event type — acknowledge receipt
      break;
  }

  return NextResponse.json({ received: true });
}

// Disable body parsing — Stripe needs the raw body for signature verification
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
