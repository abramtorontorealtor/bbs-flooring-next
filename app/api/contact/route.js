import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { sendContactAdminNotification, sendContactCustomerConfirmation } from '@/lib/email';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, message, source } = body;

    const supabase = getSupabaseAdminClient();

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
