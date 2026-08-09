import { Suspense } from 'react';
import { whiteOakFlooringData } from '@/data/landingPages';
import BrandLandingServer from '@/components/BrandLandingServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid, deriveOfferStats } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 3600; // 1-hour ISR (was 5-min; prices change a few times/mo, force-refresh via /api/revalidate after reconcile)

export const metadata = {
  title: whiteOakFlooringData.title,
  description: whiteOakFlooringData.description,
};

export default async function WhiteOakFlooringPage() {
  const [products, allForStats] = await Promise.all([
    getProductsForGrid({ limit: 100 }),
    getProductsForGrid({ limit: 1000 }),
  ]);
  const serverGrid = <ProductGridServer products={products} />;
  const filtered = typeof whiteOakFlooringData.productFilter === 'function'
    ? allForStats.filter(whiteOakFlooringData.productFilter)
    : allForStats;
  const stats = deriveOfferStats(filtered);
  return (
    <>
      <JsonLd data={[
        faqSchema(whiteOakFlooringData.faqItems),
        ...(stats ? [{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'White Oak Flooring',
          description: `${stats.count} white oak flooring options — engineered and solid white oak in a range of finishes and grades. Serving the Greater Toronto Area.`,
          category: 'White Oak Flooring',
          brand: { '@type': 'Brand', name: 'BBS Flooring' },
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'CAD',
            lowPrice: stats.lowPrice,
            highPrice: stats.highPrice,
            offerCount: stats.count,
            availability: 'https://schema.org/InStock',
            url: 'https://bbsflooring.ca/white-oak-flooring',
          },
        }] : []),
      ]} />
      <BrandLandingServer
        {...whiteOakFlooringData}
        brandKey="white-oak"
        initialProducts={products}
        serverGrid={serverGrid}
      />
    </>
  );
}
