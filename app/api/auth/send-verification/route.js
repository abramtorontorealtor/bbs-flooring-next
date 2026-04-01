import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import crypto from 'crypto';

function getSupabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    { cookies: { getAll: () => cookieStore.getAll() } }
  );
}

export async function POST(request) {
  try {
    const { userId, userEmail, userName } = await request.json();

    if (!userId || !userEmail) {
      return NextResponse.json({ success: false, error: 'Missing user details' }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    // Save token to user record
    const { error } = await supabase
      .from('users')
      .update({
        verification_token: token,
        verification_token_expires: expires.toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;

    // TODO: Send verification email via SendGrid
    // const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email?token=${token}`;
    console.log('Verification email requested:', { userEmail, userName, token: token.substring(0, 8) + '...' });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
