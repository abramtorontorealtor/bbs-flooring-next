import { Suspense } from 'react';
import { wodenFlooringData } from '@/data/brandPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: wodenFlooringData.title,
  description: wodenFlooringData.description,
};

export default async function WodenFlooringPage() {
  const products = await getProductsForGrid({ brand: 'Woden' });
  return (
    <>
      <JsonLd data={faqSchema(wodenFlooringData.faqItems)} />
      <Suspense><BrandLandingClient brandKey="woden" initialProducts={products} /></Suspense>
    </>
  );
}
