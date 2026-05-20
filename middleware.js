import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Next.js Middleware — handles:
 * 1. Auth session refresh on EVERY request (keeps users logged in)
 * 2. Admin route protection (server-side auth + role check)
 * 3. Legacy URL patterns for cutover compatibility
 */

// Wix legacy paths → new paths
const WIX_REDIRECTS = new Map([
  ['/home', '/'],
  ['/allproducts', '/products'],
  ['/flooring-brands', '/products'],
  ['/flooring', '/products'],
  ['/flooring-clearance-sale', '/clearance'],
  ['/about-us', '/about'],
  ['/book-online', '/free-measurement'],
  ['/bookings-checkout', '/free-measurement'],
  ['/commercial', '/products'],
  ['/commericial', '/products'],
  ['/copy-of-all-products', '/products'],
  ['/engineeredhardwood', '/engineered-hardwood'],
  ['/flooring-financing', '/products'],
  ['/flooring-financing-payment-plans', '/products'],
  ['/flooring-installation-services', '/installation'],
  ['/flooring-payment-plans', '/products'],
  ['/flooring-services', '/installation'],
  ['/flooring-stores', '/flooring-in/markham'],
  ['/photogallery', '/gallery'],
  ['/service-page', '/free-measurement'],
  ['/solidhardwood', '/solid-hardwood'],
  ['/stairs-flooring-renovation-gallery', '/stairs'],
  ['/why-bbs-flooring', '/about'],
  // Added May 20 2026 — GSC crawled-not-indexed audit
  // /faq removed — dedicated FAQ page now exists (May 20 session 6)
  ['/book-online/house-measurement-visit-laminate-floor', '/free-measurement'],
]);

