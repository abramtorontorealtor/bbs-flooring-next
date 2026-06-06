import Link from 'next/link';

const CITY_LINKS = {
  'engineered-hardwood': [
    { city: 'Markham', href: '/engineered-hardwood-flooring-markham' },
    { city: 'Toronto', href: '/engineered-hardwood-flooring-toronto' },
    { city: 'Scarborough', href: '/engineered-hardwood-flooring-scarborough' },
    { city: 'Richmond Hill', href: '/engineered-hardwood-flooring-richmond-hill' },
    { city: 'Vaughan', href: '/engineered-hardwood-flooring-vaughan' },
  ],
  vinyl: [
    { city: 'Markham', href: '/vinyl-flooring-markham' },
    { city: 'Toronto', href: '/vinyl-flooring-toronto' },
    { city: 'Scarborough', href: '/vinyl-flooring-scarborough' },
    { city: 'Richmond Hill', href: '/vinyl-flooring-richmond-hill' },
    { city: 'Vaughan', href: '/vinyl-flooring-vaughan' },
  ],
  laminate: [
    { city: 'Markham', href: '/laminate-flooring-markham' },
    { city: 'Toronto', href: '/laminate-flooring-toronto' },
    { city: 'Scarborough', href: '/laminate-flooring-scarborough' },
    { city: 'Richmond Hill', href: '/laminate-flooring-richmond-hill' },
    { city: 'Vaughan', href: '/laminate-flooring-vaughan' },
  ],
  'solid-hardwood': [
    { city: 'Markham', href: '/hardwood-flooring-markham' },
    { city: 'Toronto', href: '/hardwood-flooring-toronto' },
    { city: 'Scarborough', href: '/hardwood-flooring-scarborough' },
    { city: 'Richmond Hill', href: '/hardwood-flooring-richmond-hill' },
    { city: 'Vaughan', href: '/hardwood-flooring-vaughan' },
  ],
};

const GENERAL_CITY_LINKS = [
  { city: 'Markham', href: '/flooring-in/markham' },
  { city: 'Toronto', href: '/flooring-in/toronto' },
  { city: 'Scarborough', href: '/flooring-in/scarborough' },
  { city: 'Richmond Hill', href: '/flooring-in/richmond-hill' },
  { city: 'Vaughan', href: '/flooring-in/vaughan' },
  { city: 'Pickering', href: '/flooring-in/pickering' },
  { city: 'Ajax', href: '/flooring-in/ajax' },
  { city: 'Whitby', href: '/flooring-in/whitby' },
  { city: 'Newmarket', href: '/flooring-in/newmarket' },
  { city: 'Aurora', href: '/flooring-in/aurora' },
  { city: 'Stouffville', href: '/flooring-in/stouffville' },
  { city: 'Woodbridge', href: '/flooring-in/woodbridge' },
  { city: 'Oshawa', href: '/flooring-in/oshawa' },
  { city: 'Durham Region', href: '/flooring-in/durham' },
];

/**
 * Server component that renders city×product cross-links on category pages.
 * @param {{ category: string, productLabel: string }} props
 */
export default function CityLinks({ category, productLabel }) {
  const cityProductLinks = CITY_LINKS[category] || [];

  return (
    <div className="mt-8">
      {cityProductLinks.length > 0 && (
        <>
          <h3 className="text-lg font-semibold text-slate-700 mb-3">{productLabel} by City</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {cityProductLinks.map(({ city, href }) => (
              <Link
                key={href}
                href={href}
                className="text-sm bg-slate-100 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-700 hover:text-amber-700 px-3 py-1.5 rounded-lg transition-all"
              >
                {productLabel} in {city}
              </Link>
            ))}
          </div>
        </>
      )}
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">All Service Areas</h3>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-600">
        {GENERAL_CITY_LINKS.map(({ city, href }) => (
          <Link key={href} href={href} className="hover:text-amber-600 transition-colors">
            Flooring in {city}
          </Link>
        ))}
      </div>
    </div>
  );
}
