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
        payment_status: paymentMethod === 'credit_card' ? 'pending_capture' : 'pending',
        status: isCustomZone ? 'quote_requested' : 'pending',
        terms_accepted_at: termsAcceptedAt,
      })
      .select()
      .single();

    if (error) throw error;

    // Send order confirmation emails (non-blocking)
    const emailOrder = { ...order, order_number: orderNumber };
    sendOrderCustomerConfirmation({ order: emailOrder })
      .catch(err => console.warn('[Order] Customer email failed:', err));
    sendOrderAdminNotification({ order: emailOrder })
      .catch(err => console.warn('[Order] Admin email failed:', err));

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
