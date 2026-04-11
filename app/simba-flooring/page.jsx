import { Suspense } from 'react';
import { simbaFlooringData } from '@/data/brandPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: simbaFlooringData.title,
  description: simbaFlooringData.description,
};

export default async function SimbaFlooringPage() {
  const products = await getProductsForGrid({ brand: 'Simba' });
  return (
    <>
      <JsonLd data={faqSchema(simbaFlooringData.faqItems)} />
      <Suspense><BrandLandingClient brandKey="simba" initialProducts={products} /></Suspense>
    </>
  );
}
