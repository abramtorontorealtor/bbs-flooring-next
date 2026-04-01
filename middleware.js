import { NextResponse } from 'next/server';

/**
 * Next.js Middleware — handles legacy URL patterns for cutover compatibility.
 *
 * Pattern coverage:
 * 1. /ProductDetail?slug=X  → /products/X   (Base44 product URLs → new slug URLs)
 * 2. /BlogPost?slug=X       → /blog/X       (Base44 blog URLs → new blog URLs)
 * 3. /Location?city=X       → /flooring-in/X (Base44 location URLs)
 * 4. /Gallery?project=X     → /gallery/X    (Base44 gallery URLs)
 * 5. Single-word PascalCase  → lowercase     (e.g. /Vinyl → /vinyl, /Blog → /blog)
 *
 * NOTE: Case-only redirects (e.g. /Vinyl → /vinyl) CANNOT go in next.config.mjs
 * because Next.js 16 / Vercel matches redirect sources case-insensitively,
 * which causes /vinyl to match /Vinyl and loop forever. Middleware gives us
 * exact control over matching.
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

export function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;

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
  // Match legacy paths + PascalCase single-word pages
  matcher: [
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
