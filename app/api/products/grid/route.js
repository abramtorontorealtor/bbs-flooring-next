import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { CARD_COLUMNS, fetchAllRows, sortScoreKey } from '@/lib/products-server';

// Card-level product endpoint for ALL listing/grid pages
// Returns only the fields needed by ProductCard + filters + sorting
// (CARD_COLUMNS shared with lib/products-server.js), plus 5-min edge cache.
//
// Supabase/PostgREST caps a single request at 1000 rows; the catalogue has >1000
// grid-eligible products, so results are fetched in pages and concatenated.
// `?limit=N` is optional — omitted = every matching row.

export async function GET(request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const clearance = searchParams.get('clearance') === 'true';
  const sale = searchParams.get('sale') === 'true';
  const limitParam = parseInt(searchParams.get('limit') || '', 10);
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : null;

  const buildPage = (from, to) => {
    let query = supabase
      .from('products')
      .select(CARD_COLUMNS)
      .eq('is_variant', false);

    if (category) query = query.eq('category', category);
    if (clearance) query = query.or('is_clearance.eq.true,is_on_sale.eq.true').eq('hide_price', false);
    if (sale) query = query.eq('is_on_sale', true);

    // Default sort: showroom score (per-category `sort_score` on category pages,
    // global `sort_score_all` for All Flooring / brand pages), then newest.
    return query
      .order(sortScoreKey(category), { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);
  };

  const { rows, error } = await fetchAllRows(buildPage, { limit, label: 'products/grid' });

  if (error) {
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }

  return NextResponse.json(rows, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
