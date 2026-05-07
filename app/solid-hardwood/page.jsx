import { Suspense } from 'react';
import SolidHardwoodClient from '@/components/SolidHardwoodClient';
import ProductGridServer from '@/components/ProductGridServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { SOLID_HARDWOOD_FAQS } from '@/data/faqs';
import { getProductsForGrid } from '@/lib/products-server';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: 'Solid Hardwood Flooring Markham | Oak, Maple & Hickory from $4.29/sqft',
  description:
    'Shop solid hardwood flooring in Markham from $4.29/sqft. Red oak, white oak, maple, hickory — ¾" nail-down hardwood in stock. Expert installation across Toronto & GTA. Free measurements. Call (647) 428-1111.',
  alternates: { canonical: '/solid-hardwood' },
};

export default async function SolidHardwoodPage() {
  const products = await getProductsForGrid({ category: 'solid_hardwood' });
  const serverGrid = <ProductGridServer products={products} />;
  return (
    <>
      <JsonLd data={[
        faqSchema(SOLID_HARDWOOD_FAQS),
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Solid Hardwood Flooring',
          description: '75 solid hardwood flooring options from 4 Canadian brands. ¾" thick, refinishable 5-7 times. Serving the Greater Toronto Area.',
          category: 'Solid Hardwood',
          brand: { '@type': 'Brand', name: 'BBS Flooring' },
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'CAD',
            lowPrice: '5.10',
            highPrice: '7.25',
            offerCount: 75,
            availability: 'https://schema.org/InStock',
            url: 'https://bbsflooring.ca/solid-hardwood',
          },
        },
      ]} />
      <Suspense fallback={serverGrid}>
        <SolidHardwoodClient initialProducts={products} serverGrid={serverGrid} />
      </Suspense>
    </>
  );
}
