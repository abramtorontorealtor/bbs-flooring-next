'use client';

import Link from 'next/link';

/**
 * Slim store-wide "Best Price Guarantee" negotiation bar for listing/grid pages
 * (category, brand, city-product grids). ONE instance under the grid header —
 * catches comparison-shoppers at the price-scanning moment before they bounce.
 * Phone-first (calls > forms). Reuses the PDP negotiation-door voice. Reversible.
 */
export default function GridPriceMatchBar({ className = '' }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm ${className}`}
    >
      <span className="font-semibold text-slate-800">
        <span aria-hidden="true">🏷️ </span>Best Price Guarantee.
      </span>
      <span className="text-slate-600">
        Found it cheaper locally? We&apos;ll beat any written quote.
      </span>
      <a
        href="tel:6474281111"
        className="inline-flex items-center gap-1 font-bold text-amber-700 hover:text-amber-800 transition-colors"
      >
        📞 Call (647) 428-1111
      </a>
      <Link
        href="/price-match"
        className="text-xs text-slate-500 underline hover:text-amber-600 transition-colors"
      >
        Details
      </Link>
    </div>
  );
}
