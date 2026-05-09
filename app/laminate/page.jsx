import { Suspense } from 'react';
import LaminateClient from '@/components/LaminateClient';
import ProductGridServer from '@/components/ProductGridServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { LAMINATE_FAQS } from '@/data/faqs';
import { getProductsForGrid, getCategoryPriceStats } from '@/lib/products-server';

export const revalidate = 300; // 5-minute ISR

export async function generateMetadata() {
  const stats = await getCategoryPriceStats('laminate');
  return {
    title: `Laminate Flooring Markham | 12mm from $${stats.lowPrice}/sqft`,
    description: `Shop premium 12mm laminate flooring in Markham. AC4/AC5 rated, water-resistant, from $${stats.lowPrice}/sqft. 500 sqft installed from $${(500 * parseFloat(stats.lowPrice) + 1000).toLocaleString('en-CA', { maximumFractionDigits: 0 })}. Free measurements. Call (647) 428-1111.`,
    alternates: { canonical: '/laminate' },
  };
}

export default async function LaminatePage() {
  const [products, stats] = await Promise.all([
    getProductsForGrid({ category: 'laminate' }),
    getCategoryPriceStats('laminate'),
  ]);
  const serverGrid = <ProductGridServer products={products} />;
  return (
    <>
      <JsonLd data={[
        faqSchema(LAMINATE_FAQS),
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Laminate Flooring',
          description: `${stats.count} laminate flooring options from 8 brands. AC3–AC5 rated, from $${stats.lowPrice}/sqft. Serving the Greater Toronto Area.`,
          category: 'Laminate',
          brand: { '@type': 'Brand', name: 'BBS Flooring' },
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'CAD',
            lowPrice: stats.lowPrice,
            highPrice: stats.highPrice,
            offerCount: stats.count,
            availability: 'https://schema.org/InStock',
            url: 'https://bbsflooring.ca/laminate',
          },
        },
      ]} />
      <Suspense fallback={serverGrid}>
        <LaminateClient initialProducts={products} serverGrid={serverGrid} priceStats={stats} />
      </Suspense>
    </>
  );
}
