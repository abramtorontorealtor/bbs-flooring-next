import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ success: false, error: 'Token and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    // Find user by reset token
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, email, reset_token_expires')
      .eq('reset_token', token)
      .single();

    if (findError || !user) {
      return NextResponse.json({ success: false, error: 'Invalid or expired reset link. Please request a new one.' }, { status: 400 });
    }

    // Check expiry
    if (new Date(user.reset_token_expires) < new Date()) {
      return NextResponse.json({ success: false, error: 'This reset link has expired. Please request a new one.' }, { status: 400 });
    }

    // Update password via Supabase Admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password,
    });

    if (updateError) {
      console.error('[Reset] Password update failed:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to update password. Please try again.' }, { status: 500 });
    }

    // Clear the reset token
    await supabase
      .from('users')
      .update({ reset_token: null, reset_token_expires: null })
      .eq('id', user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset password confirm error:', error);
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}

// GET: verify token is valid (so the page can show the form vs error)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ valid: false, error: 'No token provided' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('id, reset_token_expires')
      .eq('reset_token', token)
      .single();

    if (error || !user) {
      return NextResponse.json({ valid: false, error: 'Invalid reset link' });
    }

    if (new Date(user.reset_token_expires) < new Date()) {
      return NextResponse.json({ valid: false, error: 'This reset link has expired' });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    return NextResponse.json({ valid: false, error: 'Something went wrong' });
  }
}
