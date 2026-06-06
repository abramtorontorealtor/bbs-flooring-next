import { Suspense } from 'react';
import { goldenChoiceFlooringData } from '@/data/brandPages';
import BrandLandingServer from '@/components/BrandLandingServer';
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
  const serverGrid = <ProductGridServer products={products} />;
  return (
    <>
      <JsonLd data={faqSchema(goldenChoiceFlooringData.faqItems)} />
      <BrandLandingServer
        {...goldenChoiceFlooringData}
        brandKey="golden-choice"
        initialProducts={products}
        serverGrid={serverGrid}
      />
    </>
  );
}
