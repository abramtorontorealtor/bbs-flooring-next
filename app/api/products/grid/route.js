import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

// Card-level product endpoint for ALL listing/grid pages
// Returns only the fields needed by ProductCard + filters + sorting
// ~890KB vs ~1.8MB for select(*), plus 5-min edge cache
const CARD_COLUMNS = [
  'id', 'slug', 'sku', 'name', 'brand', 'category', 'subcategory',
  'image_url', 'image_alt_text',
  'price_per_sqft', 'sale_price_per_sqft',
  'starting_price', 'has_variants', 'variant_count',
  'is_variant', 'is_on_sale', 'is_clearance', 'is_new_arrival', 'is_waterproof', 'is_canadian',
  'in_stock', 'made_in',
  'dimensions', 'thickness', 'colour', 'finish', 'grade', 'species',
  'collection',
  'sort_score', 'sort_score_all', 'is_archived_variant',
  'created_at',
].join(', ');

export async function GET(request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const clearance = searchParams.get('clearance') === 'true';
  const sale = searchParams.get('sale') === 'true';
  const limit = Math.min(parseInt(searchParams.get('limit') || '1000', 10), 1000);

  let query = supabase
    .from('products')
    .select(CARD_COLUMNS)
    .eq('is_variant', false)
    .range(0, limit - 1);

  if (category) query = query.eq('category', category);
  if (clearance) query = query.eq('is_clearance', true);
  if (sale) query = query.eq('is_on_sale', true);

  // Default sort: newest first (matches existing behavior)
  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('[products/grid] Supabase error:', error);
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }

  return NextResponse.json(data || [], {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
