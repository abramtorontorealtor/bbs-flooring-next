import { Suspense } from 'react';
import { basementFlooringData } from '@/data/landingPages';
import BrandLandingServer from '@/components/BrandLandingServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 300;

export const metadata = {
  title: basementFlooringData.title,
  description: basementFlooringData.description,
};

export default async function BasementFlooringPage() {
  const products = await getProductsForGrid({ category: 'vinyl' });
  const serverGrid = <ProductGridServer products={products} />;
  return (
    <>
      <JsonLd data={faqSchema(basementFlooringData.faqItems)} />
      <BrandLandingServer
        {...basementFlooringData}
        brandKey="basement"
        initialProducts={products}
        serverGrid={serverGrid}
      />
    </>
  );
}
