import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { sendAbandonedCheckoutEmail } from '@/lib/email';
import { sendTelegramAlert, formatAbandonedCartAlert } from '@/lib/telegram';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

// Rate limit: 2 abandoned checkout emails per IP per hour
const RATE_LIMIT = { maxRequests: 2, windowMs: 60 * 60 * 1000 };

export async function POST(request) {
  try {
    const { customerName, customerEmail, customerPhone, cartItems, cartValue, pageUrl } = await request.json();

    if (!customerEmail) {
      return NextResponse.json({ success: true }); // Silent — don't fail UX
    }

    const supabase = getSupabaseAdminClient();

    // Rate limit to prevent email flooding
    const ip = getClientIP(request);
    const limit = checkRateLimit(`abandoned:${ip}`, RATE_LIMIT);

    // Check if we already emailed this person recently (prevent duplicate sends)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('contact_leads')
      .select('id', { count: 'exact', head: true })
      .eq('customer_email', customerEmail)
      .eq('source', 'abandoned_checkout')
      .gte('created_at', oneHourAgo);

    const alreadyEmailed = (count || 0) > 0;

    // Check if this person already placed an order recently — if so, suppress everything
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count: recentOrderCount } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('customer_email', customerEmail)
      .gte('created_at', tenMinutesAgo);

    if ((recentOrderCount || 0) > 0) {
      // They just placed an order — not abandoned, do nothing
      return NextResponse.json({ success: true, suppressed: true });
    }

    // Log abandoned checkout for follow-up
    const { error } = await supabase
      .from('contact_leads')
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        message: `Abandoned checkout — Cart value: C$${cartValue?.toFixed(2)} — Items: ${cartItems?.map(i => i.product_name).join(', ')}`,
        source: 'abandoned_checkout',
        status: 'new',
      });

    if (error) {
      console.warn('Failed to log abandoned checkout:', error);
    }

    // Fire Telegram alert for every new abandoned cart — AWAIT so it isn't dropped.
    if (!alreadyEmailed) {
      try {
        await sendTelegramAlert(formatAbandonedCartAlert({ customerName, customerEmail, cartValue, cartItems }));
      } catch (e) {
        console.error('[Abandoned] Telegram alert failed:', e?.message);
      }
    }

    // Send recovery email if not already emailed and within rate limit
    if (!alreadyEmailed && limit.ok && customerEmail) {
      // Delay the email by 30 minutes to avoid emailing customers who come right back
      // In serverless, we can't truly delay — schedule via a simple setTimeout
      // For production, use a proper queue. For now, send immediately but with dedup guard above.
      sendAbandonedCheckoutEmail({
        customerName,
        customerEmail,
        cartItems,
        cartValue,
      }).catch(err => console.warn('Abandoned cart email failed:', err));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Abandoned checkout tracking error:', error);
    return NextResponse.json({ success: true }); // Don't fail the UX
  }
}
