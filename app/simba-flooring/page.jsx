import { Suspense } from 'react';
import { simbaFlooringData } from '@/data/brandPages';
import BrandLandingServer from '@/components/BrandLandingServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: simbaFlooringData.title,
  description: simbaFlooringData.description,
};

export default async function SimbaFlooringPage() {
  const products = await getProductsForGrid({ brand: 'Simba' });
  const serverGrid = <ProductGridServer products={products} />;
  return (
    <>
      <JsonLd data={faqSchema(simbaFlooringData.faqItems)} />
      <BrandLandingServer
        {...simbaFlooringData}
        brandKey="simba"
        initialProducts={products}
        serverGrid={serverGrid}
      />
    </>
  );
}
