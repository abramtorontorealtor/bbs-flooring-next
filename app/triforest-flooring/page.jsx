import { Suspense } from 'react';
import { triforestFlooringData } from '@/data/brandPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: triforestFlooringData.title,
  description: triforestFlooringData.description,
};

export default async function TriforestFlooringPage() {
  const products = await getProductsForGrid({ brand: 'Triforest' });
  return (
    <>
      <JsonLd data={faqSchema(triforestFlooringData.faqItems)} />
      <Suspense fallback={<ProductGridServer products={products} />}><BrandLandingClient brandKey="triforest" initialProducts={products} serverGrid={<ProductGridServer products={products} />} /></Suspense>
    </>
  );
}
