import { getSupabaseServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ count: 0 });
  }

  try {
    const supabase = getSupabaseServerClient();
    const { count, error } = await supabase
      .from('cart_items')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', sessionId);

    if (error) {
      return NextResponse.json({ count: 0 });
    }

    return NextResponse.json({ count: count || 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}

// POST /api/cart — bulk add (Project Planner, Oct 30 2026). The planner used to fire 4–6
// browser-side supabase-js inserts in parallel; with a logged-in user supabase-js serialises
// them behind its auth lock and mobile Safari left "Adding…" hanging (Abram, 04:44 UTC).
// One server insert = atomic, no auth lock, no half-added carts on retry.
const CART_COLUMNS = new Set([
  'session_id', 'product_id', 'product_name', 'variant_label', 'sku', 'sqft_needed', 'sqft_per_box',
  'boxes_required', 'actual_sqft', 'price_per_sqft', 'line_total', 'image_url', 'quantity',
  'item_type', 'transition_type', 'transition_quantity', 'parent_product_id', 'parent_product_name',
]);

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Bad JSON' }, { status: 400 }); }
  const items = Array.isArray(body?.items) ? body.items : [];
  if (items.length === 0 || items.length > 60) {
    return NextResponse.json({ error: 'items must be 1–60 rows' }, { status: 400 });
  }
  const sessionId = typeof body.session_id === 'string' && body.session_id.startsWith('session_') ? body.session_id : null;
  if (!sessionId) return NextResponse.json({ error: 'session_id required' }, { status: 400 });

  const rows = items.map((it) => {
    const row = {};
    for (const [k, v] of Object.entries(it || {})) {
      if (CART_COLUMNS.has(k) && v !== undefined) row[k] = v;
    }
    row.session_id = sessionId; // never trust a per-row session
    return row;
  });
  if (rows.some((r) => !r.product_name || !(Number(r.line_total) >= 0))) {
    return NextResponse.json({ error: 'each row needs product_name + line_total' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  const { data, error } = await supabase.from('cart_items').insert(rows).select('id');
  if (error) {
    console.error('[cart POST] insert failed', error);
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
  }
  return NextResponse.json({ inserted: data?.length || 0 });
}