// Vidar slug fixes — wrong species in URLs (Apr 7, 2026)
const SLUG_REDIRECTS = new Map([
  ['/products/chocolate-vidar-design-flooring-american-white-oak-engineered-hardwood-flooring', '/products/chocolate-vidar-design-flooring-american-black-walnut-engineered-hardwood-flooring'],
  ['/products/chocolate-vidar-5-american-white-oak-engineered-hardwood-herringbone-character-abcd', '/products/chocolate-vidar-5-american-black-walnut-engineered-hardwood-herringbone-character-abcd'],
  ['/products/clear-vidar-design-flooring-european-white-oakash-engineered-hardwood-flooring', '/products/clear-vidar-design-flooring-european-white-oak-engineered-hardwood-flooring'],
  ['/products/clear-vidar-7-5-european-white-oak-engineered-hardwood-character-abcd', '/products/clear-vidar-7-5-european-white-ash-engineered-hardwood-character-abcd'],
  ['/products/clear-vidar-7-5-european-white-oak-engineered-hardwood-select-abc', '/products/clear-vidar-7-5-european-white-ash-engineered-hardwood-select-abc'],
  ['/products/macaroon-vidar-design-flooring-american-white-oakash-engineered-hardwood-flooring', '/products/macaroon-vidar-design-flooring-american-white-oak-engineered-hardwood-flooring'],
  ['/products/macaroon-vidar-7-5-american-white-oak-engineered-hardwood-character-abcd', '/products/macaroon-vidar-7-5-european-white-ash-engineered-hardwood-character-abcd'],
  ['/products/macaroon-vidar-7-5-american-white-oak-engineered-hardwood-select-abc', '/products/macaroon-vidar-7-5-european-white-ash-engineered-hardwood-select-abc'],
  ['/products/natural-vidar-5-american-white-oak-engineered-hardwood-herringbone-select-abc', '/products/natural-vidar-5-american-black-walnut-engineered-hardwood-herringbone-select-abc'],
  ['/products/natural-vidar-5-american-white-oak-engineered-hardwood-herringbone-select-better-ab', '/products/natural-vidar-5-american-black-walnut-engineered-hardwood-herringbone-select-better-ab'],
  ['/products/provence-vidar-design-flooring-american-white-oak-engineered-hardwood-flooring', '/products/provence-vidar-design-flooring-american-black-walnut-engineered-hardwood-flooring'],
  ['/products/provence-vidar-5-american-white-oak-engineered-hardwood-herringbone-select-abc', '/products/provence-vidar-5-american-black-walnut-engineered-hardwood-herringbone-select-abc'],
  ['/products/provence-vidar-5-american-white-oak-engineered-hardwood-herringbone-select-better-ab', '/products/provence-vidar-5-american-black-walnut-engineered-hardwood-herringbone-select-better-ab'],
  ['/products/natural-vidar-design-flooring-european-white-ash-engineered-hardwood-flooring', '/products/natural-vidar-design-flooring-american-black-walnut-engineered-hardwood-flooring'],
  ['/products/clear-vidar-design-flooring-european-white-ash-engineered-hardwood-flooring', '/products/clear-vidar-design-flooring-european-white-oak-engineered-hardwood-flooring'],
  ['/products/sunset-vidar-design-flooring-european-white-ash-engineered-hardwood-flooring', '/products/sunset-vidar-design-flooring-american-white-oak-engineered-hardwood-flooring'],
  ['/products/toffee-crunch-vidar-design-flooring-american-white-oakash-engineered-hardwood-flooring', '/products/toffee-crunch-vidar-design-flooring-american-white-oak-engineered-hardwood-flooring'],
  ['/products/toffee-crunch-vidar-7-5-european-white-oak-engineered-hardwood-character-abcd', '/products/toffee-crunch-vidar-7-5-european-white-ash-engineered-hardwood-character-abcd'],
  ['/products/toffee-crunch-vidar-7-5-european-white-oak-engineered-hardwood-select-abc', '/products/toffee-crunch-vidar-7-5-european-white-ash-engineered-hardwood-select-abc'],
  ['/products/toffee-crunch-vidar-7-5-european-white-oak-engineered-hardwood-select-better-ab', '/products/toffee-crunch-vidar-7-5-european-white-ash-engineered-hardwood-select-better-ab'],
  ['/products/alcott-novella-6-1-2-engineered-american-oak-hardwood-flooring', '/products/alcott-novella-canadian-standard-engineered-american-oak-hardwood-flooring'],
  ['/products/astoria-origins-7-1-2-engineered-american-walnut-hardwood-flooring', '/products/astoria-origins-canadian-standard-engineered-american-walnut-hardwood-flooring'],
  ['/products/atwood-novella-6-1-2-engineered-american-oak-hardwood-flooring', '/products/atwood-novella-canadian-standard-engineered-american-oak-hardwood-flooring'],
  ['/products/austen-novella-6-1-2-engineered-american-oak-hardwood-flooring', '/products/austen-novella-canadian-standard-engineered-american-oak-hardwood-flooring'],
  ['/products/bare-lucid-7-1-2-engineered-american-oak-hardwood-flooring', '/products/bare-lucid-canadian-standard-engineered-american-oak-hardwood-flooring'],
  ['/products/blacksmith-brand-surfaces-7-1-2-engineered-maple-hardwood-flooring', '/products/blacksmith-brand-surfaces-canadian-standard-engineered-maple-hardwood-flooring'],
  ['/products/calm-lucid-6-1-2-engineered-american-oak-hardwood-flooring', '/products/calm-lucid-canadian-standard-engineered-american-oak-hardwood-flooring'],
  ['/products/charlotte-origins-7-1-2-engineered-european-oak-hardwood-flooring', '/products/charlotte-origins-canadian-standard-engineered-european-oak-hardwood-flooring'],
  ['/products/chimney-smoke-brand-surfaces-7-1-2-engineered-maple-hardwood-flooring', '/products/chimney-smoke-brand-surfaces-canadian-standard-engineered-maple-hardwood-flooring'],
  ['/products/crafted-timber-brand-surfaces-6-1-2-engineered-hickory-hardwood-flooring', '/products/crafted-timber-brand-surfaces-canadian-standard-engineered-hickory-hardwood-flooring'],
  ['/products/dickens-novella-6-1-2-engineered-hickory-hardwood-flooring', '/products/dickens-novella-canadian-standard-engineered-hickory-hardwood-flooring'],
  ['/products/duchy-estate-origins-7-1-2-engineered-american-walnut-hardwood-flooring', '/products/duchy-estate-origins-canadian-standard-engineered-american-walnut-hardwood-flooring'],
  ['/products/emily-origins-7-1-2-engineered-european-oak-hardwood-flooring', '/products/emily-origins-canadian-standard-engineered-european-oak-hardwood-flooring'],
  ['/products/enhance-lucid-6-1-2-engineered-american-oak-hardwood-flooring', '/products/enhance-lucid-canadian-standard-engineered-american-oak-hardwood-flooring'],
  ['/products/essence-lucid-7-1-2-engineered-american-oak-hardwood-flooring', '/products/essence-lucid-canadian-standard-engineered-american-oak-hardwood-flooring'],
  ['/products/fitzgerald-novella-6-1-2-engineered-hickory-hardwood-flooring', '/products/fitzgerald-novella-canadian-standard-engineered-hickory-hardwood-flooring'],
  ['/products/forest-trail-origins-6-1-2-engineered-american-hickory-hardwood-flooring', '/products/forest-trail-origins-canadian-standard-engineered-american-hickory-hardwood-flooring'],
  ['/products/grayson-origins-7-1-2-engineered-white-oak-hardwood-flooring', '/products/grayson-origins-canadian-standard-engineered-white-oak-hardwood-flooring'],
  ['/products/greysmith-origins-6-1-2-engineered-american-hickory-hardwood-flooring', '/products/greysmith-origins-canadian-standard-engineered-american-hickory-hardwood-flooring'],
  ['/products/hampshire-origins-7-1-2-engineered-white-oak-hardwood-flooring', '/products/hampshire-origins-canadian-standard-engineered-white-oak-hardwood-flooring'],
  ['/products/hemingway-novella-6-1-2-engineered-hickory-hardwood-flooring', '/products/hemingway-novella-canadian-standard-engineered-hickory-hardwood-flooring'],
  ['/products/kate-origins-7-1-2-engineered-white-oak-hardwood-flooring', '/products/kate-origins-canadian-standard-engineered-white-oak-hardwood-flooring'],
  ['/products/kinsey-origins-7-1-2-engineered-white-oak-hardwood-flooring', '/products/kinsey-origins-canadian-standard-engineered-white-oak-hardwood-flooring'],
  ['/products/leah-origins-7-1-2-engineered-european-oak-hardwood-flooring', '/products/leah-origins-canadian-standard-engineered-european-oak-hardwood-flooring'],
  ['/products/millstead-brand-surfaces-7-1-2-engineered-maple-hardwood-flooring', '/products/millstead-brand-surfaces-canadian-standard-engineered-maple-hardwood-flooring'],
  ['/products/nature-lucid-7-1-2-engineered-american-oak-hardwood-flooring', '/products/nature-lucid-canadian-standard-engineered-american-oak-hardwood-flooring'],
  ['/products/nottingham-origins-6-1-2-engineered-american-hickory-hardwood-flooring', '/products/nottingham-origins-canadian-standard-engineered-american-hickory-hardwood-flooring'],
  ['/products/orwell-novella-6-1-2-engineered-hickory-hardwood-flooring', '/products/orwell-novella-canadian-standard-engineered-hickory-hardwood-flooring'],
  ['/products/pottery-barn-brand-surfaces-7-1-2-engineered-maple-hardwood-flooring', '/products/pottery-barn-brand-surfaces-canadian-standard-engineered-maple-hardwood-flooring'],
  ['/products/pristine-lucid-7-1-2-engineered-american-oak-hardwood-flooring', '/products/pristine-lucid-canadian-standard-engineered-american-oak-hardwood-flooring'],
  ['/products/pure-lucid-7-1-2-engineered-american-oak-hardwood-flooring', '/products/pure-lucid-canadian-standard-engineered-american-oak-hardwood-flooring'],
  ['/products/rowling-novella-6-1-2-engineered-american-oak-hardwood-flooring', '/products/rowling-novella-canadian-standard-engineered-american-oak-hardwood-flooring'],
  ['/products/royal-mile-origins-7-1-2-engineered-american-walnut-hardwood-flooring', '/products/royal-mile-origins-canadian-standard-engineered-american-walnut-hardwood-flooring'],
  ['/products/sedrick-origins-7-1-2-engineered-white-oak-hardwood-flooring', '/products/sedrick-origins-canadian-standard-engineered-white-oak-hardwood-flooring'],
  ['/products/senses-lucid-6-1-2-engineered-american-oak-hardwood-flooring', '/products/senses-lucid-canadian-standard-engineered-american-oak-hardwood-flooring'],
  ['/products/smoked-tree-trunk-brand-surfaces-6-1-2-engineered-hickory-hardwood-flooring', '/products/smoked-tree-trunk-brand-surfaces-canadian-standard-engineered-hickory-hardwood-flooring'],
  ['/products/smoky-shadow-brand-surfaces-6-1-2-engineered-hickory-hardwood-flooring', '/products/smoky-shadow-brand-surfaces-canadian-standard-engineered-hickory-hardwood-flooring'],
  ['/products/soothe-lucid-6-1-2-engineered-american-oak-hardwood-flooring', '/products/soothe-lucid-canadian-standard-engineered-american-oak-hardwood-flooring'],
  ['/products/steinbeck-novella-6-1-2-engineered-hickory-hardwood-flooring', '/products/steinbeck-novella-canadian-standard-engineered-hickory-hardwood-flooring'],
  ['/products/subtle-white-origins-6-1-2-engineered-white-oak-hardwood-flooring', '/products/subtle-white-origins-canadian-standard-engineered-white-oak-hardwood-flooring'],
  ['/products/surrey-hills-origins-7-1-2-engineered-american-walnut-hardwood-flooring', '/products/surrey-hills-origins-canadian-standard-engineered-american-walnut-hardwood-flooring'],
  ['/products/tranquil-lucid-6-1-2-engineered-american-oak-hardwood-flooring', '/products/tranquil-lucid-canadian-standard-engineered-american-oak-hardwood-flooring'],
  ['/products/transitional-gray-brand-surfaces-6-1-2-engineered-hickory-hardwood-flooring', '/products/transitional-gray-brand-surfaces-canadian-standard-engineered-hickory-hardwood-flooring'],
  ['/products/warm-heritage-origins-6-1-2-engineered-american-hickory-hardwood-flooring', '/products/warm-heritage-origins-canadian-standard-engineered-american-hickory-hardwood-flooring'],
  ['/products/warm-onyx-brand-surfaces-7-1-2-engineered-maple-hardwood-flooring', '/products/warm-onyx-brand-surfaces-canadian-standard-engineered-maple-hardwood-flooring'],
  ['/products/wool-coat-brand-surfaces-7-1-2-engineered-maple-hardwood-flooring', '/products/wool-coat-brand-surfaces-canadian-standard-engineered-maple-hardwood-flooring'],
  ['/products/woolf-novella-6-1-2-engineered-american-oak-hardwood-flooring', '/products/woolf-novella-canadian-standard-engineered-american-oak-hardwood-flooring'],
  ['/products/yorkshire-origins-7-1-2-engineered-american-walnut-hardwood-flooring', '/products/yorkshire-origins-canadian-standard-engineered-american-walnut-hardwood-flooring'],
  ['/products/alura-6-1-2-select-grade-engineered-european-oak-hardwood-flooring', '/products/alura-lee-select-grade-engineered-european-oak-hardwood-flooring'],
  ['/products/aubrae-6-1-2-select-better-engineered-american-oak-hardwood-flooring', '/products/aubrae-lee-select-better-engineered-american-oak-hardwood-flooring'],
  ['/products/brealen-6-1-2-select-grade-engineered-european-oak-hardwood-flooring', '/products/brealen-lee-select-grade-engineered-european-oak-hardwood-flooring'],
  ['/products/brenton-6-1-2-select-better-engineered-american-oak-hardwood-flooring', '/products/brenton-lee-select-better-engineered-american-oak-hardwood-flooring'],
  ['/products/coastal-driftwood-22mil-wear-layer-7mm-vinyl-flooring-with-pad', '/products/coastal-driftwood-lee-vinyl-flooring'],
  ['/products/countryside-elm-22mil-wear-layer-7mm-vinyl-flooring-with-pad', '/products/countryside-elm-lee-vinyl-flooring'],
  ['/products/covelle-6-1-2-select-better-engineered-american-oak-hardwood-flooring', '/products/covelle-lee-select-better-engineered-american-oak-hardwood-flooring'],
  ['/products/distant-shore-22mil-wear-layer-7mm-vinyl-flooring-with-pad', '/products/distant-shore-lee-vinyl-flooring'],
  ['/products/ellaston-6-1-2-select-better-engineered-american-oak-hardwood-flooring', '/products/ellaston-lee-select-better-engineered-american-oak-hardwood-flooring'],
  ['/products/golden-hearth-22mil-wear-layer-7mm-vinyl-flooring-with-pad', '/products/golden-hearth-lee-vinyl-flooring'],
  ['/products/lumiere-6-1-2-select-grade-engineered-european-oak-hardwood-flooring', '/products/lumiere-lee-select-grade-engineered-european-oak-hardwood-flooring'],
  ['/products/mirelle-6-1-2-select-grade-engineered-european-oak-hardwood-flooring', '/products/mirelle-lee-select-grade-engineered-european-oak-hardwood-flooring'],
  ['/products/mistry-birch-22mil-wear-layer-7mm-vinyl-flooring-with-pad', '/products/mistry-birch-lee-vinyl-flooring'],
  ['/products/pebble-creek-22mil-wear-layer-7mm-vinyl-flooring-with-pad', '/products/pebble-creek-lee-vinyl-flooring'],
  ['/products/radnor-6-1-2-select-better-engineered-american-oak-hardwood-flooring', '/products/radnor-lee-select-better-engineered-american-oak-hardwood-flooring'],
  ['/products/redmond-6-1-2-select-better-engineered-american-oak-hardwood-flooring', '/products/redmond-lee-select-better-engineered-american-oak-hardwood-flooring'],
  ['/products/rustic-oak-22mil-wear-layer-7mm-vinyl-flooring-with-pad', '/products/rustic-oak-lee-vinyl-flooring'],
  ['/products/sandale-6-1-2-select-better-engineered-american-oak-hardwood-flooring', '/products/sandale-lee-select-better-engineered-american-oak-hardwood-flooring'],
  ['/products/sandbar-22mil-wear-layer-7mm-vinyl-flooring-with-pad', '/products/sandbar-lee-vinyl-flooring'],
  ['/products/solen-6-1-2-select-grade-engineered-european-oak-hardwood-flooring', '/products/solen-lee-select-grade-engineered-european-oak-hardwood-flooring'],
  ['/products/terrona-6-1-2-select-better-engineered-american-oak-hardwood-flooring', '/products/terrona-lee-select-better-engineered-american-oak-hardwood-flooring'],
  ['/products/thalen-6-1-2-select-grade-engineered-european-oak-hardwood-flooring', '/products/thalen-lee-select-grade-engineered-european-oak-hardwood-flooring'],
  ['/products/walnut-wharf-22mil-wear-layer-7mm-vinyl-flooring-with-pad', '/products/walnut-wharf-lee-vinyl-flooring'],
  ['/products/weathered-barnwood-22mil-wear-layer-7mm-vinyl-flooring-with-pad', '/products/weathered-barnwood-lee-vinyl-flooring'],
  ['/products/dark-birch-infiniti-12mm-laminate-flooring', '/products/dark-birch-infiniti-naf-laminate-flooring'],
  ['/products/grey-infiniti-12mm-laminate-flooring', '/products/grey-infiniti-naf-laminate-flooring'],
  ['/products/hurricane-infiniti-12mm-laminate-flooring', '/products/hurricane-infiniti-naf-laminate-flooring'],
  ['/products/meridian-infiniti-12mm-laminate-flooring', '/products/meridian-infiniti-naf-laminate-flooring'],
  ['/products/rustic-maple-infiniti-12mm-laminate-flooring', '/products/rustic-maple-infiniti-naf-laminate-flooring'],
  ['/products/rustic-oak-infiniti-12mm-laminate-flooring', '/products/rustic-oak-infiniti-naf-laminate-flooring'],
  ['/products/sunshine-infiniti-12mm-laminate-flooring', '/products/sunshine-infiniti-naf-laminate-flooring'],
  ['/products/vp30-20105-simba-cascade-3mm-lvt', '/products/vp30-20105-simba-lvt-vinyl-flooring'],
  ['/products/vp30-32301-simba-cascade-3mm-lvt', '/products/vp30-32301-simba-lvt-vinyl-flooring'],
  ['/products/triforest-tf-8001', '/products/tf-8001-triforest-laminate-flooring'],
  ['/products/triforest-tf-8003', '/products/tf-8003-triforest-laminate-flooring'],
  ['/products/triforest-tf-8004', '/products/tf-8004-triforest-laminate-flooring'],
  ['/products/triforest-tf-8005', '/products/tf-8005-triforest-laminate-flooring'],
  ['/products/triforest-tf-8006', '/products/tf-8006-triforest-laminate-flooring'],
  ['/products/triforest-tf-8007', '/products/tf-8007-triforest-laminate-flooring'],
  ['/products/triforest-tf-8008', '/products/tf-8008-triforest-laminate-flooring'],
  ['/products/triforest-tf-8010', '/products/tf-8010-triforest-laminate-flooring'],
  ['/products/triforest-tf-8011', '/products/tf-8011-triforest-laminate-flooring'],
  ['/products/triforest-tf-8012', '/products/tf-8012-triforest-laminate-flooring'],
  ['/products/clear-european-white-oak', '/products/clear-vidar-european-white-oak-engineered-hardwood-flooring'],
  ['/products/macaroon-european-white-ash', '/products/macaroon-vidar-european-white-ash-engineered-hardwood-flooring'],
  ['/products/naked-walnut-american-black-walnut', '/products/naked-walnut-vidar-american-black-walnut-engineered-hardwood-flooring'],
  ['/products/natural-european-white-ash', '/products/natural-vidar-european-white-ash-engineered-hardwood-flooring'],
  ['/products/natural-sm-american-black-walnut', '/products/natural-sm-vidar-american-black-walnut-engineered-hardwood-flooring'],
  ['/products/natural-wb-american-black-walnut', '/products/natural-wb-vidar-american-black-walnut-engineered-hardwood-flooring'],
  ['/products/sunset-european-white-ash', '/products/sunset-vidar-european-white-ash-engineered-hardwood-flooring'],
  ['/products/toffee-crunch-european-white-ash', '/products/toffee-crunch-vidar-european-white-ash-engineered-hardwood-flooring'],
  ['/products/toffee-crunch-european-white-oak', '/products/toffee-crunch-vidar-european-white-oak-engineered-hardwood-flooring'],
]);

