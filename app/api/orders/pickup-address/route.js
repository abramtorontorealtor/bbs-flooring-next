import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/api-auth';

export async function PATCH(request) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { orderId, pickupAddress, pickupReference } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Missing orderId' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();

    // Enforce: payment must be captured before setting pickup address
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('payment_status, payment_method')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const isPaid = order.payment_status === 'captured' || order.payment_status === 'completed' || order.payment_status === 'paid';
    if (!isPaid && pickupAddress) {
      return NextResponse.json(
        { success: false, error: 'Payment must be captured before setting pickup address' },
        { status: 400 }
      );
    }

    const updates = {};
    if (pickupAddress !== undefined) updates.pickup_address = pickupAddress || null;
    if (pickupReference !== undefined) updates.pickup_reference = pickupReference || null;

    const { error: updateError } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update pickup address error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update pickup address' },
      { status: 500 }
    );
  }
}
