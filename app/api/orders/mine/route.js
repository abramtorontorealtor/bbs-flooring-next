import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Get authenticated user from session cookies
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Use admin client to fetch orders by email (bypasses RLS)
    const admin = getSupabaseAdminClient();

    // Get the user's email from public.users table too (belt + suspenders)
    const { data: profile } = await admin
      .from('users')
      .select('email')
      .eq('id', user.id)
      .single();

    const email = profile?.email || user.email;
    if (!email) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 });
    }

    const { data: orders, error } = await admin
      .from('orders')
      .select('id, order_number, status, payment_status, payment_method, items, subtotal, tax, delivery_fee, processing_fee, total, delivery_preference, shipping_city, pickup_address, created_at, updated_at')
      .eq('customer_email', email)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ orders: orders || [] });
  } catch (error) {
    console.error('My orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
