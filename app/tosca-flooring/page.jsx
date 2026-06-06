import { Suspense } from 'react';
import { toscaFlooringData } from '@/data/brandPages';
import BrandLandingServer from '@/components/BrandLandingServer';
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
  const serverGrid = <ProductGridServer products={products} />;
  return (
    <>
      <JsonLd data={faqSchema(toscaFlooringData.faqItems)} />
      <BrandLandingServer
        {...toscaFlooringData}
        brandKey="tosca"
        initialProducts={products}
        serverGrid={serverGrid}
      />
    </>
  );
}
