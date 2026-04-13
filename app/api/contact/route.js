import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import {
  sendContactAdminNotification,
  sendContactCustomerConfirmation,
  sendRemovalEstimateCustomerConfirmation,
  sendRemovalEstimateAdminNotification,
} from '@/lib/email';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

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
    const { name, email, phone, message, source, smsConsent } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
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
        sendContactAdminNotification({ name, email, phone, message, source }),
        sendContactCustomerConfirmation({ name, email }),
      ];
    }

    // Send email notifications (non-blocking — don't fail the form if email fails)
    Promise.allSettled(emailPromises).then(results => {
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
