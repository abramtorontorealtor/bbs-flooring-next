import { Suspense } from 'react';
import SolidHardwoodClient from '@/components/SolidHardwoodClient';
import ProductGridServer from '@/components/ProductGridServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { SOLID_HARDWOOD_FAQS } from '@/data/faqs';
import { getProductsForGrid, getCategoryPriceStats } from '@/lib/products-server';

export const revalidate = 300; // 5-minute ISR

export async function generateMetadata() {
  const stats = await getCategoryPriceStats('solid_hardwood');
  return {
    title: `Solid Hardwood Flooring Markham | Oak, Maple & Hickory from $${stats.lowPrice}/sqft`,
    description: `Shop solid hardwood flooring in Markham from $${stats.lowPrice}/sqft. Red oak, white oak, maple, hickory — ¾" nail-down hardwood in stock. Expert installation across Toronto & GTA. Free measurements. Call (647) 428-1111.`,
    alternates: { canonical: '/solid-hardwood' },
  };
}

export default async function SolidHardwoodPage() {
  const [products, stats] = await Promise.all([
    getProductsForGrid({ category: 'solid_hardwood' }),
    getCategoryPriceStats('solid_hardwood'),
  ]);
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
      <Suspense fallback={serverGrid}>
        <SolidHardwoodClient initialProducts={products} serverGrid={serverGrid} priceStats={stats} />
      </Suspense>
    </>
  );
}
