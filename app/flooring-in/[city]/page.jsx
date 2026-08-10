import { Suspense } from 'react';
import Link from 'next/link';
import { locationData } from '@/data/locationData';
import { getProductsForGrid } from '@/lib/products-server';
import { JsonLd, faqSchema } from '@/lib/schemas';
import { GOOGLE_REVIEW_COUNT } from '@/lib/service-constants';
import LocationProductGrid from '@/components/LocationProductGrid';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getLocationBreadcrumbs } from '@/lib/breadcrumbs';
import ProductCardStatic from '@/components/ProductCardStatic';

export const revalidate = 3600; // 1-hour ISR

// Generate static params for all cities
export function generateStaticParams() {
  return Object.keys(locationData).map(city => ({ city }));
}

export async function generateMetadata({ params }) {
  const { city } = await params;
  const data = locationData[city] || locationData['markham'];
  const title = data.title ? data.title.replace(/\s*\|\s*BBS\s*Flooring\s*$/i, '').trim() : data.title;
  return {
    title,
    description: data.description,
    alternates: {
      canonical: `/flooring-in/${city}`,
    },
  };
}

export default async function LocationPage({ params }) {
  const { city } = await params;
  const data = locationData[city] || locationData['markham'];

  // Fetch products server-side for SSR
  const products = await getProductsForGrid({ limit: 500 });
  const trendingProducts = products
    .filter(p => p.in_stock !== false)
    .slice(0, 8);

  const citySlug = city;

  return (
    <>
      {/* FAQPage + LocalBusiness JSON-LD */}
      {data.faqs && data.faqs.length > 0 && (
        <JsonLd data={[
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: data.faqs.map(f => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          },
          {
            '@context': 'https://schema.org',
            // Flooring "store" query intent: HomeAndConstructionBusiness (a Store subtype) with hours + map.
            '@type': data.isFlagship ? ['LocalBusiness', 'HomeAndConstructionBusiness', 'Store'] : 'LocalBusiness',
            name: 'BBS Flooring',
            description: data.description,
            telephone: '(647) 428-1111',
            url: 'https://bbsflooring.ca',
            ...(data.isFlagship ? {
              priceRange: '$$',
              hasMap: 'https://www.google.com/maps?cid=9896263526048495139',
              openingHoursSpecification: [
                { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '10:00', closes: '17:00' },
              ],
            } : {}),
            address: {
              '@type': 'PostalAddress',
              streetAddress: '6061 Highway 7, Unit B',
              addressLocality: 'Markham',
              addressRegion: 'ON',
              postalCode: 'L3P 3B2',
              addressCountry: 'CA',
            },
            areaServed: { '@type': 'City', name: data.city },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.7',
              reviewCount: String(GOOGLE_REVIEW_COUNT),
              bestRating: '5',
            },
          },
        ]} />
      )}

      <div className="max-w-7xl mx-auto px-4 py-12">
        <Suspense><Breadcrumbs items={getLocationBreadcrumbs(data.city)} /></Suspense>

        {/* ── SSR Hero Section ── */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 px-4 py-2 rounded-full mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span className="text-sm font-medium">Serving {data.city}</span>
          </div>
          <h1 className="text-5xl font-bold text-slate-800 mb-6">
            {data.isFlagship
              ? `Flooring Store in ${data.city} — Hardwood, Vinyl & Laminate`
              : `Hardwood & Vinyl Flooring Installation in ${data.city}`}
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            {data.content}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/quote-calculator?city=${encodeURIComponent(data.city)}`} className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              Get a Quote in {data.city}
            </Link>
            <a href="tel:6474281111" className="inline-flex items-center justify-center gap-2 border border-slate-300 hover:border-amber-400 text-slate-700 font-semibold px-6 py-3 rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              Call (647) 428-1111
            </a>
          </div>
        </div>

        {/* ── SSR Why Choose Us Section ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">
            Why {data.city} Homeowners Choose BBS Flooring
          </h2>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">Local Expertise in {data.city}</h3>
                  <p className="text-slate-600">We know {data.city} homes. From {data.landmarks && data.landmarks.slice(0, 3).join(', ')} to newer developments, we understand local style and requirements.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">Free In-Home Estimates</h3>
                  <p className="text-slate-600">No-obligation quotes with detailed measurements at your {data.city} home.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">Professional Installation</h3>
                  <p className="text-slate-600">Expert installers with years of experience serving {data.city} and the GTA.</p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="bg-slate-50 rounded-xl overflow-hidden h-64 md:h-full min-h-[300px] border border-slate-200 relative">
              {data.mapEmbed ? (
                <div dangerouslySetInnerHTML={{ __html: data.mapEmbed }} className="w-full h-full" />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <p>Serving all of {data.city}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── SSR Neighbourhood Breakdown (Flagship only) ── */}
        {data.neighbourhoods && data.neighbourhoods.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Flooring for Every {data.city} Neighbourhood</h2>
            <p className="text-slate-600 mb-8">{data.city} has diverse neighbourhoods with unique homes that call for different flooring solutions. Here's what we recommend based on our experience installing in your area.</p>
            <div className="grid md:grid-cols-2 gap-6">
              {data.neighbourhoods.map((nb, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 hover:border-amber-300 transition-colors">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{nb.name}</h3>
                  <p className="text-slate-600 mb-4 leading-relaxed">{nb.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <span className="font-medium text-slate-500 shrink-0">🏠 Housing:</span>
                      <span className="text-slate-600">{nb.housingTypes}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium text-slate-500 shrink-0">⭐ Top Picks:</span>
                      <span className="text-slate-600">{nb.topProducts}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SSR Commercial Section (Flagship only) ── */}
        {data.commercial && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">{data.commercial.title}</h2>
            <p className="text-slate-600 mb-8 leading-relaxed max-w-4xl">{data.commercial.content}</p>
            {data.commercial.sectors && (
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {data.commercial.sectors.map((sector, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                    <h3 className="font-semibold text-slate-800 mb-1">{sector.name}</h3>
                    <p className="text-sm text-slate-600">{sector.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SSR Why BBS Section (Flagship only) ── */}
        {data.whyBBS && (
          <div className="mb-16 bg-amber-50 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">{data.whyBBS.title}</h2>
            <div className="space-y-6 max-w-3xl mx-auto">
              {data.whyBBS.points.map((point, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold shrink-0 text-lg">{i + 1}</div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg mb-1">{point.heading}</h3>
                    <p className="text-slate-600 leading-relaxed">{point.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SSR Pricing Comparison (Flagship only) ── */}
        {data.pricingComparison && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">{data.pricingComparison.title}</h2>
            <p className="text-slate-600 mb-8">{data.pricingComparison.subtitle}</p>
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Flooring Type</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-amber-600">🏆 BBS Flooring</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Big Box Stores</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Specialty Stores</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.pricingComparison.rows.map((row, i) => (
                    <tr key={i} className="hover:bg-amber-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">{row.type}</td>
                      <td className="px-6 py-4 text-amber-600 font-bold">{row.bbs}</td>
                      <td className="px-6 py-4 text-slate-500">{row.bigBox}</td>
                      <td className="px-6 py-4 text-slate-500">{row.specialty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-slate-500 mt-4">* Prices are per square foot for materials only. Installation rates provided with free in-home estimate. Big box and specialty prices are typical ranges observed in the Markham area as of 2026.</p>
          </div>
        )}

        {/* ── SSR Services Section ── */}
        {data.services && data.services.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Flooring Services in {data.city}</h2>
            <p className="text-slate-600 mb-8">Professional flooring services available for {data.city} homeowners</p>
            <div className="grid md:grid-cols-3 gap-6">
              {data.services.map((service, i) => (
                <Link key={i} href={service.slug} className="group">
                  <div className="bg-white rounded-xl border border-slate-200 p-6 hover:border-amber-300 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
                      <span className="text-amber-600 text-xl">
                        {service.icon === 'Hammer' && '🔨'}
                        {service.icon === 'Layers' && '📦'}
                        {service.icon === 'Footprints' && '👣'}
                        {service.icon === 'Trash2' && '🗑️'}
                        {service.icon === 'Paintbrush' && '🖌️'}
                        {service.icon === 'Home' && '🏠'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-800 text-lg mb-2">{service.name}</h3>
                    <p className="text-slate-500 text-sm mb-3">Expert {service.name.toLowerCase()} for {data.city} homes</p>
                    <span className="text-amber-600 text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Learn More →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── SSR FAQ Section ── */}
        {data.faqs && data.faqs.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Frequently Asked Questions About Flooring in {data.city}</h2>
            <p className="text-slate-600 mb-8">Common questions from {data.city} homeowners</p>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
              {data.faqs.map((faq, i) => (
                <details key={i} className="group">
                  <summary className="px-6 py-4 cursor-pointer text-left font-medium text-slate-800 hover:text-amber-600 list-none flex items-center justify-between">
                    {faq.q}
                    <svg className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </summary>
                  <div className="px-6 pb-4 text-slate-600 leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* ── SSR Trending Products ── */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Trending in {data.city}</h2>
          <p className="text-slate-600 mb-8">Popular flooring choices for {data.city} homeowners</p>

          {/* Server-rendered product grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trendingProducts.map((product) => (
              <ProductCardStatic key={product.id} product={product} />
            ))}
          </div>

          {/* Client-side interactive overlay (hydrates over the static grid) */}
          <Suspense>
            <LocationProductGrid citySlug={citySlug} initialProducts={products} />
          </Suspense>
        </div>

        {/* ── SSR CTA Section ── */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your {data.city} Home?</h2>
          <p className="text-lg mb-8 opacity-90">Get a free quote and see how BBS Flooring can elevate your space</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/quote-calculator?city=${encodeURIComponent(data.city)}`} className="inline-flex items-center justify-center bg-white text-amber-600 hover:bg-slate-50 font-semibold px-6 py-3 rounded-xl transition-colors">
              Get Your Free Quote
            </Link>
            <a href="tel:6474281111" className="inline-flex items-center justify-center gap-2 border border-white text-white hover:bg-white/10 font-semibold px-6 py-3 rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              (647) 428-1111
            </a>
          </div>
        </div>

        {/* ── SSR Product Type Links ── */}
        <div className="mt-16 pt-8 border-t border-slate-200">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Flooring by Type in {data.city}</h3>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 mb-8">
            {[
              { label: `Vinyl Flooring ${data.city}`, slug: `vinyl-flooring-${citySlug}` },
              { label: `Hardwood Flooring ${data.city}`, slug: `hardwood-flooring-${citySlug}` },
              { label: `Laminate Flooring ${data.city}`, slug: `laminate-flooring-${citySlug}` },
              { label: `Engineered Hardwood ${data.city}`, slug: `engineered-hardwood-flooring-${citySlug}` },
            ].map(link => (
              <Link key={link.slug} href={`/${link.slug}`} className="hover:text-amber-600 transition-colors">
                {link.label}
              </Link>
            ))}
            {data.isFlagship && (
              <Link href="/flooring-showroom-markham" className="hover:text-amber-600 transition-colors font-medium">
                Visit our {data.city} Flooring Store &rarr;
              </Link>
            )}
          </div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Other Service Areas</h3>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
            {Object.keys(locationData).map(key => (
              <Link key={key} href={`/flooring-in/${key}`} className="hover:text-amber-600 transition-colors">
                Flooring in {locationData[key].city}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
