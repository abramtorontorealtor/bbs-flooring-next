import { Suspense } from 'react';
import { toscaFlooringData } from '@/data/brandPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: toscaFlooringData.title,
  description: toscaFlooringData.description,
};

export default async function ToscaFlooringPage() {
  const products = await getProductsForGrid({ brand: 'Tosca' });
  return (
    <>
      <JsonLd data={faqSchema(toscaFlooringData.faqItems)} />
      <Suspense><BrandLandingClient brandKey="tosca" initialProducts={products} serverGrid={<ProductGridServer products={products} />} /></Suspense>
    </>
  );
}
