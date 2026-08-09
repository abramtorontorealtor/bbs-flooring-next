import { Suspense } from 'react';
import Link from 'next/link';
import ProductsClient from '@/components/ProductsClient';
import ProductGridServer from '@/components/ProductGridServer';
import FloorFinderCTA from '@/components/FloorFinderCTA';
import GuidedUseCaseChips from '@/components/GuidedUseCaseChips';
import { SEO_DATA } from '@/lib/seo';
import { getProductsForGrid, deriveOfferStats } from '@/lib/products-server';
import { JsonLd } from '@/lib/schemas';
import Breadcrumbs from '@/components/Breadcrumbs';

export const revalidate = 3600; // 1-hour ISR (was 5-min; prices change a few times/mo, force-refresh via /api/revalidate after reconcile)

export const metadata = {
  title: SEO_DATA.products.title,
  description: SEO_DATA.products.description,
  alternates: { canonical: '/products' },
};

export default async function ProductsPage() {
  const products = await getProductsForGrid();
  const serverGrid = <ProductGridServer products={products} />;
  const stats = deriveOfferStats(products);

  return (
    <div className="max-w-7xl mx-auto px-4 pb-12 pt-10 md:pt-14">
      {stats && (
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Flooring — All Products',
          description: `${stats.count} flooring products from 15+ brands — engineered hardwood, solid hardwood, luxury vinyl plank, and laminate. Available from our Markham showroom with GTA installation.`,
          category: 'Flooring',
          brand: { '@type': 'Brand', name: 'BBS Flooring' },
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'CAD',
            lowPrice: stats.lowPrice,
            highPrice: stats.highPrice,
            offerCount: stats.count,
            availability: 'https://schema.org/InStock',
            url: 'https://bbsflooring.ca/products',
          },
        }} />
      )}
      <Suspense><Breadcrumbs items={[{ label: 'Home', url: '/' }, { label: 'All Products' }]} /></Suspense>

      {/* ── SSR Page Header ── */}
      <div className="mb-3 sm:mb-5">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800">All Products</h1>
        <p className="text-slate-600 mt-2 max-w-3xl">
          Browse 1,000+ flooring products from 15+ brands — engineered hardwood, solid hardwood, luxury vinyl plank,
          and laminate. All available from our Markham showroom at 6061 Highway 7, with professional installation
          across the GTA. Use the filters to narrow by category, brand, species, price, and more.
        </p>
      </div>

      {/* ── SSR Category Quick Links ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { href: '/engineered-hardwood', label: 'Engineered Hardwood' },
          { href: '/solid-hardwood', label: 'Solid Hardwood' },
          { href: '/vinyl', label: 'Vinyl / LVP' },
          { href: '/laminate', label: 'Laminate' },
          { href: '/waterproof-flooring', label: 'Waterproof Flooring' },
          { href: '/clearance', label: '🔥 Clearance Sale' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-sm px-3.5 py-1.5 rounded-full font-medium bg-white text-slate-600 border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-all"
          >
            {label}
          </Link>
        ))}
      </div>

      {/* ── Guided "help me choose" escape hatch (overload killer) ── */}
      <FloorFinderCTA />

      {/* ── Shop-by-need chips → pre-filtered grid states ── */}
      <GuidedUseCaseChips category="all" base="/products" />

      {/* ── Interactive Product Grid (client island) ── */}
      <Suspense fallback={serverGrid}>
        <ProductsClient initialProducts={products} serverGrid={serverGrid} />
      </Suspense>

      {/* ── SSR Bottom SEO Content ── */}
      <div className="mt-12 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-3">Premium Flooring in Markham &amp; the GTA</h2>
        <div className="space-y-2 text-slate-600 leading-relaxed text-sm">
          <p>
            BBS Flooring stocks over 1,000 products across{' '}
            <Link href="/solid-hardwood" className="text-amber-600 hover:underline">solid hardwood</Link>,{' '}
            <Link href="/engineered-hardwood" className="text-amber-600 hover:underline">engineered hardwood</Link>,{' '}
            <Link href="/vinyl" className="text-amber-600 hover:underline">luxury vinyl plank</Link>,{' '}
            <Link href="/laminate" className="text-amber-600 hover:underline">laminate</Link>, and{' '}
            <Link href="/waterproof-flooring" className="text-amber-600 hover:underline">waterproof flooring</Link>{' '}
            — all available from our showroom at 6061 Highway 7, Unit B, Markham.
          </p>
          <p>
            Every product includes transparent per-sqft pricing and a built-in cost calculator.{' '}
            <Link href="/free-measurement" className="text-amber-600 hover:underline">Book a free in-home measurement</Link>{' '}
            and our team will recommend the best option for your space, budget, and lifestyle.
          </p>
        </div>
      </div>
    </div>
  );
}
