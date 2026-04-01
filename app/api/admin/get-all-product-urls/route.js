import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase';

/**
 * GET /api/admin/get-all-product-urls
 * Returns a list of all product slugs as full URLs.
 */
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const supabase = getSupabaseAdminClient();
    const { data: products, error: dbError } = await supabase
      .from('products')
      .select('id, name, slug')
      .order('name');

    if (dbError) throw dbError;

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bbsflooring.ca';
    const urls = (products || []).map(p => ({
      id: p.id,
      name: p.name,
      url: `${baseUrl}/products/${p.slug}`,
    }));

    return NextResponse.json({ success: true, urls, count: urls.length });
  } catch (err) {
    console.error('[Admin] getAllProductUrls error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
