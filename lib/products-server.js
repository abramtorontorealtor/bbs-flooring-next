import { getSupabaseServerClient } from '@/lib/supabase';

// Card-level product columns — must match api/products/grid/route.js
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

/**
 * Fetch products for grid pages (server-side).
 * Same query as api/products/grid/route.js but callable from page.jsx server components.
 *
 * @param {Object} opts
 * @param {string} [opts.category] - Filter by category (e.g. 'vinyl', 'engineered_hardwood')
 * @param {string} [opts.brand] - Filter by brand name (case-insensitive ilike)
 * @param {boolean} [opts.clearance] - Filter clearance items only
 * @param {boolean} [opts.sale] - Filter sale items only
 * @param {number} [opts.limit=1000] - Max products to return
 * @returns {Promise<Array>} Product array
 */
export async function getProductsForGrid({ category, brand, clearance, sale, limit = 1000 } = {}) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  let query = supabase
    .from('products')
    .select(CARD_COLUMNS)
    .eq('is_variant', false)
    .range(0, limit - 1);

  if (category) query = query.eq('category', category);
  if (brand) query = query.ilike('brand', `%${brand}%`);
  if (clearance) query = query.eq('is_clearance', true);
  if (sale) query = query.eq('is_on_sale', true);

  query = query
    .order('sort_score', { ascending: false })
    .order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('[products-server] Supabase error:', error);
    return [];
  }

  return data || [];
}
