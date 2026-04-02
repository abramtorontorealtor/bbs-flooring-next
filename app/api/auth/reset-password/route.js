import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import crypto from 'crypto';

const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';
const FROM_EMAIL = 'info@bbsflooring.ca';
const FROM_NAME = 'BBS Flooring';

async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.warn('[Email] SENDGRID_API_KEY not set — skipping');
    return { success: false, reason: 'no_api_key' };
  }
  const res = await fetch(SENDGRID_API_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('[Email] SendGrid error:', res.status, text);
    return { success: false, error: text };
  }
  return { success: true };
}

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    // Look up user by email
    const { data: user } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('email', email.toLowerCase().trim())
      .single();

    // Always return success (don't leak whether email exists)
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

    // Save token to user record
    const { error } = await supabase
      .from('users')
      .update({
        reset_token: token,
        reset_token_expires: expires.toISOString(),
      })
      .eq('id', user.id);

    if (error) throw error;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bbsflooring.ca';
    const resetUrl = `${siteUrl}/reset-password?token=${token}`;

    const html = `
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
      <h2 style="margin:0 0 16px;font-size:20px;color:#1e293b;">Reset Your Password</h2>
      <p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${user.full_name || 'there'},</p>
      <p style="font-size:15px;color:#334155;line-height:1.6;">We received a request to reset your BBS Flooring account password. Click the button below to choose a new password:</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${resetUrl}" style="display:inline-block;background:#f59e0b;color:#1e293b;font-weight:700;padding:16px 40px;border-radius:12px;text-decoration:none;font-size:16px;">Reset My Password</a>
      </div>
      <p style="font-size:13px;color:#94a3b8;">This link expires in 2 hours. If you didn't request a password reset, you can safely ignore this email — your password won't change.</p>
      <p style="font-size:12px;color:#cbd5e1;margin-top:16px;">Or copy this link: ${resetUrl}</p>
    </div>
    <div style="text-align:center;padding:16px;color:#94a3b8;font-size:12px;">
      <p>BBS Flooring · 6061 Highway 7, Unit B · Markham, ON L3P 3B2</p>
      <p>(647) 428-1111 · <a href="https://bbsflooring.ca" style="color:#f59e0b;">bbsflooring.ca</a></p>
    </div>
  </div>
</body>
</html>`;

    await sendEmail({
      to: user.email,
      subject: 'Reset your password — BBS Flooring',
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ success: true }); // Don't leak errors
  }
}
