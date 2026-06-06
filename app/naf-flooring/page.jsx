import { Suspense } from 'react';
import { nafFlooringData } from '@/data/brandPages';
import BrandLandingServer from '@/components/BrandLandingServer';
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
  const serverGrid = <ProductGridServer products={products} />;
  return (
    <>
      <JsonLd data={faqSchema(nafFlooringData.faqItems)} />
      <BrandLandingServer
        {...nafFlooringData}
        brandKey="naf"
        initialProducts={products}
        serverGrid={serverGrid}
      />
    </>
  );
}
