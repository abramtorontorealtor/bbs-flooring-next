import { Suspense } from 'react';
import { sherwoodFlooringData } from '@/data/brandPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: sherwoodFlooringData.title,
  description: sherwoodFlooringData.description,
};

export default async function SherwoodFlooringPage() {
  const products = await getProductsForGrid({ brand: 'Sherwood' });
  return (
    <>
      <JsonLd data={faqSchema(sherwoodFlooringData.faqItems)} />
      <Suspense fallback={<ProductGridServer products={products} />}><BrandLandingClient brandKey="sherwood" initialProducts={products} serverGrid={<ProductGridServer products={products} />} /></Suspense>
    </>
  );
}
