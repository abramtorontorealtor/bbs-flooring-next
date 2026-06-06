import { Suspense } from 'react';
import { vidarFlooringData } from '@/data/landingPages';
import BrandLandingServer from '@/components/BrandLandingServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: vidarFlooringData.title,
  description: vidarFlooringData.description,
};

export default async function VidarFlooringPage() {
  const products = await getProductsForGrid({ brand: 'Vidar Design Flooring' });
  const serverGrid = <ProductGridServer products={products} />;
  return (
    <>
      <JsonLd data={faqSchema(vidarFlooringData.faqItems)} />
      <BrandLandingServer
        {...vidarFlooringData}
        brandKey="vidar"
        initialProducts={products}
        serverGrid={serverGrid}
      />
    </>
  );
}
