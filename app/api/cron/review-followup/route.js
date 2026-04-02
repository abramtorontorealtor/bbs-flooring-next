import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { sendReviewFollowUp } from '@/lib/email';

// Cron: Send review follow-up emails 3 days after delivery.
// Called by Vercel Cron — see vercel.json for schedule.
// Protects against double-sends with review_email_sent flag.

const REVIEW_DELAY_DAYS = 3;

export async function GET(request) {
  // Verify cron secret (Vercel sets this header)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const cutoff = new Date(Date.now() - REVIEW_DELAY_DAYS * 24 * 60 * 60 * 1000).toISOString();

    // Find delivered orders where:
    // 1. delivered_at is at least 3 days ago
    // 2. review email hasn't been sent yet
    // 3. Order wasn't cancelled/refunded
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'delivered')
      .eq('review_email_sent', false)
      .lte('delivered_at', cutoff)
      .not('customer_email', 'is', null)
      .limit(10); // Process in batches

    if (error) throw error;

    const results = [];
    for (const order of (orders || [])) {
      try {
        await sendReviewFollowUp({ order });
        await supabase
          .from('orders')
          .update({ review_email_sent: true })
          .eq('id', order.id);
        results.push({ order_number: order.order_number, sent: true });
      } catch (err) {
        console.error(`[ReviewCron] Failed for ${order.order_number}:`, err);
        results.push({ order_number: order.order_number, sent: false, error: err.message });
      }
    }

    return NextResponse.json({
      processed: results.length,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[ReviewCron] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
