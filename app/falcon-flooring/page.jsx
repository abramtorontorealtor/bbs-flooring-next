import { Suspense } from 'react';
import { falconFlooringData } from '@/data/brandPages';
import BrandLandingServer from '@/components/BrandLandingServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: falconFlooringData.title,
  description: falconFlooringData.description,
};

export default async function FalconFlooringPage() {
  const products = await getProductsForGrid({ brand: 'Falcon' });
  const serverGrid = <ProductGridServer products={products} />;
  return (
    <>
      <JsonLd data={faqSchema(falconFlooringData.faqItems)} />
      <BrandLandingServer
        {...falconFlooringData}
        brandKey="falcon"
        initialProducts={products}
        serverGrid={serverGrid}
      />
    </>
  );
}
