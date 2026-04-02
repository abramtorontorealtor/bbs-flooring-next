import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { sendOrderPaymentConfirmed } from '@/lib/email';

export async function POST(request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Missing orderId' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();

    // Fetch the order
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'confirmed',
        payment_status: 'paid',
      })
      .eq('id', orderId);

    if (updateError) throw updateError;

    // Send confirmation email to customer — don't let email failure tank the response
    let emailSent = false;
    try {
      await sendOrderPaymentConfirmed({ order: { ...order, status: 'confirmed', payment_status: 'paid' } });
      emailSent = true;
    } catch (emailErr) {
      console.error('[ConfirmPayment] Email send failed (order still confirmed):', emailErr);
    }

    return NextResponse.json({ success: true, emailSent });
  } catch (error) {
    console.error('Confirm payment error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}
