import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

// On-demand ISR revalidation endpoint
// Usage: POST /api/revalidate { "path": "/products/some-slug", "secret": "..." }
// Or: POST /api/revalidate { "paths": ["/products/a", "/products/b"], "secret": "..." }
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || 'bbs-revalidate-2026';

export async function POST(request) {
  try {
    const body = await request.json();
    const { path, paths, secret } = body;

    if (secret !== REVALIDATE_SECRET) {
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
