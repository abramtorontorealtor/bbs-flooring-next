import { Suspense } from 'react';
import EngineeredHardwoodClient from '@/components/EngineeredHardwoodClient';
import ProductGridServer from '@/components/ProductGridServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { ENGINEERED_HARDWOOD_FAQS } from '@/data/faqs';
import { getProductsForGrid } from '@/lib/products-server';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: 'Engineered Hardwood Flooring Markham | From $3.69/sqft | Vidar & Wickham',
  description:
    'Shop engineered hardwood flooring in Markham from $3.69/sqft. Vidar, Wickham, Triforest — wide-plank European oak in stock. Expert installation across Toronto & GTA. Free measurements. Call (647) 428-1111.',
  alternates: { canonical: '/engineered-hardwood' },
};

export default async function EngineeredHardwoodPage() {
  const products = await getProductsForGrid({ category: 'engineered_hardwood' });
  const serverGrid = <ProductGridServer products={products} />;
  return (
    <>
      <JsonLd data={[
        faqSchema(ENGINEERED_HARDWOOD_FAQS),
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Engineered Hardwood Flooring',
          description: '258+ engineered hardwood flooring options from 8 brands including Northernest, NAF, Canadian Standard, and Vidar. Serving the Greater Toronto Area.',
          category: 'Engineered Hardwood',
          brand: { '@type': 'Brand', name: 'BBS Flooring' },
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'CAD',
            lowPrice: '3.69',
            highPrice: '7.59',
            offerCount: 258,
            availability: 'https://schema.org/InStock',
            url: 'https://bbsflooring.ca/engineered-hardwood',
          },
        },
      ]} />
      <Suspense fallback={serverGrid}>
        <EngineeredHardwoodClient initialProducts={products} serverGrid={serverGrid} />
      </Suspense>
    </>
  );
}
