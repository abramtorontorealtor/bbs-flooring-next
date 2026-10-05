import { NextResponse } from 'next/server';
import { getSuppliesCatalog } from '@/lib/suppliesCatalog';

// Search-index projection of the supplies catalogue (Oct 5 2026).
//
// WHY: the header search (components/AdvancedSearchBar.jsx) indexed ONLY
// /api/products/grid (the `products` table), so "underlay", "vents", "glue",
// "spacers"… returned "No products found" even though 160+ retail accessories
// are live under /flooring-accessories. This endpoint gives the search bar one
// lean family per row — the same family grouping the hub cards use — so a hit
// deep-links to the family page (/flooring-accessories/<slug>).
//
// Read-only. Shares getSuppliesCatalog() (unstable_cache 10 min + static
// fallback) with the hub/PDP pages, so it can never disagree with them.

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const catalog = await getSuppliesCatalog();
    const rows = catalog.families.map((f) => ({
      slug: f.slug,
      name: f.name,
      brand: f.brand || '',
      category: f.category,
      blurb: f.blurb || '',
      image: f.image || null,
      priceLow: f.priceLow,
      priceHigh: f.priceHigh,
      unit: f.primary?.unit || '',
      isMulti: f.isMulti,
      optionCount: f.items.length,
      floorTypes: f.floor_types || [],
      // Member labels/codes/UPCs so a size- or SKU-level query ("3mm underpad",
      // "ECO983", a UPC) still lands on the family.
      members: f.items.map((i) => [i.label, i.code, i.upc].filter(Boolean).join(' ')).join(' | '),
    }));
    return NextResponse.json(rows, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    console.error('[api/supplies/search]', err?.message || err);
    return NextResponse.json({ error: 'Failed to load supplies' }, { status: 500 });
  }
}
