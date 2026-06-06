import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';

/**
 * Floor Finder Quiz — Product Recommendation API
 * 
 * Takes quiz answers, maps them to product filters, returns top 6 matches.
 * Client-side quiz collects: room, priority, budget, style, lifestyle
 */

// Map quiz answers to DB query filters
function buildFilters(answers) {
  const { room, priority, budget, style, lifestyle } = answers;
  const filters = {
    categories: [],
    maxPrice: null,
    minPrice: null,
    waterproof: false,
    colours: [],
    orderBy: 'sort_score',       // default sort
    preferSale: false,
  };

  // ── Room → Category mapping ──
  switch (room) {
    case 'kitchen':
    case 'bathroom':
      // Wet areas → vinyl (waterproof) or waterproof laminate
      filters.categories = ['vinyl', 'laminate'];
      filters.waterproof = true;
      break;
    case 'basement':
      // Basement → vinyl or waterproof laminate (moisture-resistant)
      filters.categories = ['vinyl', 'laminate'];
      filters.waterproof = true;
      break;
    case 'commercial':
      // Commercial → vinyl (durable, waterproof) or laminate
      filters.categories = ['vinyl', 'laminate'];
      break;
    case 'living_room':
      // Living room → all types work
      filters.categories = ['engineered_hardwood', 'vinyl', 'solid_hardwood', 'laminate'];
      break;
    case 'bedroom':
      // Bedroom → hardwood is premium, vinyl/laminate budget
      filters.categories = ['engineered_hardwood', 'solid_hardwood', 'vinyl', 'laminate'];
      break;
    default:
      filters.categories = ['engineered_hardwood', 'vinyl', 'solid_hardwood', 'laminate'];
  }

  // ── Budget → Price range ──
  switch (budget) {
    case 'budget':
      filters.maxPrice = 3.00;
      filters.preferSale = true;
      break;
    case 'mid':
      filters.minPrice = 2.50;
      filters.maxPrice = 5.50;
      break;
    case 'premium':
      filters.minPrice = 4.50;
      break;
    // 'unsure' → no price filter
  }

  // ── Priority adjustments ──
  switch (priority) {
    case 'waterproof':
      filters.waterproof = true;
      // If categories don't include waterproof options, override
      if (!filters.categories.includes('vinyl')) {
        filters.categories = ['vinyl', 'laminate', ...filters.categories];
      }
      break;
    case 'durability':
      // Prefer thicker/commercial-grade → sort by thickness/wear layer later
      filters.orderBy = 'durability';
      break;
    case 'budget':
      filters.preferSale = true;
      if (!filters.maxPrice || filters.maxPrice > 4) {
        filters.maxPrice = 4.00;
      }
      break;
    case 'style':
      filters.orderBy = 'sort_score'; // default, curated order
      break;
    case 'low_maintenance':
      // Vinyl and laminate are lowest maintenance
      if (!filters.categories.includes('vinyl')) {
        filters.categories.unshift('vinyl');
      }
      break;
  }

  // ── Style → Colour preferences ──
  switch (style) {
    case 'modern_light':
      filters.colours = ['white', 'light', 'blonde', 'natural', 'oak', 'birch', 'maple', 'ash'];
      break;
    case 'classic_warm':
      filters.colours = ['walnut', 'honey', 'golden', 'amber', 'teak', 'cherry', 'chestnut'];
      break;
    case 'dark_rich':
      filters.colours = ['espresso', 'dark', 'ebony', 'charcoal', 'brown', 'chocolate', 'mocha', 'java'];
      break;
    // 'no_preference' → no colour filter
  }

  // ── Lifestyle → Waterproof/durability boost ──
  if (lifestyle === 'pets_kids') {
    // Scratch-resistant, waterproof matters more
    if (!filters.waterproof && (room !== 'bedroom')) {
      filters.waterproof = true;
    }
    // Bump vinyl priority
    const vinylIdx = filters.categories.indexOf('vinyl');
    if (vinylIdx > 0) {
      filters.categories.splice(vinylIdx, 1);
      filters.categories.unshift('vinyl');
    }
  }

  return filters;
}

