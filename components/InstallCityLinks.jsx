import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { getInstallCityPages } from '@/data/cityProductData';

/**
 * InstallCityLinks — internal-link mesh from the /installation hub and the
 * /flooring-installation-cost page down to the 10 dedicated city install pages.
 *
 * SEO purpose (Jul 2026 authority-concentration fix): the city install pages
 * (/flooring-installation-{city}) already link UP to the hub, cost guide, and
 * sibling cities, but the hub + cost page linked back to NONE of them — leaving
 * them effectively orphaned and stuck on page 2-4. This block flows authority
 * from the two strongest install pages down to the city cluster, with exact
 * city-name anchors ("Flooring Installation in {City}") to disambiguate which
 * page owns each "flooring installation {city}" query.
 */
export default function InstallCityLinks({
  title = 'Flooring Installation by City',
  subtitle = 'Local installation crews across Markham, Toronto, York Region & Durham. Find the dedicated page for your city:',
  excludeSlug = null,
}) {
  const cities = getInstallCityPages().filter((c) => c.slug !== excludeSlug);
  if (!cities.length) return null;

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 text-center">{title}</h2>
        <p className="text-slate-500 text-center mb-8 max-w-2xl mx-auto">{subtitle}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {cities.map(({ slug, city }) => (
            <Link
              key={slug}
              href={`/${slug}`}
              className="group flex items-center gap-2 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl px-4 py-3 transition-all"
              title={`Flooring Installation in ${city}`}
            >
              <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="text-sm font-semibold text-slate-700 group-hover:text-amber-700">
                Flooring Installation {city}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
