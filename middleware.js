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
]);

// Vidar slug fixes — wrong species in URLs (Apr 7, 2026)
const SLUG_REDIRECTS = new Map([
  ['/products/chocolate-vidar-design-flooring-american-white-oak-engineered-hardwood-flooring', '/products/chocolate-vidar-design-flooring-american-black-walnut-engineered-hardwood-flooring'],
  ['/products/chocolate-vidar-5-american-white-oak-engineered-hardwood-herringbone-character-abcd', '/products/chocolate-vidar-5-american-black-walnut-engineered-hardwood-herringbone-character-abcd'],
  ['/products/clear-vidar-design-flooring-european-white-oakash-engineered-hardwood-flooring', '/products/clear-vidar-design-flooring-european-white-ash-engineered-hardwood-flooring'],
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

  if (pathname.startsWith('/product-page/')) {
    const slug = pathname.replace('/product-page/', '');
    return NextResponse.redirect(new URL(`/products/${slug}`, request.url), { status: 301 });
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
