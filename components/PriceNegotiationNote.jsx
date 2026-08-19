'use client';

import Link from 'next/link';

const TEL_URL = 'tel:6474281111';
const PHONE_DISPLAY = '(647) 428-1111';

/**
 * Compact, phone-first negotiation "door" shown directly under the PDP price.
 * Thumb-visible on mobile (no fold). Frames the $1-margin price as an anchor a
 * buyer can improve by calling — "earn a better price", never "prices are soft".
 *
 * tier:
 *   'standard'  → beat-any-written-quote (commodity / priced SKUs)   [default]
 *   'contractor'→ call-for-volume-rate  (big-job / contractor intent)
 * Both render together on standard priced products (contractor line is secondary).
 */
export default function PriceNegotiationNote({ tier = 'standard', className = '' }) {
  return (
    <div className={`mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 ${className}`}>
      <p className="text-sm font-semibold text-slate-800 leading-snug">
        <span aria-hidden="true">🏷️ </span>
        Found it cheaper? We&apos;ll beat any written quote.
      </p>
      <p className="text-xs text-slate-600 leading-snug mt-0.5">
        Contractor or big job? Call for your volume rate.
      </p>
      <a
        href={TEL_URL}
        className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-bold text-amber-700 hover:text-amber-800 transition-colors"
      >
        📞 Call {PHONE_DISPLAY}
      </a>
      <span className="text-xs text-slate-400"> · </span>
      <Link
        href="/price-match"
        className="text-xs text-slate-500 hover:text-amber-600 underline transition-colors"
      >
        Best Price Guarantee
      </Link>
    </div>
  );
}
