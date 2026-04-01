/**
 * API Route Authentication Helpers
 * 
 * Usage in API routes:
 *   import { requireAdmin, requireAuth, getSessionUser } from '@/lib/api-auth';
 * 
 *   // Admin-only route:
 *   const { user, error } = await requireAdmin(request);
 *   if (error) return error; // Returns NextResponse with 401/403
 *
 *   // Any authenticated user:
 *   const { user, error } = await requireAuth(request);
 *   if (error) return error;
 *
 *   // Optional auth (no error if unauthenticated):
 *   const user = await getSessionUser(request);
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseAdminClient } from './supabase';

/**
 * Get the authenticated Supabase user from the request cookies.
 * Returns null if not authenticated.
 */
export async function getSessionUser() {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      { cookies: { getAll: () => cookieStore.getAll() } }
    );

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

/**
 * Require any authenticated user. Returns { user } or { error: NextResponse }.
 */
export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }
  return { user, error: null };
}

/**
 * Require admin role. Returns { user, profile } or { error: NextResponse }.
 * Checks the public.users table for role = 'admin'.
 */
export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) {
    return {
      user: null,
      profile: null,
      error: NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  // Check admin role in public.users table (use admin client to bypass RLS)
  const adminSupabase = getSupabaseAdminClient();
  const { data: profile } = await adminSupabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return {
      user,
      profile,
      error: NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      ),
    };
  }

  return { user, profile, error: null };
}
