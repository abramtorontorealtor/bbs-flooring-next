import { Suspense } from 'react';
import { northernestFlooringData } from '@/data/brandPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: northernestFlooringData.title,
  description: northernestFlooringData.description,
};

export default async function NorthernestFlooringPage() {
  const products = await getProductsForGrid({ brand: 'Northernest' });
  return (
    <>
      <JsonLd data={faqSchema(northernestFlooringData.faqItems)} />
      <Suspense><BrandLandingClient brandKey="northernest" initialProducts={products} /></Suspense>
    </>
  );
}
