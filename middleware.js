import { NextResponse } from 'next/server';

/**
 * Next.js Middleware — handles legacy URL patterns for cutover compatibility.
 *
 * Pattern coverage:
 * 1. /ProductDetail?slug=X  → /products/X   (Base44 product URLs → new slug URLs)
 * 2. /BlogPost?slug=X       → /blog/X       (Base44 blog URLs → new blog URLs)
 * 3. /Location?city=X       → /flooring-in/X (Base44 location URLs)
 * 4. /Gallery?project=X     → /gallery/X    (Base44 gallery URLs)
 *
 * The Cloudflare worker `bbs-redirects-v1` maps old Wix paths to Base44 paths.
 * After cutover, those Base44 paths land here and get redirected to Next.js paths.
 * Static page redirects (e.g. /Vinyl → /vinyl) are handled in next.config.mjs.
 */
export function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;

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
    return NextResponse.redirect(new URL('/gallery', request.url), { status: 301 });
  }

  return NextResponse.next();
}

export const config = {
  // Only run on paths that need legacy handling — avoids overhead on every request
  matcher: ['/ProductDetail', '/BlogPost', '/Location', '/Gallery'],
};
