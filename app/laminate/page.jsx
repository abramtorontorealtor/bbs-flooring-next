import { Suspense } from 'react';
import LaminateClient from '@/components/LaminateClient';
import ProductGridServer from '@/components/ProductGridServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { LAMINATE_FAQS } from '@/data/faqs';
import { getProductsForGrid } from '@/lib/products-server';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: 'Laminate Flooring Markham | 12mm from $1.49/sqft',
  description:
    'Shop premium 12mm laminate flooring in Markham. AC4/AC5 rated, water-resistant, from $1.49/sqft. 500 sqft installed from $1,745. Free measurements. Call (647) 428-1111.',
  alternates: { canonical: '/laminate' },
};

export default async function LaminatePage() {
  const products = await getProductsForGrid({ category: 'laminate' });
  const serverGrid = <ProductGridServer products={products} />;
  return (
    <>
      <JsonLd data={[
        faqSchema(LAMINATE_FAQS),
        {
          '@context': 'https://schema.org',
          '@type': 'OfferCatalog',
          name: 'Laminate Flooring at BBS Flooring',
          description: '99 laminate flooring options from 8 brands. AC3–AC5 rated, from $1.49/sqft. Serving the Greater Toronto Area.',
          numberOfItems: 99,
          itemListElement: [{
            '@type': 'AggregateOffer',
            priceCurrency: 'CAD',
            lowPrice: '1.49',
            highPrice: '3.29',
            offerCount: 99,
            itemOffered: {
              '@type': 'Product',
              name: 'Laminate Flooring',
              category: 'Laminate',
            },
          }],
        },
      ]} />
      <Suspense fallback={serverGrid}>
        <LaminateClient initialProducts={products} serverGrid={serverGrid} />
      </Suspense>
    </>
  );
}
