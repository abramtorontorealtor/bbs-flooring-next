import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Browser client (singleton)
let browserClient = null;

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase env vars missing — using placeholder');
    return null;
  }
  browserClient = createClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}

// Server client (new instance per request)
export function getSupabaseServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase env vars missing — using placeholder');
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Default export for convenience
export const supabase = typeof window !== 'undefined'
  ? getSupabaseBrowserClient()
  : null;
