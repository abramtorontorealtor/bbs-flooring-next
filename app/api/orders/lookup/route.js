import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { isSuppliesOnlyCart } from '@/lib/fulfilment';

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
      .select('order_number, delivery_preference, payment_method, status, payment_status, pickup_address, items, subtotal, tax, total, created_at')
      .eq('order_number', orderNumber)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // S4 (Sep 12 2026): expose only a derived boolean, never the line items.
    // Lets the Stripe-return confirmation render showroom-pickup copy.
    const { items, subtotal, tax, total, created_at, ...safe } = order;

    // H7: server-truth totals + product-only line facts for the GA4 `purchase`
    // event (never customer fields). Lets the Stripe-return page fire the
    // event without depending on the cart.
    const lines = Array.isArray(items) ? items : [];
    const analytics = {
      value: Number(total),
      tax: Number(tax),
      subtotal,
      payment_method: safe.payment_method,
      item_count: lines.length,
      items: lines.map((i) => ({
        item_id: i.product_id || i.sku || i.supply_code || null,
        item_name: i.product_name || i.name || null,
        price: i.unit_price ?? i.price_per_sqft ?? null,
        quantity: i.actual_sqft ?? i.qty ?? i.quantity ?? 1,
      })),
    };
    return NextResponse.json({ order: { ...safe, created_at, supplies_only: isSuppliesOnlyCart(items), analytics } });
  } catch (error) {
    console.error('Order lookup error:', error);
    return NextResponse.json({ error: 'Failed to look up order' }, { status: 500 });
  }
}
