import { Suspense } from 'react';
import Link from 'next/link';
import SolidHardwoodClient from '@/components/SolidHardwoodClient';
import ProductGridServer from '@/components/ProductGridServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { SOLID_HARDWOOD_FAQS } from '@/data/faqs';
import { getProductsForGrid, getCategoryPriceStats } from '@/lib/products-server';
import { createPageUrl } from '@/lib/routes';
import Breadcrumbs from '@/components/Breadcrumbs';
import QuoteContextBanner from '@/components/QuoteContextBanner';
import CityLinks from '@/components/CityLinks';

export const revalidate = 300; // 5-minute ISR

export async function generateMetadata() {
  const stats = await getCategoryPriceStats('solid_hardwood');
  return {
    title: `Solid Hardwood Flooring Markham | Oak, Maple & Hickory from $${stats.lowPrice}/sqft`,
    description: `Shop solid hardwood flooring in Markham from $${stats.lowPrice}/sqft. Red oak, white oak, maple, hickory — ¾" nail-down hardwood in stock. Expert installation across Toronto & GTA. Free measurements. Call (647) 428-1111.`,
    alternates: { canonical: '/solid-hardwood' },
  };
}

const SPOKE_LINKS = [
  {
    route: 'EngineeredHardwood',
    label: 'Engineered vs Solid Hardwood',
    description: 'Compare engineered hardwood — better for concrete, radiant heat, and condos.',
  },
  {
    route: 'WhiteOakFlooring',
    label: 'White Oak Flooring Collection',
    description: 'The #1 hardwood species in Canadian homes — solid and engineered options.',
  },
  {
    route: 'WickhamFlooring',
    label: 'Wickham Canadian-Made Hardwood',
    description: 'Premium solid hardwood made in Wickham, Quebec since 1997.',
  },
  {
    route: 'HardwoodRefinishing',
    label: 'Hardwood Floor Refinishing',
    description: 'Restore existing hardwood floors to like-new condition — from $5.25/sqft.',
  },
  {
    route: 'Stairs',
    label: 'Hardwood Stair Renovation',
    description: 'Match your new hardwood floors with custom-stained stair treads.',
  },
  {
    route: 'FlooringInstallationCost',
    label: 'Flooring Installation Cost',
    description: 'Transparent GTA pricing guide — no hidden fees.',
  },
];

