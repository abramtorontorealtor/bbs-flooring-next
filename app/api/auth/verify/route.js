import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, error: 'No token provided' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

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

    return NextResponse.json({
      success: true,
      userId: user.id,
      userEmail: user.email,
      userName: user.full_name,
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
