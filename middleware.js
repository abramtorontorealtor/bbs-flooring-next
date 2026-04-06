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
