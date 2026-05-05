import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

/**
 * Homepage Product Showcase API
 * Returns curated, diverse products with visible prices.
 * 
 * Tabs: new (default), popular, sale
 * 
 * Curation rules:
 * - NEVER show hide_price products (no "Call for Pricing" on homepage)
 * - Max 2 products per brand (diversity)
 * - Spread across categories (hardwood, vinyl, laminate, solid)
 * - All must have images and be in stock
 */

const CARD_COLUMNS = [
  'id', 'slug', 'sku', 'name', 'brand', 'category', 'subcategory',
  'image_url', 'image_alt_text',
  'price_per_sqft', 'sale_price_per_sqft',
  'starting_price', 'has_variants', 'variant_count',
  'is_variant', 'is_on_sale', 'is_clearance', 'is_new_arrival', 'is_waterproof', 'is_canadian',
  'in_stock', 'made_in',
  'dimensions', 'thickness', 'colour', 'finish', 'grade', 'species', 'wear_layer', 'ac_rating',
  'collection',
  'sort_score', 'sort_score_all', 'is_archived_variant',
  'hide_price',
  'created_at',
].join(', ');

// Normalize category names (some have hyphens, some underscores)
function normalizeCategory(cat) {
  if (!cat) return 'other';
  return cat.replace(/-/g, '_').toLowerCase();
}

// Pick up to `count` items with brand + category diversity
function diversePick(items, count, maxPerBrand = 2) {
  const result = [];
  const brandCount = {};
  const catSlots = {};

  // Normalize categories
  const MAIN_CATS = ['engineered_hardwood', 'vinyl', 'laminate', 'solid_hardwood'];

  // First pass: ensure at least 1 from each main category
  for (const cat of MAIN_CATS) {
    const match = items.find(p =>
      normalizeCategory(p.category) === cat &&
      !result.includes(p)
    );
    if (match) {
      result.push(match);
      const b = match.brand || 'unknown';
      brandCount[b] = (brandCount[b] || 0) + 1;
      catSlots[cat] = 1;
    }
  }

  // Second pass: fill remaining slots with diversity constraints
  for (const p of items) {
    if (result.length >= count) break;
    if (result.includes(p)) continue;

    const b = p.brand || 'unknown';
    if ((brandCount[b] || 0) >= maxPerBrand) continue;

    result.push(p);
    brandCount[b] = (brandCount[b] || 0) + 1;
  }

  return result;
}

export async function GET(request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json([], { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const tab = searchParams.get('tab') || 'new';

  // Base query: visible prices, in stock, has image, not a variant
  let query = supabase
    .from('products')
    .select(CARD_COLUMNS)
    .eq('is_variant', false)
    .eq('in_stock', true)
    .not('image_url', 'is', null)
    .or('hide_price.is.null,hide_price.eq.false')
    .gt('price_per_sqft', 0);

  if (tab === 'sale') {
    query = query.eq('is_on_sale', true);
    query = query.order('sale_price_per_sqft', { ascending: true }).limit(50);
  } else if (tab === 'popular') {
    query = query.order('sort_score', { ascending: false }).limit(80);
  } else {
    // "new" — newest with visible prices
    query = query.order('created_at', { ascending: false }).limit(80);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[products/showcase] Supabase error:', error);
    return NextResponse.json([], { status: 500 });
  }

  const curated = diversePick(data || [], 8);

  return NextResponse.json(curated, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
