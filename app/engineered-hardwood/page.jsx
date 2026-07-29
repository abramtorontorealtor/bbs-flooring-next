import { Suspense } from 'react';
import Link from 'next/link';
import EngineeredHardwoodClient from '@/components/EngineeredHardwoodClient';
import ProductGridServer from '@/components/ProductGridServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { ENGINEERED_HARDWOOD_FAQS } from '@/data/faqs';
import { getProductsForGrid, getCategoryPriceStats } from '@/lib/products-server';
import { createPageUrl } from '@/lib/routes';
import Breadcrumbs from '@/components/Breadcrumbs';
import QuoteContextBanner from '@/components/QuoteContextBanner';
import CityLinks from '@/components/CityLinks';
import CategoryShopBar from '@/components/CategoryShopBar';

export const revalidate = 3600; // 1-hour ISR (was 5-min; prices change a few times/mo, force-refresh via /api/revalidate after reconcile)

export async function generateMetadata() {
  const stats = await getCategoryPriceStats('engineered_hardwood');
  return {
    title: `Engineered Hardwood Flooring Markham | From $${stats.lowPrice}/sqft | Vidar & Wickham`,
    description: `Shop engineered hardwood flooring in Markham from $${stats.lowPrice}/sqft. Vidar, Wickham, Triforest — wide-plank European oak in stock. Expert installation across Toronto & GTA. Free measurements. Call (647) 428-1111.`,
    alternates: { canonical: '/engineered-hardwood' },
  };
}

const SPOKE_LINKS = [
  { route: 'VidarFlooring', label: 'Vidar Engineered Hardwood', description: 'Shop Vidar Design Flooring — premium European oak engineered hardwood.' },
  { route: 'WhiteOakFlooring', label: 'White Oak Flooring Collection', description: 'Browse all white oak engineered hardwood — the most popular species in 2025.' },
  { route: 'WickhamFlooring', label: 'Wickham Hardwood Flooring', description: 'Canadian-made Wickham engineered and solid hardwood — built for our climate.' },
  { route: 'HardwoodRefinishing', label: 'Hardwood Floor Refinishing', description: 'Restore your existing hardwood floors with professional sand & stain service.' },
  { route: 'FlooringInstallationCost', label: 'Hardwood Installation Cost Guide', description: 'Installation from $2.25/sqft (nail-down) to $4.25/sqft (herringbone) — full breakdown.' },
  { route: 'ContractorFlooring', label: 'Contractor & Trade Pricing', description: 'Exclusive member pricing on engineered hardwood for contractors and builders.' },
];

