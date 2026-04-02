import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { sendOrderCustomerConfirmation, sendOrderAdminNotification } from '@/lib/email';

function generateOrderNumber() {
  const prefix = 'BBS';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
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
    const orderNumber = generateOrderNumber();

    // Calculate total
    const subtotal = orderData.subtotal || 0;
    const tax = orderData.tax || 0;
    const deliveryFee = orderData.delivery_fee || 0;
    const processingFee = paymentMethod === 'credit_card' ? (subtotal + tax + deliveryFee) * 0.029 : 0;
    const total = subtotal + tax + deliveryFee + processingFee;

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
    if (!isCreditCard) {
      const emailOrder = { ...order, order_number: orderNumber };
      try {
        await Promise.all([
          sendOrderCustomerConfirmation({ order: emailOrder }),
          sendOrderAdminNotification({ order: emailOrder }),
        ]);
      } catch (err) {
        console.warn('[Order] Email send error (non-fatal):', err);
      }
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
