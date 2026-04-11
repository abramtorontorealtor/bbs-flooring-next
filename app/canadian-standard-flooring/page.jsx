import { Suspense } from 'react';
import { canadianStandardFlooringData } from '@/data/brandPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: canadianStandardFlooringData.title,
  description: canadianStandardFlooringData.description,
};

export default async function CanadianStandardFlooringPage() {
  const products = await getProductsForGrid({ brand: 'Canadian Standard' });
  return (
    <>
      <JsonLd data={faqSchema(canadianStandardFlooringData.faqItems)} />
      <Suspense><BrandLandingClient brandKey="canadian-standard" initialProducts={products} /></Suspense>
    </>
  );
}
