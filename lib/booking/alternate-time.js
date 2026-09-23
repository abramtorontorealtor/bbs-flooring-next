/**
 * Phase B, B4: "Ask for a different time" callback request. Pure, client-safe.
 * Posts to the existing /api/contact (spam filter, rate limit, CRM, email + Telegram alerts),
 * source `measurement_alternate_time`. It is a REQUEST, not an appointment: no booking row, no
 * calendar event, no appointment conversion. Success is shown only on the server's persistence
 * receipt (`saved:true`).
 */
export const ALTERNATE_SOURCE = 'measurement_alternate_time';

export const ALTERNATE_COPY = Object.freeze({
  title: 'Ask for a different time',
  intro: "Tell us when suits you and we'll call to find a time. This sends a request; it doesn't book an appointment.",
  prefsLabel: 'Preferred days and times *',
  prefsPlaceholder: 'e.g. weekday evenings after 6, or Saturday morning',
  submit: 'Send my request',
  sending: 'Sending…',
  received: "Request received. We'll call you to arrange a time. No appointment has been booked yet.",
  retry: "We couldn't send your request. Please try again, or call (647) 428-1111.",
  unconfirmed: "We couldn't confirm your request was saved. Please call (647) 428-1111 so we don't miss you.",
});

const clean = (s, max = 300) => String(s ?? '').replace(/[\u0000-\u001f]+/g, ' ').trim().slice(0, max);

/**
 * @param f        { name, phone, email?, preferences }
 * @param context  { postalCode?, projectType?, serviceInterest?, flooringInterests?[], products?,
 *                   productName?, quoteSummary?, page?, triedDate? }
 */
export function buildAlternateTimeRequest(f = {}, context = {}) {
  const name = clean(f.name, 120);
  const phone = clean(f.phone, 40);
  const email = clean(f.email, 200);
  const prefs = clean(f.preferences, 500);
  if (!name) return { ok: false, error: 'Please enter your name.' };
  if (phone.replace(/\D/g, '').length < 10) return { ok: false, error: 'Please enter a phone number we can call.' };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, error: 'Please check your email address.' };
  if (!prefs) return { ok: false, error: 'Please tell us which days and times suit you.' };
  const lines = [
    'MEASUREMENT: ALTERNATE TIME REQUEST (no appointment booked)',
    `Preferred days/times: ${prefs}`,
    context.triedDate && `Date they were looking at: ${clean(context.triedDate, 20)}`,
    context.postalCode && `Postal code: ${clean(context.postalCode, 12)}`,
    context.projectType && `Project: ${clean(context.projectType, 80)}`,
    context.serviceInterest && `Service: ${clean(context.serviceInterest, 80)}`,
    Array.isArray(context.flooringInterests) && context.flooringInterests.length && `Interested in: ${context.flooringInterests.map((x) => clean(x, 40)).join(', ')}`,
    context.products && `Products: ${clean(context.products, 200)}`,
    context.productName && `Quote product: ${clean(context.productName, 120)}`,
    context.quoteSummary && `Quote: ${clean(context.quoteSummary, 200)}`,
    context.page && `Page: ${clean(context.page, 60)}`,
  ].filter(Boolean);
  return {
    ok: true,
    body: { name, phone, ...(email && { email }), source: ALTERNATE_SOURCE, message: lines.join('\n') },
  };
}

/** Map the /api/contact answer to the panel outcome. Only saved:true counts as received. */
export function interpretAlternateResponse(status, body) {
  if (status === 200 && body?.success === true && body?.saved === true) return { kind: 'received', message: ALTERNATE_COPY.received };
  if (status === 200 && body?.success === true) return { kind: 'unconfirmed', message: ALTERNATE_COPY.unconfirmed };
  if (status === 400 && body?.error) return { kind: 'invalid', message: body.error };
  return { kind: 'retry', message: ALTERNATE_COPY.retry };
}
