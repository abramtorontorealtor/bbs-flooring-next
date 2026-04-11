import { Suspense } from 'react';
import { vidarFlooringData } from '@/data/landingPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: vidarFlooringData.title,
  description: vidarFlooringData.description,
};

export default async function VidarFlooringPage() {
  const products = await getProductsForGrid({ brand: 'Vidar' });
  return (
    <>
      <JsonLd data={faqSchema(vidarFlooringData.faqItems)} />
      <Suspense><BrandLandingClient brandKey="vidar" initialProducts={products} /></Suspense>
    </>
  );
}
