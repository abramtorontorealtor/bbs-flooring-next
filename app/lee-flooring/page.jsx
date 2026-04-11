import { Suspense } from 'react';
import { leeFlooringData } from '@/data/brandPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: leeFlooringData.title,
  description: leeFlooringData.description,
};

export default async function LeeFlooringPage() {
  const products = await getProductsForGrid({ brand: 'Lee' });
  return (
    <>
      <JsonLd data={faqSchema(leeFlooringData.faqItems)} />
      <Suspense><BrandLandingClient brandKey="lee" initialProducts={products} /></Suspense>
    </>
  );
}
