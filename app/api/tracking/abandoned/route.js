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
    const { customerName, customerEmail, customerPhone, cartItems, cartValue, pageUrl } = await request.json();

    const supabase = getSupabaseServer();

    // Log abandoned checkout for follow-up
    const { error } = await supabase
      .from('contact_leads')
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        message: `Abandoned checkout — Cart value: C$${cartValue?.toFixed(2)} — Items: ${cartItems?.map(i => i.product_name).join(', ')}`,
        source: 'abandoned_checkout',
        status: 'new',
        metadata: { cartItems, cartValue, pageUrl },
      });

    if (error) {
      console.warn('Failed to log abandoned checkout:', error);
    }

    // TODO: Send abandoned checkout email via SendGrid (with delay)

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Abandoned checkout tracking error:', error);
    return NextResponse.json({ success: true }); // Don't fail the UX
  }
}
