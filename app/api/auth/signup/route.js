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
    const { email, password, full_name, phone } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    // Create user with admin API — email_confirm: false so the user must
    // verify via our branded SendGrid email before they can sign in.
    // admin.createUser does NOT trigger Supabase's default confirmation email
    // regardless of email_confirm value — only client signUp() does that.
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // User must verify via our branded email
      user_metadata: { full_name, phone },
    });

    if (authError) {
      if (authError.message?.includes('already been registered') || authError.message?.includes('already exists')) {
        return NextResponse.json({ error: 'An account with this email already exists. Try logging in instead.' }, { status: 409 });
      }
      console.error('[Signup] Auth error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // Generate verification token for our branded email
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    // Insert into users table
    await supabase.from('users').upsert({
      id: userId,
      email,
      full_name,
      phone,
      role: 'member',
      is_verified: false,
      verification_token: token,
      verification_token_expires: expires.toISOString(),
    }, { onConflict: 'id' });

    // Send branded verification email
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bbsflooring.ca';
    const verifyUrl = `${siteUrl}/verify-email?token=${token}`;

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
      <h2 style="margin:0 0 16px;font-size:20px;color:#1e293b;">Verify Your Email</h2>
      <p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${full_name || 'there'},</p>
      <p style="font-size:15px;color:#334155;line-height:1.6;">Thanks for creating your BBS Flooring account. Click the button below to verify your email and unlock member pricing:</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${verifyUrl}" style="display:inline-block;background:#f59e0b;color:#1e293b;font-weight:700;padding:16px 40px;border-radius:12px;text-decoration:none;font-size:16px;">✓ Verify My Email</a>
      </div>
      <p style="font-size:13px;color:#94a3b8;">This link expires in 48 hours. If you didn't create an account, you can safely ignore this email.</p>
      <p style="font-size:12px;color:#cbd5e1;margin-top:16px;">Or copy this link: ${verifyUrl}</p>
    </div>
    <div style="text-align:center;padding:16px;color:#94a3b8;font-size:12px;">
      <p>BBS Flooring · 6061 Highway 7, Unit B · Markham, ON L3P 3B2</p>
      <p>(647) 428-1111 · <a href="https://bbsflooring.ca" style="color:#f59e0b;">bbsflooring.ca</a></p>
    </div>
  </div>
</body>
</html>`;

    sendEmail({ to: email, subject: 'Verify your email — BBS Flooring', html }).catch(() => {});

    // Also notify admin
    sendEmail({
      to: 'info@bbsflooring.ca',
      subject: `New signup: ${full_name || email}`,
      html: `<p>New BBS Flooring account created:</p><ul><li>Name: ${full_name}</li><li>Email: ${email}</li><li>Phone: ${phone || 'N/A'}</li></ul>`,
    }).catch(() => {});

    return NextResponse.json({ user: { id: userId } });
  } catch (error) {
    console.error('[Signup] Error:', error);
    return NextResponse.json({ error: 'Signup failed. Please try again.' }, { status: 500 });
  }
}
