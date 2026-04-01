import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';

const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';
const FROM_EMAIL = 'info@bbsflooring.ca';
const FROM_NAME = 'BBS Flooring';
const ADMIN_EMAIL = 'info@bbsflooring.ca';

async function sendEmail({ to, subject, html, replyTo }) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) return { success: false, reason: 'no_api_key' };
  const payload = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject,
    content: [{ type: 'text/html', value: html }],
  };
  if (replyTo) payload.reply_to = { email: replyTo };
  const res = await fetch(SENDGRID_API_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.error('[Email] SendGrid error:', res.status, await res.text());
    return { success: false };
  }
  return { success: true };
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function POST(request) {
  try {
    const { userId, userEmail, userName } = await request.json();
    if (!userId || !userEmail) {
      return NextResponse.json({ success: false, error: 'Missing user details' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    // Check if welcome email already sent
    const { data: user } = await supabase
      .from('users')
      .select('welcome_email_sent')
      .eq('id', userId)
      .single();

    if (user?.welcome_email_sent) {
      return NextResponse.json({ success: true, skipped: true });
    }

    // Send welcome email to customer
    const customerHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:linear-gradient(135deg,#1e293b,#334155);color:white;padding:24px 32px;border-radius:16px 16px 0 0;">
      <h1 style="margin:0;font-size:24px;font-weight:800;color:#f59e0b;">BBS</h1>
      <p style="margin:4px 0 0;font-size:12px;letter-spacing:2px;color:#94a3b8;">FLOORING</p>
    </div>
    <div style="background:white;padding:32px;border-radius:0 0 16px 16px;border:1px solid #e2e8f0;border-top:none;">
      <h2 style="margin:0 0 16px;font-size:20px;color:#1e293b;">Welcome to BBS Flooring!</h2>
      <p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${esc(userName) || 'there'},</p>
      <p style="font-size:15px;color:#334155;line-height:1.6;">Your account is all set. Here's what you can do:</p>
      <ul style="font-size:14px;color:#334155;line-height:1.8;padding-left:20px;">
        <li><strong>Member pricing</strong> — save on every order once verified</li>
        <li><strong>Save products</strong> — heart any product to compare later</li>
        <li><strong>Quick quotes</strong> — get instant estimates with our calculator</li>
        <li><strong>Order history</strong> — track all your purchases in one place</li>
      </ul>
      <div style="text-align:center;margin:32px 0;">
        <a href="https://bbsflooring.ca/products" style="display:inline-block;background:#f59e0b;color:#1e293b;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:16px;">Browse Products →</a>
      </div>
      <p style="font-size:14px;color:#64748b;">Questions? Call us at <a href="tel:+16474281111" style="color:#f59e0b;">(647) 428-1111</a> or visit our showroom at 6061 Highway 7, Unit B, Markham.</p>
    </div>
    <div style="text-align:center;padding:16px;color:#94a3b8;font-size:12px;">
      <p>BBS Flooring · 6061 Highway 7, Unit B · Markham, ON L3P 3B2</p>
    </div>
  </div>
</body>
</html>`;

    // Send admin notification
    const adminHtml = `
<div style="font-family:sans-serif;padding:20px;">
  <h2 style="color:#1e293b;">New Account Created</h2>
  <table style="border-collapse:collapse;">
    <tr><td style="padding:6px 12px 6px 0;color:#64748b;">Name</td><td style="padding:6px 0;font-weight:600;">${esc(userName) || '—'}</td></tr>
    <tr><td style="padding:6px 12px 6px 0;color:#64748b;">Email</td><td style="padding:6px 0;"><a href="mailto:${esc(userEmail)}" style="color:#f59e0b;">${esc(userEmail)}</a></td></tr>
  </table>
</div>`;

    await Promise.all([
      sendEmail({ to: userEmail, subject: 'Welcome to BBS Flooring! 🏠', html: customerHtml }),
      sendEmail({ to: ADMIN_EMAIL, subject: `👤 New Account: ${esc(userName) || userEmail}`, html: adminHtml, replyTo: userEmail }),
    ]);

    // Mark as sent
    await supabase.from('users').update({ welcome_email_sent: true }).eq('id', userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Welcome email error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
