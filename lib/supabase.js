import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Browser client (singleton) — uses @supabase/ssr so auth tokens are stored
// in cookies (not just localStorage). This is REQUIRED for the Next.js
// middleware to see the auth session on server-side route protection.
let browserClient = null;

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase env vars missing — using placeholder');
    return null;
  }
  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}

// Server client — anon key, subject to RLS (for read-only public queries)
export function getSupabaseServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase env vars missing — using placeholder');
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Admin client — service role key, BYPASSES RLS
// Use for ALL server-side mutations (API routes, webhooks, cron jobs)
// NEVER expose to client-side code
let adminClient = null;

export function getSupabaseAdminClient() {
  if (adminClient) return adminClient;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Supabase admin env vars missing — falling back to anon key');
    return getSupabaseServerClient();
  }
  adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return adminClient;
}

// Default export for convenience
export const supabase = typeof window !== 'undefined'
  ? getSupabaseBrowserClient()
  : null;
