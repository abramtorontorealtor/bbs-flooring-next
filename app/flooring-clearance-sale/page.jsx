import { Suspense } from 'react';
import { flooringClearanceSaleData } from '@/data/landingPages';
import BrandLandingServer from '@/components/BrandLandingServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 300;

export const metadata = {
  title: flooringClearanceSaleData.title,
  description: flooringClearanceSaleData.description,
};

export default async function FlooringClearanceSalePage() {
  const products = await getProductsForGrid({ limit: 100 });
  const serverGrid = <ProductGridServer products={products} />;
  return (
    <>
      <JsonLd data={faqSchema(flooringClearanceSaleData.faqItems)} />
      <BrandLandingServer
        {...flooringClearanceSaleData}
        brandKey="clearance-sale"
        initialProducts={products}
        serverGrid={serverGrid}
      />
    </>
  );
}
