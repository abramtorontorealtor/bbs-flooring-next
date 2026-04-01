import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, error: 'No token provided' }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    // Find user by verification token
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('verification_token', token)
      .single();

    if (findError || !user) {
      return NextResponse.json({ success: false, error: 'Invalid or expired verification link.' });
    }

    // Check token expiry (48 hours)
    if (user.verification_token_expires) {
      const expires = new Date(user.verification_token_expires);
      if (expires < new Date()) {
        return NextResponse.json({ success: false, error: 'Verification link has expired. Please request a new one.' });
      }
    }

    // Mark user as verified
    const { error: updateError } = await supabase
      .from('users')
      .update({
        is_verified: true,
        verification_token: null,
        verification_token_expires: null,
        verified_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
