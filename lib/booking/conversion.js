/**
 * Booking conversion tracking (red-team R3). Pure/client-safe, no imports.
 * Optional analytics must NEVER undo a persisted booking in the UI: the caller commits
 * success state first, then calls this. Each vendor call is type-guarded and isolated,
 * so a missing, non-callable or throwing gtag/fbq cannot stop the other vendors and
 * cannot throw back into the submit handler.
 *
 * kind: 'free_measurement' | 'quote_booking'; extra: { quoteValue?, productName? }
 * Returns the list of events attempted { vendor, event, ok } (for tests / debugging).
 */
export const ADS_SEND_TO = 'AW-700910775/PQ1CCNmSn7ocELeZnM4C';

export function trackBookingConversion(win, kind, { quoteValue, productName } = {}) {
  const out = [];
  const attempt = (vendor, event, fn) => {
    try { fn(); out.push({ vendor, event, ok: true }); } catch { out.push({ vendor, event, ok: false }); }
  };
  if (!win) return out;
  const quote = kind === 'quote_booking';
  const gtag = typeof win.gtag === 'function' ? win.gtag : null;
  const fbq = typeof win.fbq === 'function' ? win.fbq : null;
  if (gtag) {
    attempt('ga4', 'book_appointment', () => gtag('event', 'book_appointment', {
      event_category: 'appointment',
      event_label: quote ? 'quote_booking' : 'free_measurement',
      value: 75,
      currency: 'CAD',
      ...(quote && { quote_value: quoteValue ? parseFloat(quoteValue) : undefined, product_name: productName || undefined }),
    }));
    attempt('ads', 'conversion', () => gtag('event', 'conversion', { send_to: ADS_SEND_TO, value: 75.0, currency: 'CAD' }));
  }
  if (fbq) {
    attempt('meta', 'Schedule', () => fbq('track', 'Schedule', quote
      ? { content_name: productName || 'Quote Booking', value: quoteValue ? parseFloat(quoteValue) : 0, currency: 'CAD' }
      : { content_name: 'Free Measurement' }));
  }
  return out;
}
