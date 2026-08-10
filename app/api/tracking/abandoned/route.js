import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { sendTelegramAlert, formatAbandonedCartAlert } from '@/lib/telegram';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

// Rate limit: 2 abandoned-cart logs per IP per hour (anti-flood on the beacon endpoint)
const RATE_LIMIT = { maxRequests: 2, windowMs: 60 * 60 * 1000 };

// I-2: This endpoint fires the instant a customer leaves checkout (often mid-flow while
// they grab their card). It must NOT send a recovery email immediately — serverless can't
// truly defer, and an instant "you abandoned your cart" email annoys buyers who come right
// back. Instead we LOG the lead + alert the team; the follow-up cron
// (/api/cron/lead-followup) sends the recovery email after a real 1h delay and a 48h
// second touch, and skips anyone who completed an order in the meantime.

export async function POST(request) {
  try {
    const { customerName, customerEmail, customerPhone, cartItems, cartValue, pageUrl } = await request.json();

    if (!customerEmail) {
      return NextResponse.json({ success: true }); // Silent — don't fail UX
    }

    const supabase = getSupabaseAdminClient();

    // Rate limit to prevent log/alert flooding
    const ip = getClientIP(request);
    checkRateLimit(`abandoned:${ip}`, RATE_LIMIT);

    // Check if we already logged this person recently (prevent duplicate rows + alerts)
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

    // Log abandoned checkout for follow-up. The recovery email is sent later by the
    // lead-followup cron (1h delay + 48h second touch), NOT here — see I-2 note above.
    // metadata.followup_stage tracks which recovery emails have been sent (0 = none yet).
    if (!alreadyEmailed) {
      const { error } = await supabase
        .from('contact_leads')
        .insert({
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          message: `Abandoned checkout — Cart value: C$${cartValue?.toFixed(2)} — Items: ${cartItems?.map(i => i.product_name).join(', ')}`,
          source: 'abandoned_checkout',
          status: 'new',
          metadata: { followup_stage: 0, cart_value: cartValue || null },
        });

      if (error) {
        console.warn('Failed to log abandoned checkout:', error);
      }

      // Fire Telegram alert for every new abandoned cart — AWAIT so it isn't dropped.
      try {
        await sendTelegramAlert(formatAbandonedCartAlert({ customerName, customerEmail, cartValue, cartItems }));
      } catch (e) {
        console.error('[Abandoned] Telegram alert failed:', e?.message);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Abandoned checkout tracking error:', error);
    return NextResponse.json({ success: true }); // Don't fail the UX
  }
}
