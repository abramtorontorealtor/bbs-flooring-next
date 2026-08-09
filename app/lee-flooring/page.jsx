import { Suspense } from 'react';
import { leeFlooringData } from '@/data/brandPages';
import BrandLandingServer from '@/components/BrandLandingServer';
import { faqSchema, brandAggregateOfferSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 3600; // 1-hour ISR (was 5-min; prices change a few times/mo, force-refresh via /api/revalidate after reconcile)

export const metadata = {
  title: leeFlooringData.title,
  description: leeFlooringData.description,
  alternates: { canonical: '/lee-flooring' },
};

export default async function LeeFlooringPage() {
  const products = await getProductsForGrid({ brand: 'Lee' });
  const serverGrid = <ProductGridServer products={products} />;

  // AggregateOffer signal — derive live from the Lee clearance catalog
  const leePrices = products
    .filter((p) => !p.is_variant && !p.hide_price)
    .map((p) => Number(p.sale_price_per_sqft ?? p.price_per_sqft))
    .filter((n) => Number.isFinite(n) && n > 0);
  const offerSchema = leePrices.length
    ? brandAggregateOfferSchema({
        name: 'Lee Flooring Clearance — Engineered Oak & 7mm Vinyl',
        description: leeFlooringData.description,
        url: 'https://bbsflooring.ca/lee-flooring',
        lowPrice: Math.min(...leePrices).toFixed(2),
        highPrice: Math.max(...leePrices).toFixed(2),
        offerCount: leePrices.length,
        image: products.find((p) => p.image_url)?.image_url,
      })
    : null;

  return (
    <>
      <JsonLd data={faqSchema(leeFlooringData.faqItems)} />
      <JsonLd data={offerSchema} />
      <BrandLandingServer
        {...leeFlooringData}
        brandKey="lee"
        initialProducts={products}
        serverGrid={serverGrid}
      />
    </>
  );
}
