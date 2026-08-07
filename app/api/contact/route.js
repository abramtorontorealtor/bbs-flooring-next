import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import {
  sendContactAdminNotification,
  sendContactCustomerConfirmation,
  sendRemovalEstimateCustomerConfirmation,
  sendRemovalEstimateAdminNotification,
} from '@/lib/email';
import { sendTelegramAlert, formatContactAlert } from '@/lib/telegram';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { detectSpamLead } from '@/lib/spam-filter';

// Rate limit: 5 contact submissions per IP per 15 minutes
const RATE_LIMIT = { maxRequests: 5, windowMs: 15 * 60 * 1000 };

export async function POST(request) {
  try {
    // Rate limiting
    const ip = getClientIP(request);
    const limit = checkRateLimit(`contact:${ip}`, RATE_LIMIT);
    if (!limit.ok) {
      return NextResponse.json(
        { success: false, error: 'Too many submissions. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } }
      );
    }

    const body = await request.json();
    const { name, email, phone, message, source, smsConsent, honeypot, company } = body;

    // Require a name plus at least one contact channel. PDP quote leads are
    // phone-first (email optional); other forms remain email-based.
    if (!name || (!email && !phone)) {
      return NextResponse.json(
        { success: false, error: 'Name and a phone number or email are required' },
        { status: 400 }
      );
    }

    // Silent spam filter — bot submissions get a fake 200 (so they don't adapt)
    // but are never written to the CRM, emailed, or Telegram-alerted.
    // `company` is the hidden honeypot field name used in the forms.
    const spam = detectSpamLead({ name, email, phone, message, honeypot: honeypot || company });
    if (spam.spam) {
      console.warn(`[Contact] Dropped spam lead (${spam.reason}):`, { name, email, source });
      return NextResponse.json({ success: true });
    }

    const supabase = getSupabaseAdminClient();

    // Save to contact_leads table (write to both column sets for CRM compatibility)
    const { error } = await supabase
      .from('contact_leads')
      .insert({
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        name,
        email,
        phone,
        message,
        source: source || 'contact_form',
        status: 'new',
        lead_status: 'new',
        metadata: smsConsent != null ? { sms_consent: smsConsent } : undefined,
      });

    if (error) throw error;

    // Determine email type based on source
    const isRemovalEstimate = (source || '').includes('removal-estimator');

    let emailPromises;
    if (isRemovalEstimate) {
      // Parse removal details from message (format: "TYPE ESTIMATE — Sqft: X | Haul-Away: Yes/No (+$X) | ...Total: $X.XX CAD")
      const sqftMatch = message?.match(/Sqft:\s*(\d+)/);
      const haulMatch = message?.match(/Haul-Away:\s*(Yes|No)/i);
      const totalMatch = message?.match(/Total:\s*\$(\d+\.?\d*)/);
      const sqft = sqftMatch ? parseInt(sqftMatch[1]) : 0;
      const haulAway = haulMatch ? haulMatch[1].toLowerCase() === 'yes' : false;
      const total = totalMatch ? totalMatch[1] : '0.00';

      // Map source to human-readable removal type
      const removalTypeMap = {
        'carpet-removal-estimator': 'Carpet Removal',
        'hardwood-removal-estimator': 'Hardwood Removal',
        'tile-removal-estimator': 'Tile Removal',
        'vinyl-laminate-removal-estimator': 'Vinyl & Laminate Removal',
      };
      const removalType = removalTypeMap[source] || 'Floor Removal';

      emailPromises = [
        sendRemovalEstimateAdminNotification({ name, email, phone, removalType, sqft, haulAway, total, source }),
        sendRemovalEstimateCustomerConfirmation({ name, email, removalType, sqft, haulAway, total }),
      ];
    } else {
      emailPromises = [
        sendContactAdminNotification({ name, email, phone, message, source, smsConsent }),
        // Phone-first PDP quote leads may have no email — skip the customer confirmation then.
        ...(email ? [sendContactCustomerConfirmation({ name, email })] : []),
      ];
    }

    // Send email notifications — AWAIT so the serverless function doesn't terminate
    // before Brevo responds (unawaited promises get dropped on Vercel). Never fails the form.
    try {
      const emailResults = await Promise.allSettled(emailPromises);
      emailResults.forEach((r, i) => {
        if (r.status === 'rejected' || (r.value && !r.value.success)) {
          console.warn(`[Contact] Email ${i} failed:`, r.reason || r.value);
        }
      });
    } catch (e) {
      console.error('[Contact] Email send error:', e?.message);
    }

    // Fire Telegram alert — AWAIT so the serverless function doesn't terminate
    // before the fetch completes (unawaited promises get killed on Vercel).
    try {
      await sendTelegramAlert(formatContactAlert({ name, email, phone, message, source, smsConsent }));
    } catch (e) {
      console.error('[Contact] Telegram alert failed:', e?.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
