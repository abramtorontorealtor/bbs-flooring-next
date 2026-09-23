/**
 * CRM lead-status decisions (red-team R14, CRM writer half). Pure, client-safe (no imports).
 *
 * The CRM's generic "lead status" writer (follow-up queue ✅ Done, LeadPlaybook call
 * outcomes, the Contacted/Quoted/Booked/Completed/Lost buttons) used to write
 * `bookings.status` directly from the browser: no revision bump, no CAS, no calendar
 * sync. It could leave a booking 'quoted'/'contacted'/'booked'/'lost', which the lifecycle
 * does not own. This module splits the two concerns:
 *
 *   • Lead FOLLOW-UP OUTCOME (contacted / quoted / booked / lost / new): for a booking
 *     it is recorded in the follow-up log (`lead_follow_ups`, through the admin-only
 *     POST /api/admin/send-followup with skipEmail). That route also sets the one
 *     non-lifecycle booking field, `next_follow_up_date`, server-side. `bookings.status`
 *     is NEVER written. The existing CRM history panel already reads this log per lead.
 *   • Genuine BOOKING STATE change: only 'completed' maps to a lifecycle action
 *     (admin-action `complete`: no email, no calendar). 'confirmed' and 'cancelled'
 *     email the customer (and cancel deletes the calendar event), so they are never
 *     triggered as a side effect of logging a call. They return `explicit_action`, and
 *     the admin uses the Booking Actions buttons, which go through the lifecycle API.
 *
 * Non-booking leads (quotes / saved quotes / contact leads) keep their existing behaviour:
 * `lead_status` + extra fields on their own table. Orders never reach this writer.
 *
 * Plans returned by planLeadStatusUpdate(lead, newStatus, extraFields, opts):
 *   { kind:'entity_update', entity:'SavedQuote'|'Quote'|'ContactLead', id, updates }
 *   { kind:'booking_followup', id, outcome, log: <send-followup body>|null }
 *       log null ⇒ the caller already logged this interaction (LeadPlaybook), nothing to write
 *   { kind:'booking_lifecycle', id, action:'complete' }
 *   { kind:'explicit_action', id, outcome, message }
 *   { kind:'none', reason }
 */
export const BOOKING_LIFECYCLE_STATUSES = Object.freeze(['pending', 'confirmed', 'cancelled', 'completed']);

/** Lead-pipeline outcomes that are follow-up bookkeeping for a booking, never a booking status. */
export const BOOKING_FOLLOWUP_OUTCOMES = Object.freeze(['new', 'contacted', 'quoted', 'booked', 'lost']);

const EXPLICIT = Object.freeze({
  confirmed: 'Use "Confirm Booking" in Booking Actions (it emails the customer).',
  cancelled: 'Use "Cancel Booking" in Booking Actions (it emails the customer and removes the calendar event).',
  pending: 'Booking status was left unchanged. Reschedule or confirm from Booking Actions instead.',
});

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const label = (s) => String(s || '').replace(/_/g, ' ');

/** True when a CRM lead row is a booking (status belongs to the lifecycle service). */
export const isBookingLead = (lead) => lead?.source === 'booking';

/**
 * Body for POST /api/admin/send-followup that LOGS a booking follow-up outcome
 * (skipEmail, so no email is sent) and optionally sets next_follow_up_date.
 */
export function buildBookingFollowUpLog(lead, { outcome, nextFollowUpDate = null, method = 'note', notes = '' } = {}) {
  const what = label(outcome) || 'follow-up';
  const next = typeof nextFollowUpDate === 'string' && DATE_RE.test(nextFollowUpDate) ? nextFollowUpDate : null;
  return {
    leadId: lead.entityId,
    leadSource: 'booking',
    to: lead.email || 'no-email@logged.internal',
    template: 'general_checkin',
    customSubject: `Follow-up: ${what}`,
    customBody: `<p>Follow-up outcome: ${what}${notes ? '. ' + String(notes).slice(0, 500) : ''} (booking status unchanged)</p>`,
    vars: {},
    nextFollowUpDate: next,
    notes: notes ? String(notes).slice(0, 500) : `Follow-up outcome: ${what}`,
    skipEmail: true,
    method,
  };
}

/**
 * Decide how a CRM "mark lead as <newStatus>" request is carried out.
 * @param lead         CRM lead row ({ source, entityType, entityId, email, ... })
 * @param newStatus    requested pipeline status
 * @param extraFields  extra columns the caller wanted written (e.g. next_follow_up_date, lost_reason)
 * @param opts.alreadyLogged  the interaction was already logged via send-followup (LeadPlaybook)
 */
export function planLeadStatusUpdate(lead, newStatus, extraFields = {}, { alreadyLogged = false } = {}) {
  if (!lead || !lead.entityId) return { kind: 'none', reason: 'missing lead' };
  const status = String(newStatus || '').trim();
  if (!status) return { kind: 'none', reason: 'missing status' };

  if (!isBookingLead(lead)) {
    const updates = { ...extraFields, lead_status: status };
    if (lead.source === 'quote' && lead.entityType === 'SavedQuote') return { kind: 'entity_update', entity: 'SavedQuote', id: lead.entityId, updates };
    if (lead.source === 'quote') return { kind: 'entity_update', entity: 'Quote', id: lead.entityId, updates };
    if (lead.source === 'contact') return { kind: 'entity_update', entity: 'ContactLead', id: lead.entityId, updates };
    return { kind: 'none', reason: `status writer does not handle source ${JSON.stringify(lead.source ?? null)}` };
  }

  const id = lead.entityId;
  if (status === 'completed') return { kind: 'booking_lifecycle', id, action: 'complete' };
  if (EXPLICIT[status]) return { kind: 'explicit_action', id, outcome: status, message: EXPLICIT[status] };

  // Follow-up bookkeeping only. Unknown statuses are treated the same way: never a status write.
  const noteBits = [];
  if (extraFields?.lost_reason) noteBits.push(`reason: ${extraFields.lost_reason}`);
  const log = alreadyLogged ? null : buildBookingFollowUpLog(lead, {
    outcome: status,
    nextFollowUpDate: extraFields?.next_follow_up_date ?? null,
    notes: noteBits.join('; '),
  });
  return { kind: 'booking_followup', id, outcome: status, log };
}

/** Toast text for a completed plan (UI helper; keeps copy testable). */
export function leadStatusToast(plan) {
  switch (plan?.kind) {
    case 'entity_update': return `Lead marked as ${plan.updates.lead_status}`;
    case 'booking_followup': return `Follow-up logged (${label(plan.outcome)}). Booking status unchanged`;
    case 'booking_lifecycle': return 'Marked complete';
    case 'explicit_action': return plan.message;
    default: return null;
  }
}
