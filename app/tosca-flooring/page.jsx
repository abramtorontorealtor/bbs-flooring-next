import { Suspense } from 'react';
import { toscaFlooringData } from '@/data/brandPages';
import BrandLandingServer from '@/components/BrandLandingServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 3600; // 1-hour ISR (was 5-min; prices change a few times/mo, force-refresh via /api/revalidate after reconcile)

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
