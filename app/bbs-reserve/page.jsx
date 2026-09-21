import { Suspense } from 'react';
import { bbsReserveData } from '@/data/brandPages';
import BrandLandingServer from '@/components/BrandLandingServer';
import { faqSchema, brandAggregateOfferSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 3600; // 1-hour ISR (prices change a few times/mo, force-refresh via /api/revalidate after reconcile)

export const metadata = {
  title: bbsReserveData.title,
  description: bbsReserveData.description,
  alternates: { canonical: '/bbs-reserve' },
};

export default async function BbsReservePage() {
  const allReserve = await getProductsForGrid({ brand: 'BBS Reserve' });
  // Only in-stock SKUs may show/schema-count.
  const products = allReserve.filter((p) => p.in_stock !== false);
  const serverGrid = <ProductGridServer products={products} />;

  // AggregateOffer signal — derive live from the visible-price BBS Reserve catalog
  const prices = products
    .filter((p) => !p.is_variant && !p.hide_price)
    .map((p) => Number(p.sale_price_per_sqft ?? p.price_per_sqft))
    .filter((n) => Number.isFinite(n) && n > 0);
  const offerSchema = prices.length
    ? brandAggregateOfferSchema({
        name: 'BBS Reserve — Engineered Oak & 7mm Vinyl',
        description: bbsReserveData.description,
        url: 'https://bbsflooring.ca/bbs-reserve',
        lowPrice: Math.min(...prices).toFixed(2),
        highPrice: Math.max(...prices).toFixed(2),
        offerCount: prices.length,
        image: products.find((p) => p.image_url)?.image_url,
        brandName: 'BBS Reserve',
      })
    : null;

  return (
    <>
      <JsonLd data={faqSchema(bbsReserveData.faqItems)} />
      <JsonLd data={offerSchema} />
      <BrandLandingServer
        {...bbsReserveData}
        brandKey="bbs-reserve"
        initialProducts={products}
        serverGrid={serverGrid}
      />
    </>
  );
}
