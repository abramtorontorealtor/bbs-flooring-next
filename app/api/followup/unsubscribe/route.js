import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { normalizeEmail, verifyUnsubscribeToken } from '@/lib/followup/unsubscribe';

export const dynamic = 'force-dynamic';

function page(title, body, status = 200) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | BBS Flooring</title></head>
<body style="margin:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:520px;margin:48px auto;padding:32px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;">
<p style="margin:0 0 4px;font-size:22px;font-weight:800;color:#f59e0b;">BBS <span style="font-size:11px;letter-spacing:2px;color:#94a3b8;">FLOORING</span></p>
<h1 style="font-size:20px;color:#1e293b;margin:16px 0 8px;">${title}</h1>
<p style="font-size:15px;color:#334155;line-height:1.6;">${body}</p>
<p style="font-size:13px;color:#94a3b8;margin-top:24px;">Questions? Call (647) 428-1111 or email info@bbsflooring.ca.</p>
</div></body></html>`;
  return new NextResponse(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}

// GET /api/followup/unsubscribe?e=<email>&t=<token>
// One click, no login, no confirmation step (CASL: must be able to unsubscribe without further action).
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = normalizeEmail(searchParams.get('e'));
  const token = searchParams.get('t');

  if (!email || !token || !verifyUnsubscribeToken(email, token)) {
    return page('That link didn\u2019t work', 'The unsubscribe link looks incomplete or expired. Reply to any of our emails with \u201cunsubscribe\u201d and we\u2019ll take care of it.', 400);
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) return page('Something went wrong', 'Please try again in a minute, or reply to our email with \u201cunsubscribe\u201d.', 503);

  const { error } = await supabase
    .from('email_suppressions')
    .upsert({ email, reason: 'unsubscribe', source: 'link' }, { onConflict: 'email' });

  if (error) {
    console.error('[Unsubscribe] insert failed:', error.message);
    return page('Something went wrong', 'Please try again in a minute, or reply to our email with \u201cunsubscribe\u201d.', 500);
  }

  return page('You\u2019re unsubscribed', `We won\u2019t send any more follow-up emails to <strong>${email}</strong>. If you asked us for a quote or booked a measurement, you\u2019ll still get those confirmations.`);
}
