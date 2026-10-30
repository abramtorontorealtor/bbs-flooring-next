import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { sendContactAdminNotification, sendContractorCustomerConfirmation } from '@/lib/email';
import { sendTelegramAlert, formatContractorAlert } from '@/lib/telegram';
import { getVisitorIdFromRequest, identifyVisitor } from '@/lib/identify';
import { buildLeadContext } from '@/lib/leadContext';

export async function POST(request) {
  try {
    const body = await request.json();
    const { company_name, contact_name, phone, email, trade_type, monthly_volume, message } = body;

    if (!contact_name || !email || !phone) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const visitorId = getVisitorIdFromRequest(request, body);

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
        visitor_id: visitorId,
      });

    if (error) throw error;

    // Auto-flag an existing site account as trade. Guarded to role 'member' so admin/trade are never touched.
    let tradeFlagged = false;
    try {
      const { data: flagged, error: flagErr } = await supabase
        .from('users')
        .update({ role: 'trade', company_name: company_name || null })
        .eq('email', String(email).trim().toLowerCase())
        .eq('role', 'member')
        .select('id');
      if (flagErr) throw flagErr;
      tradeFlagged = Array.isArray(flagged) && flagged.length > 0;
    } catch (e) {
      console.error('[Contractor] trade flag failed:', e?.message);
    }

    await identifyVisitor(supabase, {
      visitorId,
      email,
      phone,
      name: contact_name,
      source: 'contractor',
    });

    // Lead-context enrichment (bounded; null on failure → alerts send as before).
    let leadContext = null;
    try {
      const sessionId = typeof body.session_id === 'string' && body.session_id.length <= 128 ? body.session_id : null;
      leadContext = await buildLeadContext(supabase, { email, phone, name: contact_name, session_id: sessionId, visitor_id: visitorId }, { budgetMs: 1200 });
    } catch (e) {
      console.warn('[Contractor] lead context skipped:', e?.message);
    }

    // Send emails — AWAIT so the serverless function doesn't terminate before Brevo responds.
    try {
      const emailResults = await Promise.allSettled([
        sendContactAdminNotification({
          name: `[CONTRACTOR] ${contact_name} — ${company_name || 'No company'}`,
          email,
          phone,
          message: `Trade: ${trade_type}\nVolume: ${monthly_volume}\n${message || ''}`,
          source: 'contractor_registration',
          leadContext,
        }),
        sendContractorCustomerConfirmation({ name: contact_name, email, company_name }),
      ]);
      emailResults.forEach((r, i) => {
        if (r.status === 'rejected' || (r.value && !r.value.success)) {
          console.warn(`[Contractor] Email ${i} failed:`, r.reason || r.value);
        }
      });
    } catch (e) {
      console.error('[Contractor] Email send error:', e?.message);
    }

    // Fire Telegram alert — AWAIT so the serverless function doesn't terminate first.
    try {
      await sendTelegramAlert(formatContractorAlert({ contact_name, email, phone, company_name, trade_type, monthly_volume, message }, leadContext));
    } catch (e) {
      console.error('[Contractor] Telegram alert failed:', e?.message);
    }

    return NextResponse.json({ success: true, trade_flagged: tradeFlagged });
  } catch (error) {
    console.error('Contractor registration error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
