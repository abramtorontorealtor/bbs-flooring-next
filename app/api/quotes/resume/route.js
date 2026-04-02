import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token || token.length < 10) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { data: quote, error } = await supabase
      .from('quotes')
      .select('product_name, square_footage, price_per_sqft, removal_type, needs_baseboards, needs_shoe_moulding, flooring_cost, installation_cost, removal_cost, baseboard_cost, shoe_moulding_cost, delivery_cost, subtotal, tax, total, is_member')
      .eq('resume_token', token)
      .single();

    if (error || !quote) {
      return NextResponse.json({ success: false, error: 'Quote not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, quote });
  } catch (err) {
    console.error('[Quote Resume] Error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
