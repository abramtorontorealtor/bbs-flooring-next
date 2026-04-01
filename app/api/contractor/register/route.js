import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { sendContactAdminNotification } from '@/lib/email';

export async function POST(request) {
  try {
    const body = await request.json();
    const { company_name, contact_name, phone, email, trade_type, monthly_volume, message } = body;

    if (!contact_name || !email || !phone) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    const { error } = await supabase
      .from('contact_leads')
      .insert({
        customer_name: contact_name,
        customer_email: email,
        customer_phone: phone,
        message: [
          `Company: ${company_name || 'N/A'}`,
          `Trade: ${trade_type || 'N/A'}`,
          `Monthly Volume: ${monthly_volume || 'N/A'}`,
          message ? `Message: ${message}` : '',
        ].filter(Boolean).join('\n'),
        source: 'contractor_registration',
        status: 'new',
      });

    if (error) throw error;

    // Admin notification (non-blocking)
    sendContactAdminNotification({
      name: `[CONTRACTOR] ${contact_name} — ${company_name || 'No company'}`,
      email,
      phone,
      message: `Trade: ${trade_type}\nVolume: ${monthly_volume}\n${message || ''}`,
      source: 'contractor_registration',
    }).catch(err => console.warn('[Contractor] Admin email failed:', err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contractor registration error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
