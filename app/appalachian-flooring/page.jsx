import { Suspense } from 'react';
import { appalachianFlooringData } from '@/data/brandPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: appalachianFlooringData.title,
  description: appalachianFlooringData.description,
};

export default async function AppalachianFlooringPage() {
  const products = await getProductsForGrid({ brand: 'Appalachian' });
  return (
    <>
      <JsonLd data={faqSchema(appalachianFlooringData.faqItems)} />
      <Suspense><BrandLandingClient brandKey="appalachian" initialProducts={products} serverGrid={<ProductGridServer products={products} />} /></Suspense>
    </>
  );
}
