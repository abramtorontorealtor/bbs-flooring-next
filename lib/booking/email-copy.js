/**
 * Pure copy builders for booking emails (Phase A, A4; PLAN item 9).
 * No imports, no network. lib/email.js renders these; tests import them directly
 * (lib/email.js itself isn't importable under node:test — extensionless imports).
 *
 * Reschedule:
 *  actor 'customer' → the new time is a REQUEST, pending confirmation; BBS will
 *                     confirm. Deliberately no response-time promise.
 *  anything else    → admin copy, unchanged from before A4 (actor absent = admin
 *                     copy, the pre-A4 behaviour).
 * Strings are plain text / trusted markup only; caller escapes nothing here
 * because nothing customer-supplied is interpolated except the formatted date.
 */
export function bookingRescheduledCopy({ actor, newDate }) {
  if (actor === 'customer') {
    return {
      pending: true,
      title: 'Your Reschedule Request Was Received',
      intro: 'We received your request to move your measurement appointment. The new time below is <strong>requested and pending confirmation</strong>. BBS Flooring will confirm it with you.',
      subject: `📅 Reschedule Requested — ${newDate} (pending confirmation)`,
    };
  }
  return {
    pending: false,
    title: 'Your Measurement Has Been Rescheduled',
    intro: 'Your measurement appointment has been rescheduled. Here are the updated details:',
    subject: `📅 Measurement Rescheduled — ${newDate}`,
  };
}
