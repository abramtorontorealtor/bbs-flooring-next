import Link from 'next/link';

/**
 * FloorFinderCTA — the "help me choose" escape hatch for the overwhelmed shopper.
 *
 * Choice-overload killer: a customer staring at 600+ SKUs needs a guided path,
 * not more filters. This surfaces the 5-question Find My Floor finder right at
 * the top of the product grid (it was previously buried in the Services submenu).
 *
 * Pure server component (a plain link) — zero JS, stays in the SSR payload.
 *
 * @param {string} [context] Optional category label to personalize the copy.
 */
export default function FloorFinderCTA({ context }) {
  const line = context
    ? `Not sure which ${context.toLowerCase()} is right for your space?`
    : 'Not sure which floor is right for your space?';

  return (
    <Link
      href="/floor-finder"
      className="group flex items-center gap-3 sm:gap-4 bg-gradient-to-r from-amber-50 to-white border border-amber-200 hover:border-amber-300 hover:from-amber-100 rounded-xl px-4 sm:px-5 py-3 mb-4 transition-all"
    >
      <span className="text-2xl sm:text-3xl shrink-0" aria-hidden="true">🧭</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 text-sm sm:text-base leading-tight">
          {line}
        </p>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Find your floor in 60 seconds — 5 quick questions, 3 real matches from our in-stock floors.
        </p>
      </div>
      <span className="shrink-0 inline-flex items-center gap-1 bg-amber-500 group-hover:bg-amber-400 text-slate-900 font-bold text-xs sm:text-sm px-3.5 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
        Find my floor
        <span className="transition-transform group-hover:translate-x-0.5" aria-hidden="true">→</span>
      </span>
    </Link>
  );
}
