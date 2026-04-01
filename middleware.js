import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Next.js Middleware — handles:
 * 1. Admin route protection (server-side auth + role check)
 * 2. Legacy URL patterns for cutover compatibility
 */

// Single-word PascalCase pages that need lowercase redirects.
// These were removed from next.config.mjs to prevent redirect loops.
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

  // ── Admin route protection ──────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      // Can't verify auth — block access
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Create a response we can modify (cookies)
    let response = NextResponse.next();

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

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      // Not authenticated → redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check admin role via service role key (bypasses RLS)
    // We use a direct fetch to avoid importing the admin client in middleware
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
        // Can't verify role — block access
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    return response;
  }

  // Single-word PascalCase → lowercase (exact match, case-sensitive)
  const caseRedirect = CASE_REDIRECTS.get(pathname);
  if (caseRedirect) {
    return NextResponse.redirect(new URL(caseRedirect, request.url), { status: 301 });
  }

  // /ProductDetail?slug=X → /products/X
  if (pathname === '/ProductDetail') {
    const slug = searchParams.get('slug');
    if (slug) {
      return NextResponse.redirect(new URL(`/products/${slug}`, request.url), { status: 301 });
    }
    return NextResponse.redirect(new URL('/products', request.url), { status: 301 });
  }

  // /BlogPost?slug=X → /blog/X
  if (pathname === '/BlogPost') {
    const slug = searchParams.get('slug');
    if (slug) {
      return NextResponse.redirect(new URL(`/blog/${slug}`, request.url), { status: 301 });
    }
    return NextResponse.redirect(new URL('/blog', request.url), { status: 301 });
  }

  // /Location?city=X → /flooring-in/X
  if (pathname === '/Location') {
    const city = searchParams.get('city');
    if (city) {
      const citySlug = city.toLowerCase().replace(/\s+/g, '-');
      return NextResponse.redirect(new URL(`/flooring-in/${citySlug}`, request.url), { status: 301 });
    }
    return NextResponse.redirect(new URL('/flooring-showroom-markham', request.url), { status: 301 });
  }

  // /Gallery?project=X → /gallery/X
  if (pathname === '/Gallery') {
    const project = searchParams.get('project');
    if (project) {
      return NextResponse.redirect(new URL(`/gallery/${project}`, request.url), { status: 301 });
    }
    // Don't redirect here — already handled by CASE_REDIRECTS above
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Admin routes (server-side auth guard)
    '/admin/:path*',
    // Legacy redirects + PascalCase pages
    '/ProductDetail',
    '/BlogPost',
    '/Location',
    '/Gallery',
    '/Vinyl',
    '/Laminate',
    '/Products',
    '/Clearance',
    '/Stairs',
    '/Installation',
    '/Compare',
    '/Financing',
    '/About',
    '/Contact',
    '/Blog',
    '/Cart',
  ],
};
