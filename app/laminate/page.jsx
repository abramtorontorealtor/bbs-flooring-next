import { Suspense } from 'react';
import Link from 'next/link';
import LaminateClient from '@/components/LaminateClient';
import ProductGridServer from '@/components/ProductGridServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { LAMINATE_FAQS } from '@/data/faqs';
import { getProductsForGrid, getCategoryPriceStats } from '@/lib/products-server';
import { createPageUrl } from '@/lib/routes';
import Breadcrumbs from '@/components/Breadcrumbs';
import QuoteContextBanner from '@/components/QuoteContextBanner';

export const revalidate = 300; // 5-minute ISR

export async function generateMetadata() {
  const stats = await getCategoryPriceStats('laminate');
  return {
    title: `Laminate Flooring Markham | 12mm from $${stats.lowPrice}/sqft`,
    description: `Shop premium 12mm laminate flooring in Markham. AC4/AC5 rated, water-resistant, from $${stats.lowPrice}/sqft. 500 sqft installed from $${(500 * parseFloat(stats.lowPrice) + 1000).toLocaleString('en-CA', { maximumFractionDigits: 0 })}. Free measurements. Call (647) 428-1111.`,
    alternates: { canonical: '/laminate' },
  };
}

const SPOKE_LINKS = [
  { route: 'WaterproofFlooring', label: 'Waterproof Laminate & Vinyl Flooring', description: 'Shop waterproof laminate and SPC vinyl — ideal for kitchens, basements & bathrooms.' },
  { route: 'FlooringClearanceSale', label: 'Laminate Flooring Clearance Sale', description: 'Save big on discontinued and overstocked laminate flooring — limited quantities.' },
  { route: 'FlooringInstallationCost', label: 'Laminate Installation Cost Guide', description: 'Laminate installation from $2.00/sqft — full cost breakdown and what to expect.' },
  { route: 'BasementFlooring', label: 'Basement Flooring Options', description: 'Best waterproof flooring for basements — vinyl and waterproof laminate compared.' },
  { route: 'FlooringShowroomMarkham', label: 'Visit Our Markham Showroom', description: 'See and feel laminate samples in person — 6061 Highway 7, Unit B, Markham.' },
];

