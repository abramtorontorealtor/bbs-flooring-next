import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET() {
  try {
    // Get the current user from the auth cookie
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { getAll: () => cookieStore.getAll() } }
    );
    const { data: { user } } = await supabaseAuth.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ bookings: [] });
    }

    // Use admin client to bypass RLS and fetch all bookings for this email
    const admin = getSupabaseAdminClient();
    const { data: bookings, error } = await admin
      .from('bookings')
      .select('id, customer_name, customer_email, customer_phone, customer_address, postal_code, preferred_date, preferred_time, flooring_type, square_footage, service_type, product_name, quote_total, notes, status, lookup_token, created_at')
      .eq('customer_email', user.email)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('[Booking/mine] Query failed:', error);
      return NextResponse.json({ bookings: [] });
    }

    return NextResponse.json({ bookings: bookings || [] });
  } catch (err) {
    console.error('[Booking/mine] Error:', err);
    return NextResponse.json({ bookings: [] });
  }
}
