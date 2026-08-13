import { Suspense } from 'react';
import { waterproofFlooringData } from '@/data/landingPages';
import BrandLandingServer from '@/components/BrandLandingServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid, deriveOfferStats } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';
import FloorFinderCTA from '@/components/FloorFinderCTA';
import GuidedUseCaseChips from '@/components/GuidedUseCaseChips';

export const revalidate = 3600; // 1-hour ISR (was 5-min; prices change a few times/mo, force-refresh via /api/revalidate after reconcile)

export const metadata = {
  title: waterproofFlooringData.title,
  description: waterproofFlooringData.description,
  alternates: { canonical: '/waterproof-flooring' },
};

export default async function WaterproofFlooringPage() {
  const [products, allForStats] = await Promise.all([
    getProductsForGrid({ limit: 100 }),
    getProductsForGrid({ limit: 1000 }),
  ]);
  const serverGrid = <ProductGridServer products={products} />;
  const filtered = typeof waterproofFlooringData.productFilter === 'function'
    ? allForStats.filter(waterproofFlooringData.productFilter)
    : allForStats;
  const stats = deriveOfferStats(filtered);
  return (
    <>
      <JsonLd data={[
        faqSchema(waterproofFlooringData.faqItems),
        ...(stats ? [{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Waterproof Flooring',
          description: `${stats.count} 100% waterproof flooring options (vinyl LVP/SPC and waterproof laminate) for basements, kitchens, and bathrooms. Serving the Greater Toronto Area.`,
          category: 'Waterproof Flooring',
          brand: { '@type': 'Brand', name: 'BBS Flooring' },
          additionalProperty: { '@type': 'PropertyValue', name: 'Waterproof', value: 'Yes — 100% permanently waterproof' },
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'CAD',
            lowPrice: stats.lowPrice,
            highPrice: stats.highPrice,
            offerCount: stats.count,
            availability: 'https://schema.org/InStock',
            url: 'https://bbsflooring.ca/waterproof-flooring',
          },
        }] : []),
      ]} />
      <BrandLandingServer
        {...waterproofFlooringData}
        brandKey="waterproof"
        initialProducts={products}
        serverGrid={serverGrid}
        guidedNav={
          <>
            <FloorFinderCTA context="waterproof floor" />
            <GuidedUseCaseChips category="waterproof" base="/products" heading="Shop waterproof by need" />
          </>
        }
      />
    </>
  );
}
