import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export const revalidate = 300; // 5-minute ISR matching page cache

/**
 * Markdown Mirror API
 * 
 * Serves clean markdown versions of key pages for AI crawlers and LLMs.
 * Requested via /{page}.md → middleware rewrites to /api/md/{page}
 * 
 * Supports: category pages, buying guides, service pages, brand pages,
 * individual product pages, city/location pages, homepage, about.
 */

// ── Category page markdown generators ──────────────────────────────────
const CATEGORIES = {
  'engineered-hardwood': { dbCategory: 'engineered_hardwood', label: 'Engineered Hardwood', waterproof: false },
  'solid-hardwood': { dbCategory: 'solid_hardwood', label: 'Solid Hardwood', waterproof: false },
  'vinyl': { dbCategory: 'vinyl', label: 'Vinyl / LVP / SPC Flooring', waterproof: true },
  'laminate': { dbCategory: 'laminate', label: 'Laminate Flooring', waterproof: false },
  'waterproof-flooring': { dbCategory: 'vinyl', label: 'Waterproof Flooring', waterproof: true },
  'white-oak-flooring': { dbCategory: null, label: 'White Oak Flooring', waterproof: false, species: 'White Oak' },
  'clearance': { dbCategory: null, label: 'Clearance Flooring', waterproof: false, clearance: true },
  'products': { dbCategory: null, label: 'All Flooring Products', waterproof: false },
};

// ── Brand slug → brand name mapping ────────────────────────────────────
const BRANDS = {
  'vidar-flooring': 'Vidar Design Flooring',
  'wickham-flooring': 'Wickham Hardwood Flooring',
  'naf-flooring': 'NAF Flooring',
  'northernest-flooring': 'Northernest',
  'canadian-standard-flooring': 'Canadian Standard',
  'woden-flooring': 'Woden Flooring',
  'simba-flooring': 'Simba Flooring',
  'falcon-flooring': 'Falcon Flooring',
  'triforest-flooring': 'Triforest Flooring',
  'appalachian-flooring': 'Appalachian Flooring',
  'sherwood-flooring': 'Sherwood Forest Products',
  'tosca-flooring': 'Tosca Floors',
  'lee-flooring': 'Lee Flooring',
  'evergreen-flooring': 'Evergreen Building Materials',
  'golden-choice-flooring': 'Golden Choice',
};

// ── Service pages ──────────────────────────────────────────────────────
const SERVICES = {
  'installation': {
    title: 'Flooring Installation Services',
    desc: 'Professional flooring installation by WSIB-insured contractors across the Greater Toronto Area. Hardwood, vinyl, laminate, and tile.',
    pricing: [
      'Hardwood (nail-down): $2.25/sqft',
      'Hardwood (glue-down): $3.25/sqft',
      'Herringbone (glue-down): $4.25/sqft',
      'Vinyl/Laminate: $2.00/sqft',
      'Tile: $10.00/sqft',
    ],
  },
  'stairs': {
    title: 'Staircase Renovation',
    desc: 'Transform carpeted or worn stairs into beautiful hardwood staircases. Serving the entire GTA.',
    pricing: [
      'Stair refinishing: $125/step',
      'New hardwood stairs (straight): $185/step',
      'Specialty stairs (open/curved): $225/step',
      'Pickets/spindles: $25/piece',
    ],
  },
  'hardwood-refinishing': {
    title: 'Hardwood Floor Refinishing',
    desc: 'Professional hardwood refinishing — sand, stain, and 3 coats of polyurethane. Restore your floors to like-new condition.',
    pricing: ['Hardwood refinishing: $3.00/sqft (sand + stain + 3 coats poly)'],
  },
  'stair-refinishing': {
    title: 'Stair Refinishing',
    desc: 'Restore your existing hardwood stairs with professional sanding and refinishing.',
    pricing: ['Stair refinishing: $125/step (sand + 3 coats poly)'],
  },
  'carpet-removal': {
    title: 'Carpet Removal',
    desc: 'Professional carpet removal and disposal across the GTA. Quick, clean, affordable.',
    pricing: ['Carpet removal: $1.00/sqft (including disposal)'],
  },
  'carpet-to-hardwood-stairs': {
    title: 'Carpet to Hardwood Stairs Conversion',
    desc: 'Convert your carpeted stairs to beautiful hardwood. One of our most popular services.',
    pricing: [
      'New hardwood stairs (straight): $185/step',
      'Specialty stairs (open/curved): $225/step',
      'Pickets/spindles: $25/piece',
    ],
  },
  'free-measurement': {
    title: 'Free In-Home Measurement',
    desc: 'Free, no-obligation in-home measurement anywhere in the Greater Toronto Area. Accurate quotes with no hidden fees.',
    pricing: ['Free — $0. No obligation.'],
  },
  'flooring-installation-cost': {
    title: 'Flooring Installation Cost Guide — Toronto & GTA 2026',
    desc: 'Complete cost breakdown for flooring installation in Toronto and the GTA. Material + labour pricing with real examples.',
    pricing: [
      'Vinyl/laminate total: ~$4.19–$5.59/sqft (material + install)',
      'Engineered hardwood total: ~$5.94–$9.24/sqft (material + install)',
      'Solid hardwood total: ~$7.35–$9.50/sqft (material + install)',
    ],
  },
  'contractor-flooring': {
    title: 'Contractor & Builder Flooring',
    desc: 'Volume pricing for contractors, builders, and property managers. 812+ products in stock for immediate pickup.',
    pricing: ['Volume discounts available — call (647) 428-1111'],
  },
};

