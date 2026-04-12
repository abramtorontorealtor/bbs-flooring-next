import { Suspense } from 'react';
import { waterproofFlooringData } from '@/data/landingPages';
import WaterproofFlooringClient from '@/components/WaterproofFlooringClient';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: waterproofFlooringData.title,
  description: waterproofFlooringData.description,
  alternates: { canonical: '/waterproof-flooring' },
};

export default async function WaterproofFlooringPage() {
  const products = await getProductsForGrid();
  return (
    <>
      <JsonLd data={faqSchema(waterproofFlooringData.faqItems)} />
      <Suspense fallback={<ProductGridServer products={products} />}><WaterproofFlooringClient initialProducts={products} serverGrid={<ProductGridServer products={products} />} /></Suspense>
    </>
  );
}
