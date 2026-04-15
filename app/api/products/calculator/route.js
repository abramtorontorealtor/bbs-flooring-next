import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

// Lightweight product endpoint for the quote calculator
// Returns ONLY the fields needed for product selection + pricing
// ~50KB vs ~1.8MB for select(*)
export async function GET() {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, category, brand, price_per_sqft, sale_price_per_sqft, image_url')
    .eq('hide_price', false)
    .order('name', { ascending: true });

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
