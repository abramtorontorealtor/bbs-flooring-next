import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/api-auth';

/**
 * Admin follow-up on orders that need a human touch (custom-freight quotes,
 * pending e-transfers). Two independent, idempotent actions:
 *   contacted:     true  → stamp orders.contacted_at (clears the "New" badge)
 *   paymentMethod: 'etransfer' | 'credit_card' → record how the customer will
 *                  pay AFTER a freight quote call. Only allowed while the order
 *                  is still unpaid — never rewrites a captured/completed order.
 *
 * Customer never sees a payment selector on custom-zone checkout (the quote
 * comes first), so this is the ONLY place the real method gets recorded.
 */
const ALLOWED_METHODS = ['etransfer', 'credit_card', 'quote_request'];
const UNPAID = ['pending', 'awaiting_payment', null, undefined, ''];

export async function PATCH(request) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { orderId, contacted, paymentMethod } = await request.json();
    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Missing orderId' }, { status: 400 });
    }
    if (paymentMethod !== undefined && !ALLOWED_METHODS.includes(paymentMethod)) {
      return NextResponse.json({ success: false, error: 'Invalid paymentMethod' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, payment_status, payment_method, status, contacted_at')
      .eq('id', orderId)
      .single();
    if (fetchError || !order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const updates = {};
    if (contacted === true && !order.contacted_at) updates.contacted_at = new Date().toISOString();
    if (contacted === false) updates.contacted_at = null;

    if (paymentMethod !== undefined && paymentMethod !== order.payment_method) {
      if (!UNPAID.includes(order.payment_status)) {
        return NextResponse.json(
          { success: false, error: `Cannot change payment method on a ${order.payment_status} order` },
          { status: 400 }
        );
      }
      updates.payment_method = paymentMethod;
      // Keep payment_status coherent with the method so existing CRM affordances
      // (Mark as Paid for e-transfer, Stripe flow for card) light up correctly.
      updates.payment_status = paymentMethod === 'credit_card' ? 'awaiting_payment' : 'pending';
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: true, noop: true });
    }

    const { error: updateError } = await supabase.from('orders').update(updates).eq('id', orderId);
    if (updateError) throw updateError;

    return NextResponse.json({ success: true, updates });
  } catch (error) {
    console.error('Quote follow-up error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}
