import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { sendFollowUpEmail } from '@/lib/email';

/**
 * POST /api/admin/send-followup
 * 
 * Admin-only: Send a follow-up email to a lead and log it in lead_follow_ups.
 * 
 * Body: {
 *   leadId: UUID,
 *   leadSource: 'quote' | 'saved_quote' | 'contact' | 'booking',
 *   to: string (email),
 *   template: string (template key),
 *   customSubject?: string,
 *   customBody?: string,
 *   vars: { name, product, sqft, quote_total, address },
 *   nextFollowUpDate?: string (YYYY-MM-DD),
 *   notes?: string,
 * }
 */
export async function POST(request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const {
      leadId, leadSource, to, template,
      customSubject, customBody, vars = {},
      nextFollowUpDate, notes,
    } = body;

    // Validate required fields
    if (!leadId || !leadSource || !to || !template) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: leadId, leadSource, to, template' },
        { status: 400 }
      );
    }

    if (!['quote', 'saved_quote', 'contact', 'booking'].includes(leadSource)) {
      return NextResponse.json(
        { success: false, error: 'Invalid leadSource' },
        { status: 400 }
      );
    }

    // Send the email
    const emailResult = await sendFollowUpEmail({
      to,
      template,
      vars,
      customSubject: customSubject || undefined,
      customBody: customBody || undefined,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: `Email failed: ${emailResult.reason || emailResult.error || 'Unknown'}` },
        { status: 500 }
      );
    }

    // Log to lead_follow_ups table
    const supabase = getSupabaseAdminClient();

    const subject = customSubject || `Follow-up: ${template.replace(/_/g, ' ')}`;

    const { error: insertError } = await supabase
      .from('lead_follow_ups')
      .insert({
        lead_id: leadId,
        lead_source: leadSource,
        method: 'email',
        template,
        subject,
        body: customBody || `Template: ${template}`,
        recipient_email: to,
        next_follow_up_date: nextFollowUpDate || null,
        sent_by: 'admin',
        notes: notes || null,
      });

    if (insertError) {
      // Email sent successfully but logging failed — don't fail the whole request
      console.error('[SendFollowup] Failed to log follow-up:', insertError);
    }

    // Update next_follow_up_date on the lead record if provided
    if (nextFollowUpDate) {
      const tableMap = {
        quote: 'quotes',
        saved_quote: 'saved_quotes',
        contact: 'contact_leads',
        booking: 'bookings',
      };
      const tableName = tableMap[leadSource];

      const { error: updateError } = await supabase
        .from(tableName)
        .update({ next_follow_up_date: nextFollowUpDate })
        .eq('id', leadId);

      if (updateError) {
        console.error(`[SendFollowup] Failed to update ${tableName}.next_follow_up_date:`, updateError);
      }
    }

    return NextResponse.json({ success: true, emailSent: true });
  } catch (err) {
    console.error('[SendFollowup] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/send-followup?leadId=xxx&leadSource=quote
 * 
 * Fetch follow-up history for a specific lead.
 */
export async function GET(request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');
    const leadSource = searchParams.get('leadSource');

    if (!leadId || !leadSource) {
      return NextResponse.json(
        { success: false, error: 'Missing leadId or leadSource' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();

    const { data: followUps, error: fetchError } = await supabase
      .from('lead_follow_ups')
      .select('*')
      .eq('lead_id', leadId)
      .eq('lead_source', leadSource)
      .order('sent_at', { ascending: false });

    if (fetchError) throw fetchError;

    return NextResponse.json({ success: true, followUps: followUps || [] });
  } catch (err) {
    console.error('[SendFollowup] GET Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch follow-ups' },
      { status: 500 }
    );
  }
}
