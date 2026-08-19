import { Suspense } from 'react';
import ClearanceClient from '@/components/ClearanceClient';
import { getClearanceProducts } from '@/lib/products-server';
import { brandAggregateOfferSchema, JsonLd } from '@/lib/schemas';

export const revalidate = 3600; // 1-hour ISR; refresh via /api/revalidate after price reconciles

export const metadata = {
  title: 'Vinyl & Hardwood Flooring Clearance Sale — From $1.79/sqft',
  description:
    'Shop flooring sale and clearance in Markham. First-quality engineered hardwood, vinyl, and laminate — up to 30% off. Premium brands at better prices. Call (647) 428-1111.',
  alternates: { canonical: '/clearance' },
};

export default async function ClearancePage() {
  // Fetch clearance/sale products SERVER-SIDE so the grid + prices render in the
  // initial HTML (crawler- and AI-visible). ClearanceClient still hydrates on top
  // for interactive filtering/sorting.
  const all = await getClearanceProducts();
  const products = all.filter((p) => p.in_stock !== false);

  // AggregateOffer signal derived live from the in-stock clearance catalog.
  const prices = products
    .filter((p) => !p.is_variant && !p.hide_price)
    .map((p) => Number(p.sale_price_per_sqft ?? p.price_per_sqft))
    .filter((n) => Number.isFinite(n) && n > 0);
  const offerSchema = prices.length
    ? brandAggregateOfferSchema({
        name: 'BBS Flooring Clearance — Engineered Hardwood, Vinyl & Laminate',
        description:
          'First-quality flooring clearance in Markham — engineered hardwood, luxury vinyl, and laminate at up to 30% off.',
        url: 'https://bbsflooring.ca/clearance',
        lowPrice: Math.min(...prices).toFixed(2),
        highPrice: Math.max(...prices).toFixed(2),
        offerCount: prices.length,
        image: products.find((p) => p.image_url)?.image_url,
        brandName: null, // mixed-brand clearance — no single Brand (D2)
      })
    : null;

  return (
    <>
      <JsonLd data={offerSchema} />
      {/* ClearanceClient is seeded with server-fetched products, so its grid renders
          in the initial SSR HTML (crawler-visible, no empty-page problem, no loading flash),
          then hydrates for interactive filtering. */}
      <Suspense>
        <ClearanceClient initialProducts={products} />
      </Suspense>
    </>
  );
}
