import { Suspense } from 'react';
import { appalachianFlooringData } from '@/data/brandPages';
import BrandLandingServer from '@/components/BrandLandingServer';
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
  const serverGrid = <ProductGridServer products={products} />;
  return (
    <>
      <JsonLd data={faqSchema(appalachianFlooringData.faqItems)} />
      <BrandLandingServer
        {...appalachianFlooringData}
        brandKey="appalachian"
        initialProducts={products}
        serverGrid={serverGrid}
      />
    </>
  );
}