export default async function EngineeredHardwoodPage() {
  const [products, stats] = await Promise.all([
    getProductsForGrid({ category: 'engineered_hardwood' }),
    getCategoryPriceStats('engineered_hardwood'),
  ]);
  const low = stats.lowPrice || '3.19';
  const serverGrid = <ProductGridServer products={products} />;

  return (
    <>
      <JsonLd data={[
        faqSchema(ENGINEERED_HARDWOOD_FAQS),
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Engineered Hardwood Flooring',
          description: `${stats.count}+ engineered hardwood flooring options from 8 brands including Northernest, NAF, Canadian Standard, and Vidar. Serving the Greater Toronto Area.`,
          category: 'Engineered Hardwood',
          brand: { '@type': 'Brand', name: 'BBS Flooring' },
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'CAD',
            lowPrice: stats.lowPrice,
            highPrice: stats.highPrice,
            offerCount: stats.count,
            availability: 'https://schema.org/InStock',
            url: 'https://bbsflooring.ca/engineered-hardwood',
          },
        },
      ]} />

      <div className="max-w-7xl mx-auto px-4 pt-10 pb-12 md:pt-14 md:pb-16">
        <Suspense><Breadcrumbs
          items={[
            { label: 'Home', url: '/' },
            { label: 'Engineered Hardwood', url: '/engineered-hardwood' },
          ]}
        /></Suspense>

        <Suspense><QuoteContextBanner /></Suspense>

        {/* ── SSR Page Header ── */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            Engineered Hardwood Flooring in Markham
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            Real wood, built for Ontario humidity — 100+ engineered hardwood styles from <strong>${low}/sqft</strong>. Shop online or visit our Markham showroom.
          </p>
        </div>

        {/* ── SSR Shop-intent + trust bar ── */}
        <CategoryShopBar count={stats.count ? `${stats.count}+` : '100+'} low={low} label="Engineered Hardwood" />

        {/* ── Interactive Product Grid (client island) — moved up so shopping is immediate ── */}
        <div id="shop" className="scroll-mt-24">
          <Suspense fallback={serverGrid}>
            <EngineeredHardwoodClient initialProducts={products} serverGrid={serverGrid} priceStats={stats} />
          </Suspense>
        </div>

        {/* ── SSR Long-form intro (moved below grid — SEO text preserved) ── */}
        <p className="text-slate-600 max-w-3xl mt-14 mb-8">
          Real wood on top, plywood underneath — engineered hardwood is the #1 choice for GTA
          homeowners renovating with Ontario&apos;s humidity in mind. Shop 100+ engineered hardwood
          styles from <strong>${low}/sqft</strong> at our Markham showroom (6061 Hwy 7). Vidar, Wickham,
          Triforest, Northernest, and more — all in stock for same-week pickup or installation.
        </p>

        {/* ── SSR Content Boxes (moved below grid — text preserved for SEO) ── */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-3">🌳 White Oak — Most Popular Species</h2>
            <p className="text-slate-700 text-sm leading-relaxed">
              White oak is the dominant hardwood species in Canadian new builds and renovations.
              Harder than red oak (Janka 1360), tighter grain, and takes stain beautifully — from
              natural to deep espresso. Available in 5&quot; to 9½&quot; wide-plank options.
            </p>
            <Link href={createPageUrl('WhiteOakFlooring')} className="inline-block mt-3 text-amber-700 font-semibold text-sm hover:underline">
              Shop White Oak →
            </Link>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-3">🏆 Top Brands In Stock</h2>
            <ul className="text-slate-700 text-sm space-y-2">
              <li><strong>Vidar:</strong> Premium European oak, 35-year warranty, radiant heat compatible.</li>
              <li><strong>Wickham:</strong> Canadian-made hardwood from Quebec since 1997. Red oak, maple, hickory.</li>
              <li><strong>Triforest:</strong> Wide-plank European oak at accessible price points.</li>
              <li><strong>Northernest:</strong> Select and natural grade Canadian species.</li>
            </ul>
            <Link href={createPageUrl('VidarFlooring')} className="inline-block mt-3 text-amber-700 font-semibold text-sm hover:underline">
              Explore Vidar →
            </Link>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-3">⚖️ Engineered vs. Solid Hardwood</h2>
            <p className="text-slate-700 text-sm leading-relaxed mb-2">
              <strong>Engineered hardwood</strong> is real wood on top, plywood underneath. It
              handles Ontario&apos;s humidity swings better than solid, can go over concrete or radiant
              heat, and costs less to install.
            </p>
            <p className="text-slate-700 text-sm leading-relaxed">
              <strong>Solid hardwood</strong> (¾&quot; pure wood) can be refinished 5+ times and has the
              highest resale value — but can&apos;t go below grade or over concrete.
            </p>
            <Link href={createPageUrl('SolidHardwood')} className="inline-block mt-3 text-amber-700 font-semibold text-sm hover:underline">
              Shop Solid Hardwood →
            </Link>
          </div>
        </div>

        {/* ── SSR Financing Banner ── */}
        <div className="my-10 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 text-white px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <span className="text-3xl">💳</span>
            <div>
              <p className="font-bold text-lg leading-tight">Flexible Financing Available</p>
              <p className="text-slate-300 text-sm mt-0.5">
                From <span className="text-amber-400 font-bold">$122/month</span> on approved credit · No prepayment penalty · Instant decision
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
              Frequently Asked Questions About Engineered Hardwood Flooring
            </h2>
            <p className="text-slate-600 text-center mb-8">
              Get answers to common questions about engineered hardwood flooring in Markham, Toronto, and Durham
            </p>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
              {ENGINEERED_HARDWOOD_FAQS.map((faq, i) => (
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
              { href: '/solid-hardwood', label: 'Solid Hardwood', desc: 'Timeless real wood flooring' },
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
          <CityLinks category="engineered-hardwood" productLabel="Engineered Hardwood" />
        </div>
      </div>
    </>
  );
}
