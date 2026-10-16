import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase';

/**
 * POST /api/admin/set-all-in-stock
 * Sets all products to in_stock = true.
 */
export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error: dbError } = await supabase
      .from('products')
      .update({ in_stock: true })
      .neq('in_stock', true)
      .select('id');

    if (dbError) throw dbError;

    // Purge every cached PDP + listing so the stock flip is live immediately.
    revalidatePath('/products/[slug]', 'page');
    revalidatePath('/products');
    revalidatePath('/clearance');

    return NextResponse.json({
      success: true,
      updated: data?.length ?? 0,
      message: `${data?.length ?? 0} products set to in-stock`,
    });
  } catch (err) {
    console.error('[Admin] setAllInStock error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
