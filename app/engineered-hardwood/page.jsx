import { Suspense } from 'react';
import EngineeredHardwoodClient from '@/components/EngineeredHardwoodClient';
import ProductGridServer from '@/components/ProductGridServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { ENGINEERED_HARDWOOD_FAQS } from '@/data/faqs';
import { getProductsForGrid, getCategoryPriceStats } from '@/lib/products-server';

export const revalidate = 300; // 5-minute ISR

export async function generateMetadata() {
  const stats = await getCategoryPriceStats('engineered_hardwood');
  return {
    title: `Engineered Hardwood Flooring Markham | From $${stats.lowPrice}/sqft | Vidar & Wickham`,
    description: `Shop engineered hardwood flooring in Markham from $${stats.lowPrice}/sqft. Vidar, Wickham, Triforest — wide-plank European oak in stock. Expert installation across Toronto & GTA. Free measurements. Call (647) 428-1111.`,
    alternates: { canonical: '/engineered-hardwood' },
  };
}

export default async function EngineeredHardwoodPage() {
  const [products, stats] = await Promise.all([
    getProductsForGrid({ category: 'engineered_hardwood' }),
    getCategoryPriceStats('engineered_hardwood'),
  ]);
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
      <Suspense fallback={serverGrid}>
        <EngineeredHardwoodClient initialProducts={products} serverGrid={serverGrid} priceStats={stats} />
      </Suspense>
    </>
  );
}