export default async function LaminatePage() {
  const [products, stats] = await Promise.all([
    getProductsForGrid({ category: 'laminate' }),
    getCategoryPriceStats('laminate'),
  ]);
  const low = stats.lowPrice || '1.49';
  const serverGrid = <ProductGridServer products={products} />;

  return (
    <>
      <JsonLd data={[
        faqSchema(LAMINATE_FAQS),
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Laminate Flooring',
          description: `${stats.count} laminate flooring options from 8 brands. AC3–AC5 rated, from $${stats.lowPrice}/sqft. Serving the Greater Toronto Area.`,
          category: 'Laminate',
          brand: { '@type': 'Brand', name: 'BBS Flooring' },
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'CAD',
            lowPrice: stats.lowPrice,
            highPrice: stats.highPrice,
            offerCount: stats.count,
            availability: 'https://schema.org/InStock',
            url: 'https://bbsflooring.ca/laminate',
          },
        },
      ]} />

      <div className="max-w-7xl mx-auto px-4 pt-10 pb-12 md:pt-14 md:pb-16">
        <Breadcrumbs
          items={[
            { label: 'Home', url: '/' },
            { label: 'Laminate Flooring', url: '/laminate' },
          ]}
        />

        <QuoteContextBanner />

        {/* ── SSR Page Header ── */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            Laminate Flooring in Markham | 12mm From ${low}/sqft
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            Maximum floor for minimum budget. Premium 12mm laminate from{' '}
            <strong>${low}/sqft</strong> — AC4/AC5 rated, water-resistant, and perfect for
            high-traffic areas. In stock at our Markham showroom (6061 Hwy 7) with professional
            installation available across the GTA. A 500 sqft main floor costs as little as{' '}
            <strong>${(500 * parseFloat(low) + 1000).toLocaleString('en-CA', { maximumFractionDigits: 0 })} fully installed</strong>.
          </p>
        </div>

        {/* ── SSR Content Boxes ── */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-3">📐 Why 12mm Laminate?</h2>
            <p className="text-slate-700 text-sm leading-relaxed mb-2">
              Thickness matters with laminate. Thin 7–8mm flooring sounds hollow and feels cheap
              underfoot. Our 12mm options feel solid, quiet, and premium — comparable to engineered
              hardwood at a fraction of the cost.
            </p>
            <ul className="text-slate-700 text-sm space-y-1">
              <li>✅ Solid, quiet underfoot (HDF core)</li>
              <li>✅ AC4/AC5 wear rating for heavy traffic</li>
              <li>✅ Water-resistant edges on most styles</li>
              <li>✅ 25-year residential warranty</li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-3">🏠 Where Laminate Excels</h2>
            <ul className="text-slate-700 text-sm space-y-2">
              <li><strong>Bedrooms:</strong> Soft look, warm underfoot, budget-friendly upgrade from carpet.</li>
              <li><strong>Living Rooms:</strong> Realistic wood looks, handles foot traffic well.</li>
              <li><strong>Home Offices:</strong> AC5-rated options handle rolling chairs and desk wear.</li>
              <li><strong>Hallways:</strong> Durable surface for high-traffic transition zones.</li>
              <li><strong>Whole-House Budget Projects:</strong> 500 sqft installed from $1,745.</li>
            </ul>
            <p className="text-slate-500 text-xs mt-3">
              ⚠️ Not recommended for basements with moisture or wet areas (bathrooms). Use SPC vinyl instead.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-3">💰 Laminate Pricing at BBS</h2>
            <div className="text-slate-700 text-sm space-y-2">
              <p><strong>Entry 12mm:</strong> From $1.49/sqft — AC4 rated, 20+ colour options.</p>
              <p><strong>Mid-Range 12mm:</strong> $1.99–$2.99/sqft — wider planks, premium finishes.</p>
              <p><strong>Premium 12mm:</strong> $2.99–$4.99/sqft — embossed in register, AC5 commercial grade.</p>
              <p><strong>Installation:</strong> $2.00–$2.25/sqft including subfloor prep and transitions.</p>
            </div>
            <Link href={createPageUrl('QuoteCalculator')} className="inline-block mt-3 text-amber-700 font-semibold text-sm hover:underline">
              Calculate Your Cost →
            </Link>
          </div>
        </div>

        {/* ── Interactive Product Grid (client island) ── */}
        <Suspense fallback={serverGrid}>
          <LaminateClient initialProducts={products} serverGrid={serverGrid} priceStats={stats} />
        </Suspense>

        {/* ── SSR Financing Banner ── */}
        <div className="my-10 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 text-white px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <span className="text-3xl">💳</span>
            <div>
              <p className="font-bold text-lg leading-tight">Flexible Financing Available</p>
              <p className="text-slate-300 text-sm mt-0.5">
                From <span className="text-amber-400 font-bold">$68/month</span> on approved credit · No prepayment penalty · Instant decision
              </p>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/financing" className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap">
              Learn More →
            </Link>
          </div>
        </div>

        {/* ── SSR FAQ Section ── */}
        <div className="mt-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-3 text-center">
              Frequently Asked Questions About Laminate Flooring
            </h2>
            <p className="text-slate-600 text-center mb-8">
              Get answers to common questions about laminate flooring in Markham, Toronto, and Durham
            </p>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
              {LAMINATE_FAQS.map((faq, i) => (
                <details key={i} className="group">
                  <summary className="px-6 py-4 cursor-pointer text-left font-semibold text-slate-800 hover:text-amber-600 list-none flex items-center justify-between">
                    {faq.question}
                    <svg className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </summary>
                  <div className="px-6 pb-4 text-slate-700 leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* ── SSR Spoke Links ── */}
        <div className="mt-12 mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Explore Related Flooring Pages</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SPOKE_LINKS.map(({ route, label, description }) => (
              <Link key={route} href={createPageUrl(route)} className="group flex items-start gap-3 bg-gradient-to-br from-amber-50 to-slate-50 hover:from-amber-100 hover:to-slate-100 border border-slate-200 hover:border-amber-300 rounded-xl p-5 transition-all">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 group-hover:text-amber-700 mb-1">{label}</h3>
                  <p className="text-sm text-slate-600">{description}</p>
                </div>
                <span className="text-amber-500 mt-1 flex-shrink-0">→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── SSR Related Categories ── */}
        <div className="mt-12 pt-10 border-t border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Explore More Flooring</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { href: '/engineered-hardwood', label: 'Engineered Hardwood', desc: 'Real wood with added stability' },
              { href: '/solid-hardwood', label: 'Solid Hardwood', desc: 'Timeless real wood flooring' },
              { href: '/vinyl', label: 'Vinyl & LVP', desc: 'Waterproof & durable' },
              { href: '/stairs', label: 'Stair Installation', desc: 'Custom stair renovation' },
            ].map(({ href, label, desc }) => (
              <Link key={href} href={href} className="group block bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl p-4 transition-all">
                <h3 className="font-semibold text-slate-800 group-hover:text-amber-700 text-sm mb-1">{label}</h3>
                <p className="text-xs text-slate-500">{desc}</p>
              </Link>
            ))}
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Our Services</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { href: '/installation', label: 'Installation Services', desc: 'Professional install from $2.00/sqft' },
              { href: '/free-measurement', label: 'Free Measurement', desc: 'No-obligation in-home quote' },
              { href: '/carpet-removal', label: 'Carpet Removal', desc: 'Clean slate from $1.00/sqft' },
            ].map(({ href, label, desc }) => (
              <Link key={href} href={href} className="flex items-center gap-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl px-4 py-3 transition-all">
                <div>
                  <span className="font-semibold text-amber-800 text-sm">{label}</span>
                  <p className="text-xs text-amber-600">{desc}</p>
                </div>
                <span className="ml-auto text-amber-400">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