export async function POST(request) {
  try {
    const answers = await request.json();
    const { room, priority, budget, style, lifestyle } = answers;

    if (!room || !priority || !budget || !style || !lifestyle) {
      return NextResponse.json(
        { error: 'All quiz answers are required' },
        { status: 400 }
      );
    }

    const filters = buildFilters(answers);
    const supabase = getSupabaseAdminClient();

    // Build query — fetch more than we need, then score and rank
    let query = supabase
      .from('products')
      .select('id, name, slug, category, brand, price_per_sqft, sale_price_per_sqft, is_on_sale, is_clearance, is_waterproof, image_url, colour, thickness, wear_layer, hide_price, is_new_arrival, review_rating, review_count')
      .in('category', filters.categories)
      .eq('in_stock', true)
      .eq('is_variant', false)
      .eq('is_archived_variant', false)
      .not('image_url', 'is', null);

    if (filters.waterproof) {
      query = query.eq('is_waterproof', true);
    }

    if (filters.maxPrice) {
      query = query.lte('price_per_sqft', filters.maxPrice);
    }

    if (filters.minPrice) {
      query = query.gte('price_per_sqft', filters.minPrice);
    }

    // Exclude hidden-price products (Vidar) — can't show "from $X" if price is hidden
    query = query.eq('hide_price', false);

    // Fetch up to 50 candidates, then score them client-side
    query = query.order('sort_score', { ascending: true }).limit(50);

    const { data: products, error } = await query;

    if (error) {
      console.error('Floor finder query error:', error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    if (!products || products.length === 0) {
      // Fallback: relax filters and try again
      let fallbackQuery = supabase
        .from('products')
        .select('id, name, slug, category, brand, price_per_sqft, sale_price_per_sqft, is_on_sale, is_clearance, is_waterproof, image_url, colour, thickness, wear_layer, hide_price, is_new_arrival, review_rating, review_count')
        .in('category', filters.categories)
        .eq('in_stock', true)
        .eq('is_variant', false)
        .eq('is_archived_variant', false)
        .eq('hide_price', false)
        .not('image_url', 'is', null)
        .order('sort_score', { ascending: true })
        .limit(50);

      const { data: fallbackProducts } = await fallbackQuery;
      
      if (!fallbackProducts || fallbackProducts.length === 0) {
        return NextResponse.json({ products: [], message: 'No exact matches found. Try adjusting your preferences.' });
      }

      const scored = scoreProducts(fallbackProducts, filters, answers);
      return NextResponse.json({ products: scored.slice(0, 6), relaxed: true });
    }

    // Score and rank products based on quiz answers
    const scored = scoreProducts(products, filters, answers);
    return NextResponse.json({ products: scored.slice(0, 6) });

  } catch (error) {
    console.error('Floor finder error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

/**
 * Score products based on quiz relevance.
 * Higher score = better match. Returns sorted array (best first).
 */
function scoreProducts(products, filters, answers) {
  const colourKeywords = (filters.colours || []).map(c => c.toLowerCase());

  const scored = products.map(product => {
    let score = 0;
    const name = (product.name || '').toLowerCase();
    const colour = (product.colour || '').toLowerCase();

    // Category priority (first category in filters.categories = best fit)
    const catIndex = filters.categories.indexOf(product.category);
    if (catIndex >= 0) {
      score += (filters.categories.length - catIndex) * 10;
    }

    // Colour match
    if (colourKeywords.length > 0) {
      const matchesColour = colourKeywords.some(c => 
        colour.includes(c) || name.includes(c)
      );
      if (matchesColour) score += 15;
    }

    // Sale/clearance bonus for budget-conscious
    if (filters.preferSale && (product.is_on_sale || product.is_clearance)) {
      score += 10;
    }

    // New arrival bonus (shows we have fresh inventory)
    if (product.is_new_arrival) score += 5;

    // Review bonus
    if (product.review_rating && product.review_rating >= 4) score += 5;
    if (product.review_count && product.review_count >= 3) score += 3;

    // Waterproof bonus when relevant
    if (product.is_waterproof && (answers.lifestyle === 'pets_kids' || answers.priority === 'waterproof')) {
      score += 8;
    }

    // Variety: prefer different brands in results
    // (handled post-scoring by deduplication)

    return { ...product, _score: score };
  });

  // Sort by score (desc), then sort_score (asc) as tiebreaker
  scored.sort((a, b) => b._score - a._score);

  // Diversify: max 2 products per brand in top 6
  const result = [];
  const brandCounts = {};
  for (const product of scored) {
    const brand = product.brand || 'unknown';
    brandCounts[brand] = (brandCounts[brand] || 0) + 1;
    if (brandCounts[brand] <= 2) {
      result.push(product);
    }
    if (result.length >= 6) break;
  }

  // If we don't have 6 yet, fill from remaining
  if (result.length < 6) {
    for (const product of scored) {
      if (!result.includes(product)) {
        result.push(product);
      }
      if (result.length >= 6) break;
    }
  }

  return result;
}
