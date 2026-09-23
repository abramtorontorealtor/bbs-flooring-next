import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { getSupabaseAdminClient, getServiceClientOrNull } from '@/lib/supabase';
import { handleSendFollowup } from '@/lib/followup/send-followup';
import { sendFollowUpEmail } from '@/lib/email';

/**
 * POST /api/admin/send-followup
 *
 * Admin-only: send a follow-up email to a lead (unless skipEmail) and log it in
 * lead_follow_ups. Logic + response semantics: lib/followup/send-followup.js.
 * A log-only call that could not write its log (or next_follow_up_date) returns
 * success:false; a sent email is never reported as failed (no accidental resend).
 */
export async function POST(request) {
  const r = await handleSendFollowup(request, {
    requireAdmin,
    getSupabase: getServiceClientOrNull,
    sendFollowUpEmail,
    logger: console,
  });
  if (r.passthrough) return r.passthrough;
  return NextResponse.json(r.body, { status: r.status });
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
