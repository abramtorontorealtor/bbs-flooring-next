/**
 * POST /api/admin/send-followup: testable handler core (fix-3, parent finding on R14).
 *
 * The CRM booking planner (lib/booking/crm-followup.js) and LeadPlaybook rely on this
 * route to RECORD booking follow-up outcomes, so a log that was not written must not
 * look like success.
 *
 * Semantics:
 *  • Log-only (skipEmail): the lead_follow_ups insert IS the operation.
 *      insert fails                  → 500 { success:false, logged:false }
 *      next_follow_up_date not saved → 500 { success:false, logged:true, nextFollowUpSaved:false }
 *        (the log exists; the error says so, so a retry is a conscious duplicate note, never an email)
 *  • Email: sending is the operation and cannot be undone. Once the email is out the
 *    response is success:true, whatever happens to the bookkeeping, so the CRM never offers
 *    a resend of an email that already went. Bookkeeping failures come back as
 *    logged:false / nextFollowUpSaved:false plus a `warning`.
 *  • No service client → 503 before any email is sent.
 *
 * deps: { requireAdmin, getSupabase, sendFollowUpEmail, logger }
 * Returns { status, body } or { passthrough } (requireAdmin error response).
 */
export const LEAD_SOURCES = Object.freeze(['quote', 'saved_quote', 'contact', 'booking']);
export const LEAD_TABLES = Object.freeze({
  quote: 'quotes', saved_quote: 'saved_quotes', contact: 'contact_leads', booking: 'bookings',
});

const json = (status, body) => ({ status, body });

export async function handleSendFollowup(request, deps) {
  const log = deps.logger || console;
  const { error: authError } = await deps.requireAdmin();
  if (authError) return { passthrough: authError };

  let body;
  try { body = await request.json(); } catch { body = null; }
  if (!body || typeof body !== 'object') return json(400, { success: false, error: 'Invalid request body' });

  const {
    leadId, leadSource, to, template, customSubject, customBody, vars = {},
    nextFollowUpDate, notes, skipEmail, method: logMethod,
  } = body;

  if (!leadId || !leadSource || !template) {
    return json(400, { success: false, error: 'Missing required fields: leadId, leadSource, template' });
  }
  if (!LEAD_SOURCES.includes(leadSource)) return json(400, { success: false, error: 'Invalid leadSource' });

  const supabase = deps.getSupabase();
  if (!supabase) {
    return json(503, { success: false, error: 'Follow-up service unavailable (database not configured)', logged: false });
  }

  try {
    // 1. Email, unless this is a call/text/note log.
    let emailSent = false;
    if (!skipEmail && to) {
      const r = await deps.sendFollowUpEmail({
        to, template, vars,
        customSubject: customSubject || undefined,
        customBody: customBody || undefined,
      });
      if (!r?.success) {
        return json(500, { success: false, error: `Email failed: ${r?.reason || r?.error || 'Unknown'}`, emailSent: false, logged: false });
      }
      emailSent = true;
    }

    // 2. Follow-up log.
    let logged = false;
    try {
      const { error: insertError } = await supabase.from('lead_follow_ups').insert({
        lead_id: leadId,
        lead_source: leadSource,
        method: logMethod || 'email',
        template,
        subject: customSubject || `Follow-up: ${String(template).replace(/_/g, ' ')}`,
        body: customBody || `Template: ${template}`,
        recipient_email: to,
        next_follow_up_date: nextFollowUpDate || null,
        sent_by: 'admin',
        notes: notes || null,
      });
      if (insertError) log.error?.('[SendFollowup] Failed to log follow-up:', insertError?.message || insertError);
      else logged = true;
    } catch (e) {
      log.error?.('[SendFollowup] Follow-up log threw:', e?.message || e);
    }

    if (!logged && !emailSent) {
      return json(500, { success: false, emailSent: false, logged: false, error: 'Could not record the follow-up. Nothing was saved; try again.' });
    }

    // 3. next_follow_up_date on the lead row (the only field this route writes there).
    let nextFollowUpSaved = null;
    if (nextFollowUpDate) {
      nextFollowUpSaved = false;
      try {
        const { data, error: updateError } = await supabase
          .from(LEAD_TABLES[leadSource])
          .update({ next_follow_up_date: nextFollowUpDate })
          .eq('id', leadId)
          .select('id');
        if (updateError) log.error?.(`[SendFollowup] next_follow_up_date update failed:`, updateError?.message || updateError);
        else if (!data || (Array.isArray(data) && data.length === 0)) log.error?.('[SendFollowup] next_follow_up_date: lead not found');
        else nextFollowUpSaved = true;
      } catch (e) {
        log.error?.('[SendFollowup] next_follow_up_date update threw:', e?.message || e);
      }
    }

    const warnings = [];
    if (!logged) warnings.push('the follow-up was not added to the history');
    if (nextFollowUpSaved === false) warnings.push('the next follow-up date was not saved');

    if (emailSent) {
      // Partial success is still success: the email is out and must not be resent.
      return json(200, {
        success: true, emailSent, logged,
        ...(nextFollowUpSaved !== null && { nextFollowUpSaved }),
        ...(warnings.length && { warning: `Email sent, but ${warnings.join(' and ')}.` }),
      });
    }
    if (nextFollowUpSaved === false) {
      return json(500, {
        success: false, emailSent: false, logged: true, nextFollowUpSaved: false,
        error: 'Follow-up logged, but the next follow-up date was not saved. Set it again (no email is sent).',
      });
    }
    return json(200, { success: true, emailSent: false, logged: true, ...(nextFollowUpSaved !== null && { nextFollowUpSaved }) });
  } catch (err) {
    log.error?.('[SendFollowup] Error:', err?.message || err);
    return json(500, { success: false, error: 'Internal server error' });
  }
}
