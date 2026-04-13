import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { sendContactAdminNotification, sendContractorCustomerConfirmation } from '@/lib/email';

export async function POST(request) {
  try {
    const body = await request.json();
    const { company_name, contact_name, phone, email, trade_type, monthly_volume, message } = body;

    if (!contact_name || !email || !phone) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    const detailMessage = [
      `Company: ${company_name || 'N/A'}`,
      `Trade: ${trade_type || 'N/A'}`,
      `Monthly Volume: ${monthly_volume || 'N/A'}`,
      message ? `Message: ${message}` : '',
    ].filter(Boolean).join('\n');

    const { error } = await supabase
      .from('contact_leads')
      .insert({
        customer_name: contact_name,
        customer_email: email,
        customer_phone: phone,
        name: contact_name,
        email,
        phone,
        message: detailMessage,
        source: 'contractor_registration',
        status: 'new',
        lead_status: 'new',
        metadata: { company_name: company_name || null, trade_type: trade_type || null, monthly_volume: monthly_volume || null },
      });

    if (error) throw error;

    // Send emails (non-blocking — don't fail the form if email fails)
    Promise.allSettled([
      sendContactAdminNotification({
        name: `[CONTRACTOR] ${contact_name} — ${company_name || 'No company'}`,
        email,
        phone,
        message: `Trade: ${trade_type}\nVolume: ${monthly_volume}\n${message || ''}`,
        source: 'contractor_registration',
      }),
      sendContractorCustomerConfirmation({ name: contact_name, email, company_name }),
    ]).then(results => {
      results.forEach((r, i) => {
        if (r.status === 'rejected' || (r.value && !r.value.success)) {
          console.warn(`[Contractor] Email ${i} failed:`, r.reason || r.value);
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contractor registration error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
