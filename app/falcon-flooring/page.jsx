import { Suspense } from 'react';
import { falconFlooringData } from '@/data/brandPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: falconFlooringData.title,
  description: falconFlooringData.description,
};

export default async function FalconFlooringPage() {
  const products = await getProductsForGrid({ brand: 'Falcon' });
  return (
    <>
      <JsonLd data={faqSchema(falconFlooringData.faqItems)} />
      <Suspense><BrandLandingClient brandKey="falcon" initialProducts={products} /></Suspense>
    </>
  );
}
