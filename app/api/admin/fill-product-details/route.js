import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';

/**
 * POST /api/admin/fill-product-details
 * AI-powered product enrichment stub.
 * Full implementation deferred to post-cutover (requires Anthropic API call for each product).
 */
export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;

  // TODO: Implement AI product enrichment using Anthropic API
  // For now, return a helpful message instead of 404
  return NextResponse.json({
    success: false,
    error: 'AI product enrichment is not yet implemented. Use the Product Enrichment page for individual products.',
    message: 'This feature will be available post-cutover.',
  }, { status: 501 });
}
