import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { sendOrderCustomerConfirmation, sendOrderAdminNotification } from '@/lib/email';
import { sendTelegramAlert, formatOrderAlert } from '@/lib/telegram';

async function generateOrderNumber(supabase) {
  // Sequential: BBS-10001, BBS-10002, etc. via Postgres sequence
  const { data, error } = await supabase.rpc('next_order_number');
  if (!error && data) return data;
  
  // Fallback: find highest existing and increment
  const { data: latest } = await supabase
    .from('orders')
    .select('order_number')
    .like('order_number', 'BBS-%')
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (latest?.[0]?.order_number) {
    const match = latest[0].order_number.match(/BBS-(\d+)/);
    if (match) return `BBS-${parseInt(match[1]) + 1}`;
  }
  return `BBS-10001`;
}

export async function POST(request) {
  try {
    const { orderData, paymentMethod, isCustomZone, termsAcceptedAt } = await request.json();

    if (!orderData || !orderData.customer_email || !orderData.items?.length) {
      return NextResponse.json(
        { success: false, error: 'Missing required order data (customer_email, items)' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();
    const orderNumber = await generateOrderNumber(supabase);

    // ── SECURITY: recompute money SERVER-SIDE from DB product prices ──
    // Never trust client-sent subtotal/line totals. Re-price every line item
    // against the products table, then derive tax + delivery + processing here.
    const HST_RATE = 0.13; // Ontario
    const DELIVERY_FEES = { pickup: 0, delivery: 140, inside: 200 };

    const itemIds = (orderData.items || [])
      .map((it) => it.product_id || it.id)
      .filter(Boolean);
    let priceMap = {};
    if (itemIds.length) {
      const { data: prods } = await supabase
        .from('products')
        .select('id, price_per_sqft, sale_price_per_sqft')
        .in('id', itemIds);
      for (const p of prods || []) {
        priceMap[p.id] = (p.sale_price_per_sqft != null ? p.sale_price_per_sqft : p.price_per_sqft) || 0;
      }
    }

    // Recompute subtotal from trusted prices × client-declared sqft.
    // Live orders bill on `actual_sqft` (line_total = actual_sqft × price_per_sqft),
    // so it MUST be first in the fallback chain. No coupons/discounts exist on
    // this store (Abram, Aug 9) — client-sent discount is ignored entirely.
    let subtotal = 0;
    for (const it of orderData.items || []) {
      const pid = it.product_id || it.id;
      const unit = priceMap[pid];
      const qty = Number(it.actual_sqft || it.sqft || it.square_footage || it.quantity || 0);
      if (unit != null && Number.isFinite(qty) && qty > 0) {
        subtotal += unit * qty;
      }
    }
    subtotal = Math.round(subtotal * 100) / 100;

    // Custom-zone (out-of-area) orders are priced manually as quotes → keep 0 delivery here.
    const deliveryFee = isCustomZone ? 0 : (DELIVERY_FEES[orderData.delivery_preference] ?? 0);
    const tax = Math.round(subtotal * HST_RATE * 100) / 100;
    const processingFee = paymentMethod === 'credit_card'
      ? Math.round((subtotal + tax + deliveryFee) * 0.029 * 100) / 100
      : 0;
    const total = Math.round((subtotal + tax + deliveryFee + processingFee) * 100) / 100;

    // Credit card orders start as 'awaiting_payment' — emails fire ONLY after
    // Stripe webhook confirms authorization (checkout.session.completed).
    // E-transfer/quote orders get emails immediately (no Stripe involvement).
    const isCreditCard = paymentMethod === 'credit_card';

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone,
        shipping_address: orderData.shipping_address,
        shipping_city: orderData.shipping_city,
        shipping_postal_code: orderData.shipping_postal_code,
        delivery_preference: orderData.delivery_preference,
        shipping_zone: orderData.shipping_zone,
        notes: orderData.notes,
        items: orderData.items,
        subtotal,
        tax,
        delivery_fee: deliveryFee,
        processing_fee: processingFee,
        total,
        payment_method: paymentMethod,
        payment_status: isCreditCard ? 'awaiting_payment' : 'pending',
        status: isCustomZone ? 'quote_requested' : (isCreditCard ? 'awaiting_payment' : 'pending_payment'),
        terms_accepted_at: termsAcceptedAt,
      })
      .select()
      .single();

    if (error) throw error;

    // Only send emails for non-credit-card orders.
    // CC orders: emails sent by Stripe webhook after successful authorization.
    const emailOrder = { ...order, order_number: orderNumber };
    if (!isCreditCard) {
      try {
        await Promise.all([
          sendOrderCustomerConfirmation({ order: emailOrder }),
          sendOrderAdminNotification({ order: emailOrder }),
        ]);
      } catch (err) {
        console.warn('[Order] Email send error (non-fatal):', err);
      }
    }
    // Suppress any abandoned cart leads for this email — order was placed, not abandoned
    if (emailOrder.customer_email) {
      supabase
        .from('contact_leads')
        .update({ status: 'converted' })
        .eq('customer_email', emailOrder.customer_email)
        .eq('source', 'abandoned_checkout')
        .eq('status', 'new')
        .then(() => {})
        .catch(() => {});
    }

    // Telegram alert fires for ALL orders — AWAIT so it isn't dropped on Vercel.
    try {
      await sendTelegramAlert(formatOrderAlert({ order: emailOrder }));
    } catch (e) {
      console.error('[Order] Telegram alert failed:', e?.message);
    }

    return NextResponse.json({
      success: true,
      order,
      orderNumber,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
