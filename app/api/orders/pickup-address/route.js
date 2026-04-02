import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/api-auth';

export async function PATCH(request) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { orderId, pickupAddress } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Missing orderId' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();

    const { error: updateError } = await supabase
      .from('orders')
      .update({ pickup_address: pickupAddress || null })
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
