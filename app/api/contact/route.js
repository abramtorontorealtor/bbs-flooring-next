import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { sendContactAdminNotification, sendContactCustomerConfirmation } from '@/lib/email';

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
    const body = await request.json();
    const { name, email, phone, message, source } = body;

    const supabase = getSupabaseServer();

    // Save to contact_leads table
    const { error } = await supabase
      .from('contact_leads')
      .insert({
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        message,
        source: source || 'contact_form',
        status: 'new',
      });

    if (error) throw error;

    // Send email notifications (non-blocking — don't fail the form if email fails)
    Promise.allSettled([
      sendContactAdminNotification({ name, email, phone, message, source }),
      sendContactCustomerConfirmation({ name, email }),
    ]).then(results => {
      results.forEach((r, i) => {
        if (r.status === 'rejected' || (r.value && !r.value.success)) {
          console.warn(`[Contact] Email ${i} failed:`, r.reason || r.value);
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