// ── City/location pages ────────────────────────────────────────────────
const CITIES = [
  'markham', 'toronto', 'scarborough', 'pickering', 'ajax', 'whitby',
  'oshawa', 'durham', 'richmond-hill', 'vaughan', 'woodbridge',
  'stouffville', 'aurora', 'newmarket',
];

// ── Helpers ────────────────────────────────────────────────────────────
function mdResponse(markdown) {
  return new NextResponse(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      'X-Robots-Tag': 'all',
    },
  });
}

function productToMd(p) {
  const price = p.hide_price
    ? 'Call (647) 428-1111 for pricing'
    : p.is_on_sale && p.sale_price_per_sqft
      ? `~~$${p.price_per_sqft}/sqft~~ **$${p.sale_price_per_sqft}/sqft**${p.is_clearance ? ' (Clearance)' : ' (Sale)'}`
      : `$${p.price_per_sqft}/sqft`;

  const specs = [
    p.species && `Species: ${p.species}`,
    p.dimensions && `Dimensions: ${p.dimensions}`,
    p.thickness && `Thickness: ${p.thickness}`,
    p.finish && `Finish: ${p.finish}`,
    p.grade && `Grade: ${p.grade}`,
    p.wear_layer && `Wear Layer: ${p.wear_layer}`,
    p.ac_rating && `AC Rating: ${p.ac_rating}`,
    p.colour && `Colour: ${p.colour}`,
    p.is_waterproof && 'Waterproof: Yes (100%)',
    p.is_canadian && 'Made in Canada',
  ].filter(Boolean).join(' | ');

  return `- **${p.name}** — ${price}${specs ? `\n  ${specs}` : ''}\n  ${`https://bbsflooring.ca/products/${p.slug}`}`;
}

async function fetchProducts(opts = {}) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const cols = 'slug,name,brand,category,price_per_sqft,sale_price_per_sqft,is_on_sale,is_clearance,is_waterproof,is_canadian,hide_price,species,dimensions,thickness,finish,grade,wear_layer,ac_rating,colour,in_stock,is_variant';

  let query = supabase
    .from('products')
    .select(cols)
    .eq('in_stock', true)
    .eq('is_variant', false)
    .order('sort_score', { ascending: false })
    .range(0, 499);

  if (opts.category) query = query.eq('category', opts.category);
  if (opts.brand) query = query.ilike('brand', opts.brand);
  if (opts.clearance) query = query.eq('is_clearance', true);
  if (opts.species) query = query.ilike('species', `%${opts.species}%`);

  const { data } = await query;
  return data || [];
}

