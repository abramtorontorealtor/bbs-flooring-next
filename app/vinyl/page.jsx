import { Suspense } from 'react';
import Link from 'next/link';
import VinylClient from '@/components/VinylClient';
import ProductGridServer from '@/components/ProductGridServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { VINYL_FAQS } from '@/data/faqs';
import { getProductsForGrid, getCategoryPriceStats } from '@/lib/products-server';
import { createPageUrl } from '@/lib/routes';
import Breadcrumbs from '@/components/Breadcrumbs';
import QuoteContextBanner from '@/components/QuoteContextBanner';

export const revalidate = 300; // 5-minute ISR

export async function generateMetadata() {
  const stats = await getCategoryPriceStats('vinyl');
  return {
    title: `Vinyl Plank Flooring Markham | LVP & SPC from $${stats.lowPrice}/sqft`,
    description: `Shop luxury vinyl plank (LVP) and SPC waterproof flooring in Markham from $${stats.lowPrice}/sqft. 100% waterproof, scratch-resistant. Perfect for basements, kitchens, bathrooms. Free in-home measurements across the GTA. Call (647) 428-1111.`,
    alternates: { canonical: '/vinyl' },
  };
}

const SPOKE_LINKS = [
  {
    route: 'BasementFlooring',
    label: 'Best Vinyl Flooring for Basements',
    description: 'Waterproof SPC vinyl is the #1 choice for basement floors — see why.',
  },
  {
    route: 'WaterproofFlooring',
    label: 'Waterproof Flooring Collection',
    description: 'Shop all waterproof vinyl plank and waterproof laminate options.',
  },
  {
    route: 'FlooringClearanceSale',
    label: 'Vinyl Flooring on Sale',
    description: 'Clearance deals on premium vinyl — limited stock, first-quality product.',
  },
  {
    route: 'FlooringInstallationCost',
    label: 'Vinyl Installation Cost Guide',
    description: 'Vinyl installation from $2.00–$2.25/sqft — includes click-lock and glue-down options.',
  },
  {
    route: 'FlooringShowroomMarkham',
    label: 'See Vinyl Samples in Person',
    description: 'Visit our Markham showroom to feel the texture and compare vinyl options.',
  },
];

