import { Suspense } from 'react';
import EngineeredHardwoodClient from '@/components/EngineeredHardwoodClient';
import ProductGridServer from '@/components/ProductGridServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { ENGINEERED_HARDWOOD_FAQS } from '@/data/faqs';
import { getProductsForGrid } from '@/lib/products-server';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: 'Engineered Hardwood Flooring Markham | Vidar, Wickham & More',
  description:
    'Shop engineered hardwood flooring in Markham. Vidar, Wickham, wide-plank European oak. 100+ styles in stock. Free measurements across the GTA. Call (647) 428-1111.',
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
          '@type': 'OfferCatalog',
          name: 'Engineered Hardwood Flooring at BBS Flooring',
          description: '258+ engineered hardwood flooring options from 8 brands including Northernest, NAF, Canadian Standard, and Vidar. Serving the Greater Toronto Area.',
          numberOfItems: 258,
          itemListElement: [{
            '@type': 'AggregateOffer',
            priceCurrency: 'CAD',
            lowPrice: '3.69',
            highPrice: '7.59',
            offerCount: 258,
            itemOffered: {
              '@type': 'Product',
              name: 'Engineered Hardwood Flooring',
              category: 'Engineered Hardwood',
              brand: { '@type': 'Brand', name: 'Multiple Brands (Northernest, NAF, Canadian Standard, Woden, Simba, Lee, Falcon, Vidar)' },
            },
          }],
        },
      ]} />
      <Suspense fallback={serverGrid}>
        <EngineeredHardwoodClient initialProducts={products} serverGrid={serverGrid} />
      </Suspense>
    </>
  );
}
