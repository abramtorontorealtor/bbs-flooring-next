import { Suspense } from 'react';
import { whiteOakFlooringData } from '@/data/landingPages';
import WhiteOakFlooringClient from '@/components/WhiteOakFlooringClient';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: whiteOakFlooringData.title,
  description: whiteOakFlooringData.description,
};

export default async function WhiteOakFlooringPage() {
  const products = await getProductsForGrid();
  return (
    <>
      <JsonLd data={faqSchema(whiteOakFlooringData.faqItems)} />
      <Suspense><WhiteOakFlooringClient initialProducts={products} /></Suspense>
    </>
  );
}