export default async function VinylPage() {
  const [products, stats] = await Promise.all([
    getProductsForGrid({ category: 'vinyl' }),
    getCategoryPriceStats('vinyl'),
  ]);
  const low = stats.lowPrice || '1.99';
  const serverGrid = <ProductGridServer products={products} />;

  return (
    <>
      <JsonLd data={[
        faqSchema(VINYL_FAQS),
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Vinyl LVP & SPC Flooring',
          description: `${stats.count} waterproof vinyl flooring options (LVP/SPC) from 6 brands. 100% waterproof, click-lock installation. Serving the Greater Toronto Area.`,
          category: 'Vinyl Flooring',
          brand: { '@type': 'Brand', name: 'BBS Flooring' },
          additionalProperty: { '@type': 'PropertyValue', name: 'Waterproof', value: 'Yes — 100% permanently waterproof' },
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'CAD',
            lowPrice: stats.lowPrice,
            highPrice: stats.highPrice,
            offerCount: stats.count,
            availability: 'https://schema.org/InStock',
            url: 'https://bbsflooring.ca/vinyl',
          },
        },
      ]} />

      <div className="max-w-7xl mx-auto px-4 pt-10 pb-12 md:pt-14 md:pb-16">
        <Breadcrumbs
          items={[
            { label: 'Home', url: '/' },
            { label: 'Vinyl Flooring', url: '/vinyl' },
          ]}
        />

        <QuoteContextBanner />

        {/* ── SSR Page Header ── */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            Vinyl Plank Flooring in Markham | LVP &amp; SPC
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            100% waterproof, scratch-resistant, and built for real life. Shop 100+ SPC and LVP vinyl
            plank styles from <strong>${low}/sqft</strong> at our Markham showroom (6061 Hwy 7).
            Serving Toronto, Scarborough, Vaughan, and all of Durham Region — free in-home
            measurements included.
          </p>
        </div>

        {/* ── SSR Content Boxes ── */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {/* Box 1 — SPC Technology */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-3">🛡️ SPC — The Gold Standard</h2>
            <p className="text-slate-700 text-sm leading-relaxed mb-2">
              SPC (Stone Polymer Composite) is the latest generation of luxury vinyl. The rigid
              stone-polymer core is <strong>100% waterproof</strong>, completely flat, and installs
              directly over concrete with no glue required.
            </p>
            <ul className="text-slate-700 text-sm space-y-1">
              <li>✅ 100% waterproof — not just water-resistant</li>
              <li>✅ Rigid core hides subfloor imperfections</li>
              <li>✅ Handles temperature extremes (-20°C to +60°C)</li>
              <li>✅ Built-in underlayment on most styles</li>
            </ul>
          </div>

          {/* Box 2 — Where to Use */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-3">🏠 Where Vinyl Works Best</h2>
            <ul className="text-slate-700 text-sm space-y-2">
              <li>
                <strong>Basements:</strong> The only sensible choice — 100% waterproof over concrete.
              </li>
              <li>
                <strong>Kitchens:</strong> Spills, splashes, dropped items — vinyl handles it all.
              </li>
              <li>
                <strong>Bathrooms:</strong> Yes, SPC vinyl works in bathrooms (unlike hardwood).
              </li>
              <li>
                <strong>Rental Properties:</strong> Durable, cheap to replace if damaged — landlord
                favourite.
              </li>
              <li>
                <strong>Main Floor:</strong> Families with kids and pets love the scratch resistance.
              </li>
            </ul>
            <Link
              href={createPageUrl('BasementFlooring')}
              className="inline-block mt-3 text-amber-700 font-semibold text-sm hover:underline"
            >
              Basement Flooring Guide →
            </Link>
          </div>

          {/* Box 3 — Pricing */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-3">💰 Vinyl Pricing at BBS</h2>
            <div className="text-slate-700 text-sm space-y-2">
              <p>
                <strong>Entry SPC (6mm):</strong> From $1.79/sqft — great for rental units.
              </p>
              <p>
                <strong>Mid-Range (8mm):</strong> $2.49–$3.49/sqft — the most popular price point.
              </p>
              <p>
                <strong>Premium (10–12mm):</strong> $3.49–$5.00/sqft — thicker, quieter underfoot.
              </p>
              <p>
                <strong>Installation:</strong> $2.00–$2.25/sqft including subfloor prep and
                transitions.
              </p>
            </div>
            <Link
              href={createPageUrl('QuoteCalculator')}
              className="inline-block mt-3 text-amber-700 font-semibold text-sm hover:underline"
            >
              Get an Instant Quote →
            </Link>
          </div>
        </div>

        {/* ── Interactive Product Grid (client island) ── */}
        <Suspense fallback={serverGrid}>
          <VinylClient initialProducts={products} serverGrid={serverGrid} priceStats={stats} />
        </Suspense>

        {/* ── SSR Financing Banner ── */}
        <div className="my-10 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 text-white px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <span className="text-3xl">💳</span>
            <div>
              <p className="font-bold text-lg leading-tight">Flexible Financing Available</p>
              <p className="text-slate-300 text-sm mt-0.5">
                From <span className="text-amber-400 font-bold">$89/month</span> on approved credit · No prepayment penalty · Instant decision
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
              Frequently Asked Questions About Vinyl Flooring
            </h2>
            <p className="text-slate-600 text-center mb-8">
              Get answers to common questions about luxury vinyl plank flooring in Markham, Toronto, and Durham
            </p>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
              {VINYL_FAQS.map((faq, i) => (
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
              { href: '/engineered-hardwood', label: 'Engineered Hardwood', desc: 'Real wood, built for Ontario humidity' },
              { href: '/solid-hardwood', label: 'Solid Hardwood', desc: 'Timeless real wood flooring' },
              { href: '/laminate', label: 'Laminate', desc: 'Stylish & affordable' },
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
