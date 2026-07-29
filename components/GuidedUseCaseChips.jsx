import Link from 'next/link';

/**
 * GuidedUseCaseChips — turns passive "where it works best" copy into clickable,
 * pre-filtered entry points. Removes the "build-your-own-filter" cognitive load
 * for the overwhelmed shopper by deep-linking to grid states the URL already
 * supports (waterproof/priceMax/width/thickness/new/sale/category params handled
 * in ProductsClient.getInitialFilters).
 *
 * Pure server component (plain links) — zero JS, stays in the SSR payload.
 *
 * Chip presets per category. Each `to` is a query string appended to the grid
 * base (the /products all-catalog grid), pre-selecting filters on arrival.
 */

const PRESETS = {
  vinyl: [
    { label: '🏠 Best for Basements', to: '?category=vinyl&waterproof=true' },
    { label: '🐾 Pet & Kid Proof', to: '?category=vinyl&waterproof=true&sort=recommended' },
    { label: '💰 Budget Under $3', to: '?category=vinyl&priceMax=3' },
    { label: '✨ New Arrivals', to: '?category=vinyl&new=true' },
    { label: '🔥 On Sale', to: '?category=vinyl&sale=true' },
  ],
  laminate: [
    { label: '💪 Heavy Traffic (AC5)', to: '?category=laminate&acRating=AC5' },
    { label: '💰 Budget Under $3', to: '?category=laminate&priceMax=3' },
    { label: '💧 Waterproof Laminate', to: '?category=laminate&waterproof=true' },
    { label: '✨ New Arrivals', to: '?category=laminate&new=true' },
    { label: '🔥 On Sale', to: '?category=laminate&sale=true' },
  ],
  engineered_hardwood: [
    { label: '🌊 Wide Plank Look', to: '?category=engineered_hardwood&width=wide' },
    { label: '💰 Under $5', to: '?category=engineered_hardwood&priceMax=5' },
    { label: '👑 Premium $6+', to: '?category=engineered_hardwood&priceMin=6' },
    { label: '✨ New Arrivals', to: '?category=engineered_hardwood&new=true' },
    { label: '🔥 On Sale', to: '?category=engineered_hardwood&sale=true' },
  ],
  solid_hardwood: [
    { label: '🌊 Wide Plank Look', to: '?category=solid_hardwood&width=wide' },
    { label: '🔴 Classic Red Oak', to: '?category=solid_hardwood&species=Red Oak' },
    { label: '💰 Best Value', to: '?category=solid_hardwood&sort=price_low' },
    { label: '✨ New Arrivals', to: '?category=solid_hardwood&new=true' },
    { label: '🔥 On Sale', to: '?category=solid_hardwood&sale=true' },
  ],
  all: [
    { label: '🏠 Best for Basements', to: '?category=vinyl&waterproof=true' },
    { label: '🐾 Pet & Kid Proof', to: '?waterproof=true' },
    { label: '💰 Budget Under $3', to: '?priceMax=3' },
    { label: '🌊 Wide Plank Look', to: '?width=wide' },
    { label: '✨ New Arrivals', to: '?new=true' },
    { label: '🔥 On Sale', to: '?sale=true' },
  ],
};

/**
 * @param {string} category  One of: vinyl | laminate | engineered_hardwood | solid_hardwood | all
 * @param {string} [base]    Grid base path the presets link to. Default '/products'.
 * @param {string} [heading] Optional small heading above the chips.
 */
export default function GuidedUseCaseChips({ category = 'all', base = '/products', heading = 'Shop by need' }) {
  const chips = PRESETS[category] || PRESETS.all;
  if (!chips.length) return null;

  return (
    <div className="mb-5">
      {heading && (
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{heading}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <Link
            key={chip.label}
            href={`${base}${chip.to}`}
            className="text-sm px-3.5 py-1.5 rounded-full font-medium bg-white text-slate-700 border border-slate-200 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 transition-all whitespace-nowrap"
          >
            {chip.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
