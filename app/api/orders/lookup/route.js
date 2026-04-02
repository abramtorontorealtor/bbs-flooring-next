import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';

// Public order lookup by order_number — returns only non-sensitive fields
// Used by checkout success page to show correct delivery/pickup info
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('order_number');

    if (!orderNumber) {
      return NextResponse.json({ error: 'Missing order_number' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { data: order, error } = await supabase
      .from('orders')
      .select('order_number, delivery_preference, payment_method, status, payment_status, pickup_address')
      .eq('order_number', orderNumber)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Order lookup error:', error);
    return NextResponse.json({ error: 'Failed to look up order' }, { status: 500 });
  }
}
