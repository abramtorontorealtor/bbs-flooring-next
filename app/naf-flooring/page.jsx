import { Suspense } from 'react';
import { nafFlooringData } from '@/data/brandPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: nafFlooringData.title,
  description: nafFlooringData.description,
};

export default async function NafFlooringPage() {
  const products = await getProductsForGrid({ brand: 'NAF' });
  return (
    <>
      <JsonLd data={faqSchema(nafFlooringData.faqItems)} />
      <Suspense><BrandLandingClient brandKey="naf" initialProducts={products} serverGrid={<ProductGridServer products={products} />} /></Suspense>
    </>
  );
}
