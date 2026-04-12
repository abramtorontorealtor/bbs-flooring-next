import { Suspense } from 'react';
import { goldenChoiceFlooringData } from '@/data/brandPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: goldenChoiceFlooringData.title,
  description: goldenChoiceFlooringData.description,
};

export default async function GoldenChoiceFlooringPage() {
  const products = await getProductsForGrid({ brand: 'Golden Choice' });
  return (
    <>
      <JsonLd data={faqSchema(goldenChoiceFlooringData.faqItems)} />
      <Suspense><BrandLandingClient brandKey="golden-choice" initialProducts={products} serverGrid={<ProductGridServer products={products} />} /></Suspense>
    </>
  );
}
