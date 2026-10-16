import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/api-auth';

/**
 * POST /api/admin/revalidate-product  { slug?: string, all?: boolean }
 *
 * Admin-session-gated on-demand ISR purge (no shared secret needed — unlike
 * /api/revalidate). Called after an admin product save / bulk stock flip so a
 * product marked out of stock stops being sold off a cached PDP (pages are
 * ISR'd for 1h). `all: true` purges every /products/[slug] page + the listing
 * surfaces; otherwise just the one PDP + the main grid.
 */
export async function POST(request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json().catch(() => ({}));
    const { slug, all } = body || {};
    const purged = [];

    if (all) {
      revalidatePath('/products/[slug]', 'page');
      purged.push('/products/[slug]');
    } else if (slug && typeof slug === 'string') {
      const clean = slug.replace(/^\/+|\/+$/g, '');
      if (!/^[a-z0-9-]+$/i.test(clean)) {
        return NextResponse.json({ success: false, error: 'Invalid slug' }, { status: 400 });
      }
      revalidatePath(`/products/${clean}`);
      purged.push(`/products/${clean}`);
    } else {
      return NextResponse.json({ success: false, error: 'Provide slug or all:true' }, { status: 400 });
    }

    // Listing/grid surfaces that render stock badges from the same row.
    for (const p of ['/products', '/clearance']) {
      revalidatePath(p);
      purged.push(p);
    }

    return NextResponse.json({ success: true, purged, now: Date.now() });
  } catch (err) {
    console.error('[Admin] revalidate-product error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
