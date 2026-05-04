import { Suspense } from 'react';
import VinylClient from '@/components/VinylClient';
import ProductGridServer from '@/components/ProductGridServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { VINYL_FAQS } from '@/data/faqs';
import { getProductsForGrid } from '@/lib/products-server';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: 'Vinyl Flooring Markham | LVP & SPC Waterproof',
  description:
    'Shop luxury vinyl plank (LVP) and SPC waterproof flooring in Markham. 100+ styles from $1.79/sqft. Perfect for basements, kitchens, bathrooms. Free measurements. Call (647) 428-1111.',
  alternates: { canonical: '/vinyl' },
};

export default async function VinylPage() {
  const products = await getProductsForGrid({ category: 'vinyl' });
  const serverGrid = <ProductGridServer products={products} />;
  return (
    <>
      <JsonLd data={[
        faqSchema(VINYL_FAQS),
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Vinyl LVP & SPC Flooring',
          description: '188 waterproof vinyl flooring options (LVP/SPC) from 6 brands. 100% waterproof, click-lock installation. Serving the Greater Toronto Area.',
          category: 'Vinyl Flooring',
          brand: { '@type': 'Brand', name: 'BBS Flooring' },
          additionalProperty: { '@type': 'PropertyValue', name: 'Waterproof', value: 'Yes — 100% permanently waterproof' },
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'CAD',
            lowPrice: '2.19',
            highPrice: '3.59',
            offerCount: 188,
            availability: 'https://schema.org/InStock',
            url: 'https://bbsflooring.ca/vinyl',
          },
        },
      ]} />
      <Suspense fallback={serverGrid}>
        <VinylClient initialProducts={products} serverGrid={serverGrid} />
      </Suspense>
    </>
  );
}
