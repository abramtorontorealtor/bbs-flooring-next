import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

// On-demand ISR revalidation endpoint
// Usage: POST /api/revalidate { "path": "/products/some-slug", "secret": "..." }
// Or: POST /api/revalidate { "paths": ["/products/a", "/products/b"], "secret": "..." }
// SECURITY (F8): no hardcoded fallback. If REVALIDATE_SECRET is unset, the endpoint
// is disabled rather than falling back to a public, source-visible secret.
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

export async function POST(request) {
  try {
    if (!REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Revalidation not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { path, paths, secret } = body;

    if (!secret || secret !== REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }

    const toRevalidate = paths || (path ? [path] : []);
    if (toRevalidate.length === 0) {
      return NextResponse.json({ error: 'No path(s) provided' }, { status: 400 });
    }

    for (const p of toRevalidate) {
      revalidatePath(p);
    }

    return NextResponse.json({ revalidated: toRevalidate, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
