import { Suspense } from 'react';
import { basementFlooringData } from '@/data/landingPages';
import BasementFlooringClient from '@/components/BasementFlooringClient';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: basementFlooringData.title,
  description: basementFlooringData.description,
  alternates: { canonical: '/basement-flooring' },
};

export default async function BasementFlooringPage() {
  const products = await getProductsForGrid();
  return (
    <>
      <JsonLd data={faqSchema(basementFlooringData.faqItems)} />
      <Suspense><BasementFlooringClient initialProducts={products} serverGrid={<ProductGridServer products={products} />} /></Suspense>
    </>
  );
}
