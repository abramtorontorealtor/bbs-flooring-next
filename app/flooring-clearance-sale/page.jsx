import { Suspense } from 'react';
import { flooringClearanceSaleData } from '@/data/landingPages';
import FlooringClearanceSaleClient from '@/components/FlooringClearanceSaleClient';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: flooringClearanceSaleData.title,
  description: flooringClearanceSaleData.description,
  alternates: { canonical: '/clearance' },
};

export default async function FlooringClearanceSalePage() {
  const products = await getProductsForGrid();
  return (
    <>
      <JsonLd data={faqSchema(flooringClearanceSaleData.faqItems)} />
      <Suspense><FlooringClearanceSaleClient initialProducts={products} serverGrid={<ProductGridServer products={products} />} /></Suspense>
    </>
  );
}
