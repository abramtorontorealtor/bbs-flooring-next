import { Suspense } from 'react';
import { wickhamFlooringData } from '@/data/landingPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: wickhamFlooringData.title,
  description: wickhamFlooringData.description,
};

export default async function WickhamFlooringPage() {
  const products = await getProductsForGrid({ brand: 'Wickham' });
  return (
    <>
      <JsonLd data={faqSchema(wickhamFlooringData.faqItems)} />
      <Suspense fallback={<ProductGridServer products={products} />}><BrandLandingClient brandKey="wickham" initialProducts={products} serverGrid={<ProductGridServer products={products} />} /></Suspense>
    </>
  );
}
