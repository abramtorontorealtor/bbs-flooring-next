/**
 * POST /api/contact core (Phase B, B4). Same behaviour as before, plus:
 *  - persistence receipt `saved:true` (+ id) only when the contact_leads row was written;
 *  - identifyVisitor failure after the insert is non-fatal (was a 500 → duplicate resubmits);
 *  - 503 when no DB client; generic 500 text (no raw DB error to the browser).
 * deps: { getSupabase, checkRateLimit, getClientIP, detectSpamLead, getVisitorIdFromRequest,
 *         identifyVisitor, email:{send…}, sendTelegramAlert, formatContactAlert, logger }
 * Returns { status, body, headers? }.
 */
// Rate limit: 5 contact submissions per IP per 15 minutes
export const CONTACT_RATE_LIMIT = { maxRequests: 5, windowMs: 15 * 60 * 1000 };
const json = (body, { status = 200, headers } = {}) => ({ status, body, ...(headers && { headers }) });

/**
 * Optional post-save side effects run under a wall-clock budget, so a never-settling identity link,
 * email provider or Telegram call cannot hold the saved-lead receipt until the platform timeout.
 * Work still in flight after the budget is abandoned (not awaited), same pattern as the booking
 * lifecycle's bounded side effects. Budgets are injectable for tests (deps.budgets).
 */
export const CONTACT_SIDE_EFFECT_BUDGETS = Object.freeze({ identifyMs: 1000, emailMs: 2500, telegramMs: 1500 });
function within(promiseOrFn, ms) {
  let t;
  const work = Promise.resolve().then(() => (typeof promiseOrFn === 'function' ? promiseOrFn() : promiseOrFn));
  const timeout = new Promise((resolve) => { t = setTimeout(() => resolve({ timedOut: true }), ms); });
  return Promise.race([work.then((v) => ({ value: v }), (e) => ({ error: e })), timeout]).finally(() => clearTimeout(t));
}

export async function handleContact(request, deps) {
  const B = { ...CONTACT_SIDE_EFFECT_BUDGETS, ...(deps.budgets || {}) };
  const { getSupabase, checkRateLimit, getClientIP, detectSpamLead, getVisitorIdFromRequest, identifyVisitor, email: mail, sendTelegramAlert, formatContactAlert } = deps;
  const log = deps.logger || console;
  try {
    // Rate limiting
    const ip = getClientIP(request);
    const limit = checkRateLimit(`contact:${ip}`, CONTACT_RATE_LIMIT);
    if (!limit.ok) {
      return json({ success: false, error: 'Too many submissions. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } });
    }

    let body;
    try { body = await request.json(); } catch { body = null; }
    if (!body || typeof body !== 'object') return json({ success: false, error: 'Invalid request' }, { status: 400 });
    const { name, email, phone, message, source, smsConsent, honeypot, company } = body;

    // Require a name plus at least one contact channel. PDP quote leads are
    // phone-first (email optional); other forms remain email-based.
    if (!name || (!email && !phone)) {
      return json(
        { success: false, error: 'Name and a phone number or email are required' },
        { status: 400 }
      );
    }

    // Silent spam filter — bot submissions get a fake 200 (so they don't adapt)
    // but are never written to the CRM, emailed, or Telegram-alerted.
    // `company` is the hidden honeypot field name used in the forms.
    const spam = detectSpamLead({ name, email, phone, message, honeypot: honeypot || company });
    if (spam.spam) {
      log.warn?.(`[Contact] Dropped spam lead (${spam.reason}):`, { source });
      // Fake 200 so bots don't adapt, but NO persistence receipt (`saved`): the B4 alternate-time
      // panel only shows 'request received' on saved:true (a rare false positive sees 'please call').
      return json({ success: true });
    }

    const supabase = getSupabase();
    if (!supabase) return json({ success: false, error: 'We could not send your message right now. Please call us at (647) 428-1111.' }, { status: 503 });
    const visitorId = getVisitorIdFromRequest(request, body);

    // Save to contact_leads table (write to both column sets for CRM compatibility)
    const { data: savedRow, error } = await supabase
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
        visitor_id: visitorId,
      })
      .select('id')
      .maybeSingle();

    if (error) throw error;

    // Identity linking is optional: the lead is already saved, so a failure here must never turn
    // into a 500 (which would make the customer resubmit and create a duplicate lead).
    const idr = await within(() => identifyVisitor(supabase, { visitorId, email, phone, name, source: 'contact' }), B.identifyMs);
    if (idr.timedOut) log.warn?.('[Contact] identifyVisitor timed out (lead already saved)');
    else if (idr.error) log.warn?.('[Contact] identifyVisitor failed (lead already saved):', idr.error?.message || idr.error);

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
        mail.sendRemovalEstimateAdminNotification({ name, email, phone, removalType, sqft, haulAway, total, source }),
        mail.sendRemovalEstimateCustomerConfirmation({ name, email, removalType, sqft, haulAway, total }),
      ];
    } else {
      emailPromises = [
        mail.sendContactAdminNotification({ name, email, phone, message, source, smsConsent }),
        // Phone-first PDP quote leads may have no email — skip the customer confirmation then.
        ...(email ? [mail.sendContactCustomerConfirmation({ name, email })] : []),
      ];
    }

    // Send email notifications — AWAIT so the serverless function doesn't terminate
    // before Brevo responds (unawaited promises get dropped on Vercel). Never fails the form.
    const er = await within(Promise.allSettled(emailPromises), B.emailMs);
    if (er.timedOut) log.warn?.('[Contact] Email send timed out (lead already saved)');
    else if (er.error) log.error?.('[Contact] Email send error:', er.error?.message);
    else (er.value || []).forEach((r, i) => {
      if (r.status === 'rejected' || (r.value && !r.value.success)) log.warn?.(`[Contact] Email ${i} failed:`, r.reason || r.value);
    });

    // Fire Telegram alert — AWAIT so the serverless function doesn't terminate
    // before the fetch completes (unawaited promises get killed on Vercel).
    const tr = await within(() => sendTelegramAlert(formatContactAlert({ name, email, phone, message, source, smsConsent })), B.telegramMs);
    if (tr.timedOut) log.warn?.('[Contact] Telegram alert timed out (lead already saved)');
    else if (tr.error) log.error?.('[Contact] Telegram alert failed:', tr.error?.message);

    // Persistence receipt: the lead row exists (B4 relies on this, not on success alone).
    return json({ success: true, saved: true, ...(savedRow?.id && { id: savedRow.id }) });
  } catch (error) {
    log.error('Contact form error:', error);
    return json({ success: false, error: 'We could not send your message. Please try again or call us at (647) 428-1111.' }, { status: 500 });
  }
}