// Single-word PascalCase pages that need lowercase redirects.
const CASE_REDIRECTS = new Map([
  ['/Vinyl', '/vinyl'],
  ['/Laminate', '/laminate'],
  ['/Products', '/products'],
  ['/Clearance', '/clearance'],
  ['/Stairs', '/stairs'],
  ['/Installation', '/installation'],
  ['/Compare', '/compare'],
  ['/Financing', '/financing'],
  ['/About', '/about'],
  ['/Contact', '/contact'],
  ['/Gallery', '/gallery'],
  ['/Blog', '/blog'],
  ['/Cart', '/cart'],
]);

export async function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;

  // ── Markdown mirrors for AI crawlers (.md extension) ─────────────
  // Rewrites /vinyl.md → /api/md/vinyl, /products/slug.md → /api/md/products/slug, etc.
  // This gives AI systems clean markdown versions of our pages.
  if (pathname.endsWith('.md') && !pathname.startsWith('/api/') && !pathname.startsWith('/_next/')) {
    const cleanPath = pathname.slice(0, -3); // strip .md
    const mdApiPath = `/api/md${cleanPath || '/index.html'}`;
    const url = request.nextUrl.clone();
    url.pathname = mdApiPath;
    return NextResponse.rewrite(url);
  }

  // ── Legacy redirects (no auth needed, fast path) ────────────────────
  const wixRedirect = WIX_REDIRECTS.get(pathname);
  if (wixRedirect) {
    return NextResponse.redirect(new URL(wixRedirect, request.url), { status: 301 });
  }

  const caseRedirect = CASE_REDIRECTS.get(pathname);
  if (caseRedirect) {
    return NextResponse.redirect(new URL(caseRedirect, request.url), { status: 301 });
  }

  // Vidar slug fixes (wrong species in URL)
  const slugRedirect = SLUG_REDIRECTS.get(pathname);
  if (slugRedirect) {
    return NextResponse.redirect(new URL(slugRedirect, request.url), { status: 301 });
  }

  // Removal service pages — redirect old Wix URLs to new service pages
  if (pathname === '/product-page/hardwood-removal') {
    return NextResponse.redirect(new URL('/hardwood-removal', request.url), { status: 301 });
  }
  if (pathname === '/product-page/tile-removal') {
    return NextResponse.redirect(new URL('/tile-removal', request.url), { status: 301 });
  }
  if (pathname === '/product-page/vinyl-laminate-removal' || pathname === '/product-page/vinyl-removal' || pathname === '/product-page/laminate-removal') {
    return NextResponse.redirect(new URL('/vinyl-laminate-removal', request.url), { status: 301 });
  }

  // Old Wix slugs that don't match new DB slugs (178 redirects)
  // Generated May 20 2026 from GSC "Crawled - Not Currently Indexed" audit
  const SHORT_SLUG_REDIRECTS = {
    // ── Existing ──
    'cobalt': 'cobalt-falcon-floor-products-6mm-vinyl-flooring',
    'fog': 'fog-woden-vermont-6-1-2-oak-engineered-hardwood-flooring',
    'tf1119': 'triforest-tf1119-triforest-laminate-123mm-flooring',
    'tfspc307': 'triforest-tfspc307-triforest-vinyl-42mm-flooring',
    // ── Northernest: missing dimensions in old slugs ──
    'albatross-european-oak-northernest-engineered-hardwood-flooring': 'albatross-7-1-2-european-oak-northernest-engineered-hardwood-flooring',
    'american-oak-european-oak-northernest-engineered-hardwood-flooring': 'american-oak-7-1-2-european-oak-northernest-engineered-hardwood-flooring',
    'ardor-european-oak-northernest-engineered-hardwood-flooring': 'ardor-7-1-2-european-oak-northernest-engineered-hardwood-flooring',
    'ash-grey-white-oak-northernest-engineered-hardwood-flooring': 'ash-grey-6-1-2-white-oak-northernest-engineered-hardwood-flooring',
    'atlantis-european-oak-vintage-series-northernest-engineered-hardwood-flooring': 'atlantis-7-1-2-european-oak-northernest-engineered-hardwood-flooring',
    'barista-european-oak-northernest-engineered-hardwood-flooring': 'barista-7-1-2-european-oak-northernest-engineered-hardwood-flooring',
    'black-cedar-white-oak-northernest-engineered-hardwood-flooring': 'black-cedar-6-1-2-white-oak-northernest-engineered-hardwood-flooring',
    'black-powder-white-oak-northernest-solid-hardwood-flooring': 'black-powder-5-white-oak-northernest-solid-hardwood-flooring',
    'borado-oak-click-system-northernest-engineered-hardwood-flooring': 'borado-1-2-oak-click-system-northernest-engineered-hardwood-flooring',
    'buckigham-european-oak-northernest-engineered-hardwood-flooring': 'buckigham-7-1-2-european-oak-northernest-engineered-hardwood-flooring',
    'camelot-white-oak-northernest-solid-hardwood-flooring': 'camelot-5-white-oak-northernest-solid-hardwood-flooring',
    'canvas-european-oak-vintage-series-northernest-engineered-hardwood-f': 'canvas-7-1-2-european-oak-northernest-engineered-hardwood-flooring',
    'canyon-oak-european-oak-northernest-engineered-hardwood-flooring': 'canyon-oak-7-1-2-european-oak-northernest-engineered-hardwood-flooring',
    'charcoal-maple-click-system-northernest-engineered-hardwood-flooring': 'charcoal-1-2-maple-click-system-northernest-engineered-hardwood-flooring',
    'chateau-hickory-northernest-engineered-hardwood-flooring': 'chateau-6-1-2-hickory-northernest-engineered-hardwood-flooring',
    'chelsea-oak-european-oak-northernest-engineered-hardwood-flooring': 'chelsea-oak-7-1-2-european-oak-northernest-engineered-hardwood-flooring',
    'cinder-european-oak-northernest-engineered-hardwood-flooring': 'cinder-7-1-2-european-oak-northernest-engineered-hardwood-flooring',
    'damask-oak-click-system-northernest-engineered-hardwood-flooring': 'damask-1-2-oak-click-system-northernest-engineered-hardwood-flooring',
    'dark-mocha-maple-northernest-solid-hardwood-flooring': 'dark-mocha-4-3-4-maple-northernest-solid-hardwood-flooring',
    'dim-grey-white-oak-northernest-solid-hardwood-flooring': 'dim-grey-5-white-oak-northernest-solid-hardwood-flooring',
    'driftwood-superior-series-northernest-solid-hardwood-flooring': 'driftwood-superior-series-northernest-5-solid-hardwood-flooring',
    'ebony-maple-click-system-northernest-engineered-hardwood-flooring': 'ebony-1-2-maple-click-system-northernest-engineered-hardwood-flooring',
    'elegant-hickory-northernest-engineered-hardwood-flooring': 'elegant-6-1-2-hickory-northernest-engineered-hardwood-flooring',
    'falcon-grey-white-oak-northernest-engineered-hardwood-flooring': 'falcon-grey-6-1-2-white-oak-northernest-engineered-hardwood-flooring',
    'fraser-maple-northernest-solid-hardwood-flooring': 'fraser-4-3-4-maple-northernest-solid-hardwood-flooring',
    'frozen-oak-european-oak-northernest-engineered-hardwood-flooring': 'frozen-oak-7-1-2-european-oak-northernest-engineered-hardwood-flooring',
    'gotham-essential-series-northernest-solid-hardwood-flooring': 'gotham-essential-series-northernest-5-solid-hardwood-flooring',
    'gothenburg-european-oak-northernest-engineered-hardwood-flooring': 'gothenburg-7-1-2-european-oak-northernest-engineered-hardwood-flooring',
    'grey-stone-white-oak-northernest-engineered-hardwood-flooring': 'grey-stone-6-white-oak-northernest-engineered-hardwood-flooring',
    'grey-timber-oak-click-system-northernest-engineered-hardwood-flooring': 'grey-timber-1-2-oak-click-system-northernest-engineered-hardwood-flooring',
    'gunsmith-essential-series-northernest-solid-hardwood-flooring': 'gunsmith-essential-series-northernest-5-solid-hardwood-flooring',
    'imperial-maple-northernest-solid-hardwood-flooring': 'imperial-4-3-4-maple-northernest-solid-hardwood-flooring',
    'kalbosh-superior-series-northernest-solid-hardwood-flooring': 'kalbosh-superior-series-northernest-5-solid-hardwood-flooring',
    'kentucky-white-oak-northernest-engineered-hardwood-flooring': 'kentucky-6-white-oak-northernest-engineered-hardwood-flooring',
    'kodiak-hickory-northernest-engineered-hardwood-flooring': 'kodiak-6-1-2-hickory-northernest-engineered-hardwood-flooring',
    'latte-european-oak-northernest-engineered-hardwood-flooring': 'latte-7-1-2-european-oak-northernest-engineered-hardwood-flooring',
    'mackenzie-maple-northernest-solid-hardwood-flooring': 'mackenzie-4-3-4-maple-northernest-solid-hardwood-flooring',
    'malmo-european-oak-northernest-engineered-hardwood-flooring': 'malmo-7-1-2-european-oak-northernest-engineered-hardwood-flooring',
    'manhattan-hickory-northernest-engineered-hardwood-flooring': 'manhattan-6-1-2-hickory-northernest-engineered-hardwood-flooring',
    'mid-oak-white-oak-northernest-engineered-hardwood-flooring': 'mid-oak-6-white-oak-northernest-engineered-hardwood-flooring',
    'oak-chestnut-white-oak-winery-collection-northernest-engineered-hardwood': 'oak-chestnut-6-1-2-white-oak-northernest-engineered-hardwood-flooring',
    'pala-european-oak-northernest-engineered-hardwood-flooring': 'pala-7-1-2-european-oak-northernest-engineered-hardwood-flooring',
    'pegasus-european-oak-northernest-engineered-hardwood-flooring': 'pegasus-7-1-2-european-oak-northernest-engineered-hardwood-flooring',
    'petrus-european-oak-northernest-engineered-hardwood-flooring': 'petrus-7-1-2-european-oak-northernest-engineered-hardwood-flooring',
    'pollo-european-oak-northernest-engineered-hardwood-flooring': 'pollo-7-1-2-european-oak-northernest-engineered-hardwood-flooring',
    'reverie-european-oak-northernest-engineered-hardwood-flooring': 'reverie-7-1-2-european-oak-northernest-engineered-hardwood-flooring',
    'sabbia-hickory-click-system-northernest-engineered-hardwood-flooring': 'sabbia-1-2-hickory-click-system-northernest-engineered-hardwood-flooring',
    'sand-dune-european-oak-vintage-series-northernest-engineered-hardwood': 'sand-dune-7-1-2-european-oak-northernest-engineered-hardwood-flooring',
    'sand-oak-european-oak-northernest-engineered-hardwood-flooring': 'sand-oak-7-1-2-european-oak-northernest-engineered-hardwood-flooring',
    'slate-superior-series-northernest-solid-hardwood-flooring': 'slate-superior-series-northernest-5-solid-hardwood-flooring',
    'smoky-mountain-white-oak-northernest-engineered-hardwood-flooring': 'smoky-mountain-6-1-2-white-oak-northernest-engineered-hardwood-flooring',
    'snowdrift-european-oak-northernest-engineered-hardwood-flooring': 'snowdrift-7-1-2-european-oak-northernest-engineered-hardwood-flooring',
    'titan-european-oak-northernest-engineered-hardwood-flooring': 'titan-7-1-2-european-oak-northernest-engineered-hardwood-flooring',
    'truffle-white-oak-northernest-engineered-hardwood-flooring': 'truffle-6-white-oak-northernest-engineered-hardwood-flooring',
    'venice-european-oak-vintage-series-northernest-engineered-hardwood-flooring': 'venice-7-1-2-european-oak-northernest-engineered-hardwood-flooring',
    'versailles-european-oak-northernest-engineered-hardwood-flooring': 'versailles-7-1-2-european-oak-northernest-engineered-hardwood-flooring',
    'white-pine-european-oak-northernest-engineered-hardwood-flooring': 'white-pine-7-1-2-european-oak-northernest-engineered-hardwood-flooring',
    'zeus-european-oak-vintage-series-northernest-engineered-hardwood': 'zeus-7-1-2-european-oak-northernest-engineered-hardwood-flooring',
    // ── Woden: 9mm → 11mm vinyl ──
    '1101-night-freeze-woden-9mm-vinyl-flooring': '1101-night-freeze-woden-11mm-vinyl-flooring',
    '1102-camellia-woden-9mm-vinyl-flooring': '1102-camellia-woden-11mm-vinyl-flooring',
    '1104-vintage-cream-woden-9mm-vinyl-flooring': '1104-vintage-cream-woden-11mm-vinyl-flooring',
    '1105-silver-mist-woden-9mm-vinyl-flooring': '1105-silver-mist-woden-11mm-vinyl-flooring',
    '1106-twilight-woden-9mm-vinyl-flooring': '1106-twilight-woden-11mm-vinyl-flooring',
    '1107-wild-truffle-woden-9mm-vinyl-flooring': '1107-wild-truffle-woden-11mm-vinyl-flooring',
    'cashmere-woden-elite-white-oak-engineered-hardwood-flooring': 'cashmere-woden-elite-6-1-2-white-oak-engineered-hardwood-flooring',
    // ── NAF: truncated URL endings + brand renames ──
    'aruba-naf-regal-collection-7-1-2-oak-engineered-hardwood-floori': 'aruba-naf-regal-collection-7-1-2-oak-engineered-hardwood-flooring',
    'barbados-naf-regal-collection-7-1-2-oak-engineered-hardwood-floori': 'barbados-naf-regal-collection-7-1-2-oak-engineered-hardwood-flooring',
    'bermuda-naf-regal-collection-7-1-2-oak-engineered-hardwood-floori': 'bermuda-naf-regal-collection-7-1-2-oak-engineered-hardwood-flooring',
    'haiti-naf-regal-collection-7-1-2-oak-engineered-hardwood-floori': 'haiti-naf-regal-collection-7-1-2-oak-engineered-hardwood-flooring',
    'jamaica-naf-regal-collection-7-1-2-oak-engineered-hardwood-floori': 'jamaica-naf-regal-collection-7-1-2-oak-engineered-hardwood-flooring',
    'kansas-naf-elegant-collection-7-1-2-oak-engineered-hardwood-floorin': 'kansas-naf-elegant-collection-7-1-2-oak-engineered-hardwood-flooring',
    'suriname-naf-regal-collection-6-1-2-oak-engineered-hardwood-floori': 'suriname-naf-regal-collection-6-1-2-oak-engineered-hardwood-flooring',
    'trinidad-naf-regal-collection-6-1-2-oak-engineered-hardwood-floori': 'trinidad-naf-regal-collection-6-1-2-oak-engineered-hardwood-flooring',
    'st-maarten-naf-regal-collection-7-1-2-oak-engineered-hardwood-floori': 'st-maarten-naf-regal-collection-7-1-2-oak-engineered-hardwood-flooring',
    'copy-of-dune-naf-6-1-2-oak-engineered-hardwood-flooring': 'dune-naf-6-1-2-oak-engineered-hardwood-flooring',
    'grey-naf-infiniti-12mm-laminate': 'grey-infiniti-naf-laminate-flooring',
    'meridian-naf-infiniti-12mm-laminate': 'meridian-infiniti-naf-laminate-flooring',
    'dark-birch-naf-infiniti-12mm-laminate': 'dark-birch-infiniti-naf-laminate-flooring',
    // ── Canadian Standard: truncated brand renames ──
    'atwood-brand-surfaces-6-1-2-engineered-american-oak-hardwood-flooring': 'atwood-novella-canadian-standard-engineered-american-oak-hardwood-flooring',
    'forest-trail-origins-6-1-2-engineered-american-hickory-hardwood-floo': 'forest-trail-origins-canadian-standard-engineered-american-hickory-hardwood-flooring',
    'royal-mile-origins-7-1-2-engineered-american-walnut-hardwood-floori': 'royal-mile-origins-canadian-standard-engineered-american-walnut-hardwood-flooring',
    'surrey-hills-origins-7-1-2-engineered-american-walnut-hardwood-floori': 'surrey-hills-origins-canadian-standard-engineered-american-walnut-hardwood-flooring',
    'warm-heritage-origins-6-1-2-engineered-american-hickory-hardwood-floorin': 'warm-heritage-origins-canadian-standard-engineered-american-hickory-hardwood-flooring',
    // ── Triforest: short codes → full DB slugs ──
    'tf-1101': 'triforest-tf1101-triforest-laminate-123mm-flooring',
    'tf-1122': 'triforest-tf1122-triforest-laminate-123mm-flooring',
    'tf-3101': 'triforest-tf3101-triforest-laminate-123mm-flooring',
    'tf1108': 'triforest-tf1108-triforest-laminate-123mm-flooring',
    'tfspc202': 'triforest-tfspc202-triforest-vinyl-65mm-flooring',
    'tfspc203': 'triforest-tfspc203-triforest-vinyl-65mm-flooring',
    'tfspc208': 'triforest-tfspc208-triforest-vinyl-65mm-flooring',
    'tfspc216': 'triforest-tfspc216-triforest-vinyl-65mm-flooring',
    'tfspc301': 'triforest-tfspc301-triforest-vinyl-42mm-flooring',
    'tfspc304': 'triforest-tfspc304-triforest-vinyl-42mm-flooring',
    'tfspc310': 'triforest-tfspc310-triforest-vinyl-42mm-flooring',
    'tfspc311': 'triforest-tfspc311-triforest-vinyl-42mm-flooring',
    'tfspc312': 'triforest-tfspc312-triforest-vinyl-42mm-flooring',
    'tfspc403': 'triforest-tfspc403-triforest-vinyl-7mm-flooring',
    'tfspc404': 'triforest-tfspc404-triforest-vinyl-7mm-flooring',
    'tfspc407': 'triforest-tfspc407-triforest-vinyl-7mm-flooring',
    'tfspc409': 'triforest-tfspc409-triforest-vinyl-7mm-flooring',
    'tfspc410': 'triforest-tfspc410-triforest-vinyl-7mm-flooring',
    'tfspc422': 'triforest-tfspc422-triforest-vinyl-7mm-flooring',
    'tfspc502': 'triforest-tfspc502-triforest-vinyl-6mm-flooring',
    'tfspc503': 'triforest-tfspc503-triforest-vinyl-6mm-flooring',
    'tfspc504': 'triforest-tfspc504-triforest-vinyl-6mm-flooring',
    'tfspc505': 'triforest-tfspc505-triforest-vinyl-6mm-flooring',
    'tfspc506': 'triforest-tfspc506-triforest-vinyl-6mm-flooring',
    'tfspc507': 'triforest-tfspc507-triforest-vinyl-6mm-flooring',
    'tfspc508': 'triforest-tfspc508-triforest-vinyl-6mm-flooring',
    'tfspc510': 'triforest-tfspc510-triforest-vinyl-6mm-flooring',
    'tfspc512': 'triforest-tfspc512-triforest-vinyl-6mm-flooring',
    // ── Vidar: old format → design flooring (generic) slug ──
    'black-brown-vidar-6-american-white-oak-engineered-hardwood-flooring': 'black-brown-vidar-design-flooring-american-white-oak-engineered-hardwood-flooring',
    'charcoal-vidar-7-american-white-oak-engineered-hardwood-flooring': 'charcoal-vidar-design-flooring-american-white-oak-engineered-hardwood-flooring',
    'clear-vidar-7-1-2-european-white-ash-engineered-hardwood-flooring': 'clear-vidar-7-5-european-white-ash-engineered-hardwood-select-better-ab',
    'clear-vidar-7-american-white-oak-engineered-hardwood-flooring': 'clear-vidar-design-flooring-european-white-oak-engineered-hardwood-flooring',
    'coffee-vidar-6-american-white-oak-engineered-hardwood-flooring': 'coffee-vidar-design-flooring-american-white-oak-engineered-hardwood-flooring',
    'fortino-vidar-6-american-white-oak-engineered-hardwood-flooring': 'fortino-vidar-design-flooring-american-white-oak-engineered-hardwood-flooring',
    'frost-white-vidar-european-white-ash-engineered-hardwood-flooring': 'frost-white-vidar-design-flooring-european-white-ash-engineered-hardwood-flooring',
    'honey-wheat-vidar-6-american-white-oak-engineered-hardwood-flooring': 'honey-wheat-vidar-design-flooring-american-white-oak-engineered-hardwood-flooring',
    'landmark-vidar-6-american-white-oak-engineered-hardwood-flooring': 'landmark-vidar-design-flooring-european-white-ash-engineered-hardwood-flooring',
    'moon-light-vidar-6-american-white-oak-engineered-hardwood-flooring': 'moon-light-vidar-design-flooring-american-white-oak-engineered-hardwood-flooring',
    'raw-vidar-7-1-2-european-white-ash-engineered-hardwood-flooring': 'raw-vidar-design-flooring-european-white-ash-engineered-hardwood-flooring',
    'sandy-vidar-european-white-ash-engineered-hardwood-flooring': 'sandy-vidar-design-flooring-european-white-ash-engineered-hardwood-flooring',
    'sky-vidar-7-american-white-oak-engineered-hardwood-flooring': 'sky-vidar-design-flooring-american-white-oak-engineered-hardwood-flooring',
    'snow-white-vidar-7-american-white-oak-engineered-hardwood-flooring': 'pearl-vidar-design-flooring-american-white-oak-engineered-hardwood-flooring',
    // ── Evergreen ──
    '2024-evergreen-flooring-12mm-waterproof-laminate-1': '2024-evergreen-flooring-12mm-waterproof-laminate',
    '78211-evergreen-flooring-12mm-waterproof-laminate': '721287-evergreen-flooring-12mm-waterproof-laminate',
    // ── Lee: old dimensioned slugs → new lee-branded slugs ──
    'alura-6-1-2-engineered-oak-hardwood-flooring': 'alura-lee-select-grade-engineered-european-oak-hardwood-flooring',
    'aubrae-6-1-2-engineered-american-oak-hardwood-flooring': 'aubrae-lee-select-better-engineered-american-oak-hardwood-flooring',
    'brealen-6-1-2-engineered-oak-hardwood-flooring': 'brealen-lee-select-grade-engineered-european-oak-hardwood-flooring',
    'covelle-6-1-2-engineered-american-oak-hardwood-flooring': 'covelle-lee-select-better-engineered-american-oak-hardwood-flooring',
    'ellaston-6-1-2-engineered-american-oak-hardwood-flooring': 'ellaston-lee-select-better-engineered-american-oak-hardwood-flooring',
    'mirelle-6-1-2-engineered-oak-hardwood-flooring': 'mirelle-lee-select-grade-engineered-european-oak-hardwood-flooring',
    'redmond-6-1-2-engineered-american-oak-hardwood-flooring': 'redmond-lee-select-better-engineered-american-oak-hardwood-flooring',
    'sandale-6-1-2-engineered-american-oak-hardwood-flooring': 'sandale-lee-select-better-engineered-american-oak-hardwood-flooring',
    'solen-6-1-2-engineered-european-oak-hardwood-flooring': 'solen-lee-select-grade-engineered-european-oak-hardwood-flooring',
    'terrona-6-1-2-engineered-american-oak-hardwood-flooring': 'terrona-lee-select-better-engineered-american-oak-hardwood-flooring',
    'thalen-6-1-2-engineered-oak-hardwood-flooring': 'thalen-lee-select-grade-engineered-european-oak-hardwood-flooring',
    // ── Short/ambiguous slugs → verified best match ──
    'antique-dark': 'antique-dark-12mm-laminate-northernest-laminate-flooring',
    'austin-brown': 'austin-brown-falcon-floor-products-6mm-vinyl-flooring',
    'barnyard': 'barnyard-falcon-floor-products-6-1-2-hickory-engineered-hardwood-flooring',
    'caraway': 'caraway-falcon-floor-products-6-1-2-maple-engineered-hardwood-flooring',
    'chain-mail': 'chain-mail-falcon-floor-products-7mm-vinyl-flooring',
    'chelsea': 'chelsea-woden-grand-chateau-oak-7-1-2-engineered-hardwood-flooring',
    'city-mood': 'city-mood-12mm-laminate-northernest-laminate-flooring',
    'cloud': 'cloud-falcon-floor-products-6-1-2-red-oak-engineered-hardwood-flooring',
    'cloudy-grey': 'cloudy-grey-woden-vermont-6-1-2-oak-engineered-hardwood-flooring',
    'clove': 'clove-falcon-floor-products-6-1-2-maple-engineered-hardwood-flooring',
    'dark-birch': 'dark-birch-infiniti-naf-laminate-flooring',
    'euro-grey-1': 'euro-grey-falcon-floor-products-6-1-2-hickory-engineered-hardwood-flooring',
    'forest-hill': 'forest-hill-naf-aquaplus-bronze-5mm-vinyl-flooring',
    'greystone-1': 'greystone-falcon-floor-products-6-1-2-hickory-engineered-hardwood-flooring',
    'hudson': 'hudson-woden-vermont-6-1-2-oak-engineered-hardwood-flooring',
    'latte': 'latte-7-1-2-european-oak-northernest-engineered-hardwood-flooring',
    'linen': 'linen-falcon-floor-products-6-1-2-red-oak-engineered-hardwood-flooring',
    'midnight': 'midnight-falcon-floor-products-6-1-2-hickory-engineered-hardwood-flooring',
    'mighty-grey': 'mighty-grey-woden-grand-chateau-oak-7-1-2-engineered-hardwood-flooring',
    'modern-grey': 'modern-grey-woden-vermont-6-1-2-oak-engineered-hardwood-flooring',
    'mountain-peak-1': 'mountain-peak-falcon-floor-products-6mm-vinyl-flooring',
    'north-sky': 'north-sky-falcon-floor-products-6mm-vinyl-flooring',
    'pearl': 'pearl-vidar-design-flooring-american-white-oak-engineered-hardwood-flooring',
    'powder-grey': 'powder-grey-falcon-floor-products-7mm-vinyl-flooring',
    'prestige-oak': 'prestige-oak-northernest-7-1-2-european-oak-engineered-hardwood',
    'robusto': 'robusto-12mm-laminate-northernest-laminate-flooring',
    'rocky': 'rocky-woden-grand-chateau-oak-7-1-2-engineered-hardwood-flooring',
    'romance': 'romance-woden-grand-chateau-oak-7-1-2-engineered-hardwood-flooring',
    'sandstone': 'sandstone-falcon-floor-products-6mm-vinyl-flooring',
    'sierra': 'sierra-falcon-floor-products-6-1-2-maple-engineered-hardwood-flooring',
    'silk': 'silk-naf-12mm-laminate-flooring',
    'smoke-grey-1': 'smoke-grey-vidar-design-flooring-american-white-oak-engineered-hardwood-flooring',
    'snow-storm': 'snow-storm-12mm-laminate-northernest-laminate-flooring',
    'truffle': 'truffle-6-white-oak-northernest-engineered-hardwood-flooring',
    'vogue': 'vogue-falcon-floor-products-6-1-2-red-oak-engineered-hardwood-flooring',
    'wenge': 'wenge-12mm-laminate-northernest-laminate-flooring',
  };

  // Service pages that lived under /product-page/ in Wix
  if (pathname === '/product-page/hardwood-installation' || pathname === '/product-page/vinyl-installation' || pathname === '/product-page/laminate-installation') {
    return NextResponse.redirect(new URL('/installation', request.url), { status: 301 });
  }

  if (pathname.startsWith('/product-page/')) {
    const slug = pathname.replace('/product-page/', '');
    const realSlug = SHORT_SLUG_REDIRECTS[slug] || slug;
    return NextResponse.redirect(new URL(`/products/${realSlug}`, request.url), { status: 301 });
  }

  // Also catch direct /products/short-slug hits (from cached Google results)
  if (pathname.startsWith('/products/') && !pathname.startsWith('/products?')) {
    const slug = pathname.replace('/products/', '');
    if (SHORT_SLUG_REDIRECTS[slug]) {
      return NextResponse.redirect(new URL(`/products/${SHORT_SLUG_REDIRECTS[slug]}`, request.url), { status: 301 });
    }
  }

  // /product/slug (singular, old Base44 format) → /products/slug
  if (pathname.startsWith('/product/') && !pathname.startsWith('/product-page/') && !pathname.startsWith('/products')) {
    const slug = pathname.replace('/product/', '');
    const realSlug = SHORT_SLUG_REDIRECTS[slug] || slug;
    return NextResponse.redirect(new URL(`/products/${realSlug}`, request.url), { status: 301 });
  }

  if (pathname.startsWith('/blog-1/') || pathname.startsWith('/post/')) {
    return NextResponse.redirect(new URL('/blog', request.url), { status: 301 });
  }

  if (pathname === '/ProductDetail') {
    const slug = searchParams.get('slug');
    return NextResponse.redirect(new URL(slug ? `/products/${slug}` : '/products', request.url), { status: 301 });
  }

  if (pathname === '/BlogPost') {
    const slug = searchParams.get('slug');
    return NextResponse.redirect(new URL(slug ? `/blog/${slug}` : '/blog', request.url), { status: 301 });
  }

  if (pathname === '/Location') {
    const city = searchParams.get('city');
    if (city) {
      const citySlug = city.toLowerCase().replace(/\s+/g, '-');
      return NextResponse.redirect(new URL(`/flooring-in/${citySlug}`, request.url), { status: 301 });
    }
    return NextResponse.redirect(new URL('/flooring-showroom-markham', request.url), { status: 301 });
  }

  if (pathname === '/Gallery') {
    const project = searchParams.get('project');
    if (project) {
      return NextResponse.redirect(new URL(`/gallery/${project}`, request.url), { status: 301 });
    }
  }

  // ── Auth session refresh (runs on every non-redirect request) ───────
  // This is CRITICAL: without it, Supabase JWT expires after 1 hour
  // and the user silently gets logged out.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let response = NextResponse.next();

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    // getUser() validates + refreshes the token. The refreshed token
    // is written back to cookies via setAll above.
    const { data: { user }, error } = await supabase.auth.getUser();

    // ── Admin route protection ──────────────────────────────────────
    if (pathname.startsWith('/admin')) {
      if (error || !user) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (serviceRoleKey) {
        try {
          const res = await fetch(
            `${supabaseUrl}/rest/v1/users?id=eq.${user.id}&select=role`,
            {
              headers: {
                apikey: serviceRoleKey,
                Authorization: `Bearer ${serviceRoleKey}`,
              },
            }
          );
          const rows = await res.json();
          if (!rows?.[0] || rows[0].role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url));
          }
        } catch {
          return NextResponse.redirect(new URL('/', request.url));
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     * - public folder files (images, etc.)
     * - API routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$|api/).*)',
  ],
};
