import Link from 'next/link';

/**
 * CategoryShopBar — SSR shop-intent + trust bar for category pages.
 *
 * Surfaces the shopping action and kills the "do I have to drive to Markham?"
 * objection by making buy-online / delivery / measurement / call signals
 * explicit and immediate — right under the H1, above the product grid.
 *
 * Pure server component (no interactivity), so it stays in the SSR payload
 * and adds zero JS. The product grid below remains the primary CTA.
 *
 * @param {string} count   Product count to show (e.g. "100+")
 * @param {string} low     Lowest price per sqft (e.g. "1.99")
 * @param {string} label   Category label (e.g. "Vinyl Flooring")
 */
export default function CategoryShopBar({ count, low, label }) {
  return (
    <div className="mb-8">
      {/* Shop-now action bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white border border-slate-200 rounded-2xl shadow-sm px-5 py-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            Shop {label} Online
          </p>
          <p className="text-slate-800 font-bold text-lg leading-tight">
            {count ? `${count} styles in stock` : 'Browse our full collection'}
            {low ? <> · from <span className="text-amber-600">${low}/sqft</span></> : null}
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <a
            href="#shop"
            className="flex-1 sm:flex-none text-center bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-xl text-sm transition-colors whitespace-nowrap"
          >
            ↓ Shop Now
          </a>
          <a
            href="tel:+16474281111"
            className="flex-1 sm:flex-none text-center bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors whitespace-nowrap"
          >
            📞 (647) 428-1111
          </a>
        </div>
      </div>

      {/* Trust strip — kills the "drive to Markham" objection */}
      <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1.5">🛒 <strong className="font-semibold text-slate-700">Buy online</strong></span>
        <span className="inline-flex items-center gap-1.5">🚚 <span>GTA delivery</span></span>
        <span className="inline-flex items-center gap-1.5">📏 <span>Free in-home measurement</span></span>
        <span className="inline-flex items-center gap-1.5">🏬 <span>Markham showroom</span></span>
      </div>
    </div>
  );
}
