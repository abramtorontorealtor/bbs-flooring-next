import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

// Lightweight product endpoint for the quote calculator
// Returns ONLY the fields needed for product selection + pricing
// ~50KB vs ~1.8MB for select(*)
// Oct 30 2026: + box size / stock / lot fields for the /planner page (thickness +
// specifications let lib/installKit.js underpadMode() tell attached-pad floors apart).
export async function GET() {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, sku, category, subcategory, brand, price_per_sqft, sale_price_per_sqft, image_url, sqft_per_box, in_stock, lot_boxes_left, is_parent_product, has_variants, thickness, specifications')
    .eq('hide_price', false)
    .order('name', { ascending: true })
    .range(0, 4999); // Supabase default caps at 1000 rows — 1,221 priced products (Oct 30 2026); Vidar/Wickham/Woden were being dropped

  if (error) {
    console.error('[calculator/products] Supabase error:', error);
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }

  return NextResponse.json(data || [], {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
