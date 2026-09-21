import { getSupabaseServerClient } from '@/lib/supabase';

// Card-level product columns — must match api/products/grid/route.js
export const CARD_COLUMNS = [
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

// PostgREST (Supabase) silently caps any single request at 1000 rows (`max-rows`).
// The catalogue is >1000 grid-eligible products, so every "fetch all" query must page.
const PAGE_SIZE = 1000;

/**
 * Fetch every row for a query, paging past PostgREST's 1000-row per-request cap.
 *
 * @param {(from: number, to: number) => PromiseLike<{data: Array|null, error: any}>} buildPage
 *   Must return a FRESH query builder (filters + order applied) for the inclusive range [from, to].
 * @param {Object} [opts]
 * @param {number|null} [opts.limit=null] - Max rows to return (null = all rows)
 * @param {string} [opts.label='products-server'] - Log prefix on error
 * @returns {Promise<{rows: Array, error: any}>} rows collected so far + first error (if any)
 */
export async function fetchAllRows(buildPage, { limit = null, label = 'products-server' } = {}) {
  const rows = [];
  let from = 0;
  for (;;) {
    const end = limit != null ? Math.min(from + PAGE_SIZE, limit) : from + PAGE_SIZE;
    const to = end - 1;
    if (to < from) break;
    const { data, error } = await buildPage(from, to);
    if (error) {
      console.error(`[${label}] Supabase error:`, error);
      return { rows, error };
    }
    const page = data || [];
    rows.push(...page);
    // A short page means we've reached the end of the result set.
    if (page.length < to - from + 1) break;
    from = to + 1;
    if (limit != null && from >= limit) break;
  }
  return { rows, error: null };
}

/**
 * Ranking column for a product set: per-category order when scoped to one
 * category, all-products order otherwise. Both recomputed by scripts/showroom-sort.py.
 */
export function sortScoreKey(category) {
  return category ? 'sort_score' : 'sort_score_all';
}

/**
 * Fetch products for grid pages (server-side).
 * Same query as api/products/grid/route.js but callable from page.jsx server components.
 * Pages past Supabase's 1000-row cap so ALL matching products are returned.
 *
 * @param {Object} opts
 * @param {string} [opts.category] - Filter by category (e.g. 'vinyl', 'engineered_hardwood')
 * @param {string} [opts.brand] - Filter by brand name (case-insensitive ilike)
 * @param {boolean} [opts.clearance] - Filter clearance items only
 * @param {boolean} [opts.sale] - Filter sale items only
 * @param {number|null} [opts.limit=null] - Max products to return (null = all matching rows)
 * @returns {Promise<Array>} Product array
 */
export async function getProductsForGrid({ category, brand, subcategory, clearance, sale, canadian, limit = null } = {}) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const buildPage = (from, to) => {
    let query = supabase
      .from('products')
      .select(CARD_COLUMNS)
      .eq('is_variant', false);

    if (category) query = query.eq('category', category);
    if (subcategory) query = query.eq('subcategory', subcategory);
    if (brand) query = query.ilike('brand', `%${brand}%`);
    if (canadian) query = query.eq('is_canadian', true);
    if (clearance) query = query.eq('is_clearance', true);
    if (sale) query = query.eq('is_on_sale', true);

    // Category pages rank by per-category score; All Flooring / brand / mixed sets by the global score.
    return query
      .order(sortScoreKey(category), { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);
  };

  const { rows, error } = await fetchAllRows(buildPage, { limit });
  if (error) return [];
  return rows;
}

/**
 * Get clearance/sale products for the /clearance page, SERVER-SIDE.
 * Mirrors the /api/products/grid?clearance=true filter exactly:
 *   is_clearance=true OR is_on_sale=true, hide_price=false, non-variant.
 * Lets /clearance render products + schema in SSR HTML (crawler-visible),
 * instead of only client-fetching (which left the page empty for bots).
 */
export async function getClearanceProducts({ limit = null } = {}) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const buildPage = (from, to) => supabase
    .from('products')
    .select(CARD_COLUMNS)
    .eq('is_variant', false)
    // Call-for-pricing (hide_price) items are normally kept OFF clearance, EXCEPT BBS
    // Reserve (house brand, ex-Lee): Abram wants its "Call for Pricing" items to stay on /clearance
    // as an enticement (Aug 26, 2026). Reversible: restore .eq('hide_price', false).
    .or('hide_price.eq.false,brand.eq."BBS Reserve"')
    .or('is_clearance.eq.true,is_on_sale.eq.true')
    // Brands excluded from clearance per Abram (Aug 19, 2026). Reversible: remove line to restore.
    .not('brand', 'in', '("Canadian Standard","NAF Flooring","Vidar Design Flooring")')
    // Specific Simba SKUs hidden from clearance (no product images) per Abram (Aug 19, 2026). Reversible.
    .not('id', 'in', '("791fdce1-2a6c-4593-94ed-1e9af9a44706","214fc2d3-08eb-4962-aba2-f26c36cc6d88","a3ed4ce6-ab03-4238-97d9-0ad2006bbaeb")')
    .order('sort_score', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  const { rows, error } = await fetchAllRows(buildPage, { limit, label: 'products-server clearance' });
  if (error) return [];
  return rows;
}

/**
 * Get price stats for a product category (min/max price, count).
 * Used by category pages for dynamic metadata and schema.
 * Excludes variants, hidden-price products, out-of-stock, and zero-price items.
 *
 * @param {string} category - DB category key (e.g. 'laminate', 'vinyl', 'engineered_hardwood', 'solid_hardwood')
 * @returns {Promise<{lowPrice: string, highPrice: string, count: number}>}
 */
export async function getCategoryPriceStats(category) {
  const supabase = getSupabaseServerClient();
  // Fallback defaults per category in case DB is unreachable
  const FALLBACKS = {
    laminate: { lowPrice: '1.49', highPrice: '3.29', count: 99 },
    vinyl: { lowPrice: '1.99', highPrice: '3.59', count: 188 },
    engineered_hardwood: { lowPrice: '2.99', highPrice: '7.59', count: 258 },
    solid_hardwood: { lowPrice: '5.10', highPrice: '7.25', count: 75 },
  };
  const fallback = FALLBACKS[category] || { lowPrice: '0', highPrice: '0', count: 0 };
  if (!supabase) return fallback;

  try {
    // Single RPC-free approach: fetch price_per_sqft + sale_price_per_sqft, compute in JS
    const { data, error } = await supabase
      .from('products')
      .select('price_per_sqft, sale_price_per_sqft')
      .eq('category', category)
      .eq('is_variant', false)
      .eq('hide_price', false)
      .eq('in_stock', true)
      .gt('price_per_sqft', 0);

    if (error || !data || data.length === 0) return fallback;

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    for (const p of data) {
      const effective = p.sale_price_per_sqft != null ? p.sale_price_per_sqft : p.price_per_sqft;
      if (effective < minPrice) minPrice = effective;
      if (p.price_per_sqft > maxPrice) maxPrice = p.price_per_sqft;
    }

    return {
      lowPrice: minPrice.toFixed(2),
      highPrice: maxPrice.toFixed(2),
      count: data.length,
    };
  } catch (err) {
    console.error('[products-server] getCategoryPriceStats error:', err);
    return fallback;
  }
}

/**
 * Derive AggregateOffer price stats from an already-fetched products array.
 * Filter-agnostic (works for /products, /waterproof-flooring, /white-oak-flooring, etc.)
 * so no extra DB round-trip is needed. Mirrors getCategoryPriceStats logic:
 * excludes hidden-price, out-of-stock, and zero/undefined-price items; uses the
 * effective (sale) price for lowPrice and list price for highPrice.
 *
 * @param {Array} products - product rows (CARD_COLUMNS shape)
 * @returns {{lowPrice: string, highPrice: string, count: number}|null} null when no priced items
 */
export function deriveOfferStats(products) {
  if (!Array.isArray(products) || products.length === 0) return null;
  let minPrice = Infinity;
  let maxPrice = -Infinity;
  let count = 0;
  for (const p of products) {
    if (!p || p.hide_price === true || p.in_stock === false) continue;
    const list = Number(p.price_per_sqft);
    if (!Number.isFinite(list) || list <= 0) continue;
    const sale = p.sale_price_per_sqft != null ? Number(p.sale_price_per_sqft) : null;
    const effective = sale != null && Number.isFinite(sale) && sale > 0 ? sale : list;
    if (effective < minPrice) minPrice = effective;
    if (list > maxPrice) maxPrice = list;
    count += 1;
  }
  if (count === 0 || minPrice === Infinity) return null;
  return {
    lowPrice: minPrice.toFixed(2),
    highPrice: maxPrice.toFixed(2),
    count,
  };
}
