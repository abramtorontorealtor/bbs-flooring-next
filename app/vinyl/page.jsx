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
  return (
    <>
      <JsonLd data={faqSchema(VINYL_FAQS)} />
      <Suspense>
        <VinylClient
          initialProducts={products}
          serverGrid={<ProductGridServer products={products} />}
        />
      </Suspense>
    </>
  );
}
