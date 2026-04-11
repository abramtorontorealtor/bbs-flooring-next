import { Suspense } from 'react';
import LaminateClient from '@/components/LaminateClient';
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
  return (
    <>
      <JsonLd data={faqSchema(LAMINATE_FAQS)} />
      <Suspense><LaminateClient initialProducts={products} /></Suspense>
    </>
  );
}