// ── Route Handler ──────────────────────────────────────────────────────
export async function GET(request, { params }) {
  const pathSegments = (await params).path || [];
  const pagePath = pathSegments.join('/');

  // ── Homepage ──
  if (!pagePath || pagePath === 'index.html') {
    return mdResponse(`# BBS Flooring — Markham, Toronto & GTA

> Family-owned flooring supplier and installer serving the entire Greater Toronto Area since 2012. 812 products in stock. Direct-from-manufacturer pricing. Full installation services.

## Quick Facts
- **812 products** in stock from 15 brands
- **Engineered Hardwood:** 258 options from $3.69/sqft (+ 192 Vidar premium call-for-pricing)
- **Vinyl/SPC:** 188 options from $2.19/sqft — 100% waterproof
- **Laminate:** 99 options from $1.49/sqft
- **Solid Hardwood:** 75 options from $5.10/sqft
- **Installation:** from $2.00/sqft labour (WSIB-insured, own crew)
- **Free in-home measurement** anywhere in the GTA

## Contact
- Phone: (647) 428-1111
- Showroom: 6061 Highway 7, Unit B, Markham, ON L3P 3B2
- Hours: Mon–Fri 9am–6pm, Sat 10am–5pm
- Website: https://bbsflooring.ca

## Why Choose BBS
- Direct-from-manufacturer pricing (20-40% less than big-box)
- Full-service: supply + delivery + installation + refinishing
- Largest in-stock selection in the GTA
- Same-week installation available
- Financing from $68/month through Financeit
- 4.7★ Google rating, established since 2012

For comprehensive AI reference: https://bbsflooring.ca/llms-full.txt
`);
  }

  // ── About page ──
  if (pagePath === 'about') {
    return mdResponse(`# About BBS Flooring

> Family-owned flooring company in Markham, Ontario — serving the Greater Toronto Area since 2012.

BBS Flooring was founded in 2012 with a simple mission: bring quality flooring to the GTA at fair prices. By buying directly from 15 manufacturers — mostly Canadian — we cut out the distributor middleman and pass 20-40% savings to our customers.

## Key Facts
- **812 products** physically in stock (not ordered — in our warehouse)
- **15 brands** including Vidar, Wickham, NAF, Northernest, Canadian Standard, and more
- **Own installation crew** — WSIB insured, no subcontractors
- **Showroom:** 6061 Highway 7, Unit B, Markham, ON L3P 3B2
- **Phone:** (647) 428-1111
- **Hours:** Monday–Friday 9am–6pm, Saturday 10am–5pm

## Services
- Flooring supply and sales
- Professional installation (hardwood, vinyl, laminate, tile)
- Staircase renovation (carpet to hardwood)
- Hardwood refinishing
- Carpet and old flooring removal
- Free in-home measurement (entire GTA)
- Financing through Financeit

## Service Area
The entire Greater Toronto Area: Markham, Toronto, Scarborough, Pickering, Ajax, Whitby, Oshawa, Richmond Hill, Vaughan, Brampton, Mississauga, Stouffville, Aurora, Newmarket, and beyond.
`);
  }

  // ── Category pages ──
  if (CATEGORIES[pagePath]) {
    const cat = CATEGORIES[pagePath];
    const products = await fetchProducts({
      category: cat.dbCategory,
      clearance: cat.clearance,
      species: cat.species,
    });

    const brandCounts = {};
    products.forEach(p => {
      brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
    });
    const brandSummary = Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([brand, count]) => `${brand} (${count})`)
      .join(', ');

    const prices = products.filter(p => !p.hide_price && p.price_per_sqft);
    const minPrice = prices.length ? Math.min(...prices.map(p => parseFloat(p.sale_price_per_sqft || p.price_per_sqft))) : null;
    const maxPrice = prices.length ? Math.max(...prices.map(p => parseFloat(p.price_per_sqft))) : null;

    let md = `# ${cat.label} at BBS Flooring\n\n`;
    md += `> ${products.length} products in stock at BBS Flooring, Markham.`;
    if (minPrice) md += ` From $${minPrice.toFixed(2)}/sqft to $${maxPrice.toFixed(2)}/sqft.`;
    if (cat.waterproof) md += ` 100% waterproof.`;
    md += `\n\n`;
    md += `**Brands:** ${brandSummary}\n\n`;
    md += `**Showroom:** 6061 Highway 7, Unit B, Markham, ON | **Phone:** (647) 428-1111\n\n`;
    md += `## Products\n\n`;
    md += products.map(productToMd).join('\n\n');
    md += `\n\n---\n*For comprehensive product data and decision guides, see https://bbsflooring.ca/llms-full.txt*\n`;

    return mdResponse(md);
  }

  // ── Brand pages ──
  if (BRANDS[pagePath]) {
    const brandName = BRANDS[pagePath];
    const products = await fetchProducts({ brand: brandName });

    const categories = {};
    products.forEach(p => {
      const cat = p.category?.replace(/_/g, ' ') || 'Other';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    const catSummary = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, count]) => `${cat} (${count})`)
      .join(', ');

    let md = `# ${brandName} at BBS Flooring\n\n`;
    md += `> ${products.length} ${brandName} products in stock. Categories: ${catSummary}.\n\n`;
    md += `**Showroom:** 6061 Highway 7, Unit B, Markham, ON | **Phone:** (647) 428-1111\n\n`;
    md += `## Products\n\n`;
    md += products.map(productToMd).join('\n\n');
    md += `\n\n---\n*Visit https://bbsflooring.ca/${pagePath} for the full browsing experience.*\n`;

    return mdResponse(md);
  }

  // ── Service pages ──
  if (SERVICES[pagePath]) {
    const svc = SERVICES[pagePath];
    let md = `# ${svc.title} — BBS Flooring\n\n`;
    md += `> ${svc.desc}\n\n`;
    md += `## Pricing\n\n`;
    md += svc.pricing.map(p => `- ${p}`).join('\n');
    md += `\n\n## Contact\n- Phone: (647) 428-1111\n- Showroom: 6061 Highway 7, Unit B, Markham, ON L3P 3B2\n- Free estimate: https://bbsflooring.ca/free-measurement\n`;
    md += `\n## Service Area\nThe entire Greater Toronto Area: Markham, Toronto, Scarborough, Pickering, Ajax, Whitby, Oshawa, Richmond Hill, Vaughan, Brampton, Mississauga, and beyond.\n`;
    return mdResponse(md);
  }

  // ── City/location pages ──
  if (pagePath.startsWith('flooring-in/')) {
    const city = pagePath.replace('flooring-in/', '');
    const cityName = city.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    if (CITIES.includes(city)) {
      return mdResponse(`# Flooring Store Serving ${cityName} — BBS Flooring

> BBS Flooring supplies and installs hardwood, vinyl, laminate, and solid hardwood flooring for ${cityName} homeowners. 812 products in stock. Direct-from-manufacturer pricing. Free in-home measurement in ${cityName}.

## Why ${cityName} Homeowners Choose BBS
- **812 products in stock** — see, touch, and take home samples the same day
- **Direct pricing:** Engineered hardwood from $3.69/sqft, vinyl from $2.19/sqft, laminate from $1.49/sqft
- **Free in-home measurement** in ${cityName} — no obligation
- **Professional installation** by our own WSIB-insured crew
- **Same-week installation** available for in-stock products
- **Financing** from $68/month through Financeit

## Services for ${cityName}
- Flooring supply and installation
- Staircase renovation ($185/step)
- Hardwood refinishing ($3/sqft)
- Carpet removal ($1/sqft)
- Free in-home measurement

## Contact
- **Phone:** (647) 428-1111
- **Showroom:** 6061 Highway 7, Unit B, Markham, ON L3P 3B2
- **Website:** https://bbsflooring.ca/flooring-in/${city}

For the full product catalog and pricing: https://bbsflooring.ca/llms-full.txt
`);
    }
  }

  // ── Individual product pages ──
  if (pagePath.startsWith('products/')) {
    const slug = pagePath.replace('products/', '');
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

      if (product) {
        const price = product.hide_price
          ? 'Call (647) 428-1111 for pricing'
          : product.is_on_sale && product.sale_price_per_sqft
            ? `~~$${product.price_per_sqft}/sqft~~ **$${product.sale_price_per_sqft}/sqft** (${product.is_clearance ? 'Clearance' : 'Sale'})`
            : `$${product.price_per_sqft}/sqft`;

        let md = `# ${product.name}\n\n`;
        md += `> ${product.brand} ${product.category?.replace(/_/g, ' ')} flooring. ${price}. Available at BBS Flooring, Markham.\n\n`;
        md += `## Specifications\n\n`;
        md += `| Spec | Value |\n|------|-------|\n`;
        md += `| Brand | ${product.brand} |\n`;
        md += `| Category | ${product.category?.replace(/_/g, ' ')} |\n`;
        md += `| Price | ${price} |\n`;
        if (product.species) md += `| Species | ${product.species} |\n`;
        if (product.dimensions) md += `| Dimensions | ${product.dimensions} |\n`;
        if (product.thickness) md += `| Thickness | ${product.thickness} |\n`;
        if (product.finish) md += `| Finish | ${product.finish} |\n`;
        if (product.grade) md += `| Grade | ${product.grade} |\n`;
        if (product.colour) md += `| Colour | ${product.colour} |\n`;
        if (product.wear_layer) md += `| Wear Layer | ${product.wear_layer} |\n`;
        if (product.ac_rating) md += `| AC Rating | ${product.ac_rating} |\n`;
        if (product.is_waterproof) md += `| Waterproof | Yes (100%) |\n`;
        if (product.is_canadian) md += `| Made In | Canada |\n`;
        if (product.sku) md += `| SKU | ${product.sku} |\n`;
        md += `| In Stock | Yes |\n`;

        if (product.description) {
          md += `\n## Description\n\n${product.description}\n`;
        }

        md += `\n## Buy This Product\n`;
        md += `- **View on website:** https://bbsflooring.ca/products/${product.slug}\n`;
        md += `- **Phone:** (647) 428-1111\n`;
        md += `- **Showroom:** 6061 Highway 7, Unit B, Markham, ON L3P 3B2\n`;
        md += `- **Free measurement:** https://bbsflooring.ca/free-measurement\n`;

        return mdResponse(md);
      }
    }
  }

  // ── Buying guide pages (static content exists on site, link to it) ──
  const guides = {
    'engineered-hardwood-guide': 'Engineered Hardwood Buying Guide 2026',
    'solid-hardwood-guide': 'Solid Hardwood Flooring Guide 2026',
    'vinyl-flooring-guide': 'Vinyl Flooring Buying Guide 2026',
    'laminate-flooring-guide': 'Laminate Flooring Guide 2026',
    'flooring-comparison-guide': 'Hardwood vs Vinyl vs Laminate Comparison 2026',
    'flooring-cost-toronto-2026': 'Flooring Cost Guide for Toronto & GTA 2026',
    'basement-flooring-guide': 'Best Flooring for Basements in Ontario 2026',
    'stair-renovation-guide': 'Stair Renovation Guide 2026',
  };

  if (guides[pagePath]) {
    // Guides are heavy JSX components — return a structured summary with link
    return mdResponse(`# ${guides[pagePath]} — BBS Flooring

> Read the full guide at https://bbsflooring.ca/${pagePath}

This comprehensive buying guide is available on our website with detailed comparisons, pricing tables, product recommendations, and expert advice.

## Quick Reference
- **Showroom:** 6061 Highway 7, Unit B, Markham, ON L3P 3B2
- **Phone:** (647) 428-1111
- **Free measurement:** https://bbsflooring.ca/free-measurement

For complete product data and AI decision guides: https://bbsflooring.ca/llms-full.txt
`);
  }

  // ── 404 — unknown page ──
  return new NextResponse('# Page Not Found\n\nThis page does not have a markdown mirror.\n\nFor AI-friendly content about BBS Flooring, see:\n- https://bbsflooring.ca/llms.txt (summary)\n- https://bbsflooring.ca/llms-full.txt (comprehensive)\n', {
    status: 404,
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