export default async function SolidHardwoodPage() {
  const [products, stats] = await Promise.all([
    getProductsForGrid({ category: 'solid_hardwood' }),
    getCategoryPriceStats('solid_hardwood'),
  ]);
  const low = stats.lowPrice || '5.10';
  const serverGrid = <ProductGridServer products={products} />;

  return (
    <>
      <JsonLd data={[
        faqSchema(SOLID_HARDWOOD_FAQS),
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Solid Hardwood Flooring',
          description: `${stats.count} solid hardwood flooring options from 4 Canadian brands. ¾" thick, refinishable 5-7 times. Serving the Greater Toronto Area.`,
          category: 'Solid Hardwood',
          brand: { '@type': 'Brand', name: 'BBS Flooring' },
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'CAD',
            lowPrice: stats.lowPrice,
            highPrice: stats.highPrice,
            offerCount: stats.count,
            availability: 'https://schema.org/InStock',
            url: 'https://bbsflooring.ca/solid-hardwood',
          },
        },
      ]} />

      <div className="max-w-7xl mx-auto px-4 pt-10 pb-12 md:pt-14 md:pb-16">
        <Suspense><Breadcrumbs
          items={[
            { label: 'Home', url: '/' },
            { label: 'Solid Hardwood', url: '/solid-hardwood' },
          ]}
        /></Suspense>

        <Suspense><QuoteContextBanner /></Suspense>

        {/* ── SSR Page Header ── */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            Solid Hardwood Flooring in Markham | Oak, Maple &amp; More
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            The gold standard in flooring — ¾&quot; pure hardwood from{' '}
            <strong>${low}/sqft</strong> that can be refinished 5+ times and lasts a lifetime.
            In stock at our Markham showroom (6061 Hwy 7) in red oak, white oak, maple, hickory,
            and more. Professional nail-down installation across Markham, Toronto, and the GTA.
          </p>
        </div>

        {/* ── SSR Content Boxes ── */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {/* Box 1 — Species */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-3">🌲 Species We Carry</h2>
            <ul className="text-slate-700 text-sm space-y-2">
              <li>
                <strong>Red Oak:</strong> Classic Canadian hardwood. Warm pink undertones, Janka
                1290. Most refinishable species.
              </li>
              <li>
                <strong>White Oak:</strong> Tighter grain, slightly harder (Janka 1360). The modern
                favourite for contemporary homes.
              </li>
              <li>
                <strong>Hard Maple:</strong> Janka 1450. Clean, light appearance — ideal for
                kitchens and high-traffic areas.
              </li>
              <li>
                <strong>Hickory:</strong> The toughest domestic species (Janka 1820). Bold grain
                contrast for a rustic look.
              </li>
            </ul>
          </div>

          {/* Box 2 — Why Solid */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-3">💎 Why Choose Solid Hardwood?</h2>
            <ul className="text-slate-700 text-sm space-y-2">
              <li>
                <strong>Refinish 5+ times:</strong> Sand and re-stain every 10–15 years. The floor
                gets more character with age.
              </li>
              <li>
                <strong>Highest resale value:</strong> Realtors consistently rank hardwood floors as
                the #1 upgrade buyers seek.
              </li>
              <li>
                <strong>100-year floor:</strong> Properly maintained solid hardwood outlasts the
                building itself.
              </li>
              <li>
                <strong>Authentic feel:</strong> Nothing replicates the warmth and sound of ¾&quot; solid
                hardwood underfoot.
              </li>
            </ul>
          </div>

          {/* Box 3 — Solid vs Engineered */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-3">⚖️ Solid vs. Engineered — Which is Right?</h2>
            <div className="text-slate-700 text-sm space-y-2">
              <p>
                <strong>Choose Solid if:</strong> Your subfloor is plywood (not concrete), you want
                maximum refinishing potential, and you&apos;re on a main or upper floor.
              </p>
              <p>
                <strong>Choose Engineered if:</strong> You have a concrete slab, radiant heat, or
                want a wider plank (over 5&quot;). Engineered handles humidity swings better.
              </p>
              <p>Starting from <strong>$5.69/sqft</strong>. Installation from <strong>$2.25/sqft</strong>.</p>
            </div>
            <Link
              href={createPageUrl('EngineeredHardwood')}
              className="inline-block mt-3 text-amber-700 font-semibold text-sm hover:underline"
            >
              Compare Options →
            </Link>
          </div>
        </div>

        {/* ── Interactive Product Grid (client island) ── */}
        <Suspense fallback={serverGrid}>
          <SolidHardwoodClient initialProducts={products} serverGrid={serverGrid} priceStats={stats} />
        </Suspense>

        {/* ── SSR Financing Banner ── */}
        <div className="my-10 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 text-white px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <span className="text-3xl">💳</span>
            <div>
              <p className="font-bold text-lg leading-tight">Flexible Financing Available</p>
              <p className="text-slate-300 text-sm mt-0.5">
                From <span className="text-amber-400 font-bold">$142/month</span> on approved credit · No prepayment penalty · Instant decision
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
              Frequently Asked Questions About Solid Hardwood Flooring
            </h2>
            <p className="text-slate-600 text-center mb-8">
              Get answers to common questions about solid hardwood flooring in Markham, Toronto, and Durham
            </p>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
              {SOLID_HARDWOOD_FAQS.map((faq, i) => (
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
              { href: '/vinyl', label: 'Vinyl & LVP', desc: 'Waterproof & durable' },
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
          <CityLinks category="solid-hardwood" productLabel="Hardwood Flooring" />
        </div>
      </div>
    </>
  );
}
