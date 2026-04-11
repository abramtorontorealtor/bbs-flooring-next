import { Suspense } from 'react';
import { evergreenFlooringData } from '@/data/brandPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: evergreenFlooringData.title,
  description: evergreenFlooringData.description,
};

export default async function EvergreenFlooringPage() {
  const products = await getProductsForGrid({ brand: 'Evergreen' });
  return (
    <>
      <JsonLd data={faqSchema(evergreenFlooringData.faqItems)} />
      <Suspense><BrandLandingClient brandKey="evergreen" initialProducts={products} /></Suspense>
    </>
  );
}
