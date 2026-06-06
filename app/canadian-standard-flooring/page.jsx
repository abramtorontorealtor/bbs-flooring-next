import { Suspense } from 'react';
import { canadianStandardFlooringData } from '@/data/brandPages';
import BrandLandingServer from '@/components/BrandLandingServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: canadianStandardFlooringData.title,
  description: canadianStandardFlooringData.description,
};

export default async function CanadianStandardFlooringPage() {
  const products = await getProductsForGrid({ brand: 'Canadian Standard' });
  const serverGrid = <ProductGridServer products={products} />;
  return (
    <>
      <JsonLd data={faqSchema(canadianStandardFlooringData.faqItems)} />
      <BrandLandingServer
        {...canadianStandardFlooringData}
        brandKey="canadian-standard"
        initialProducts={products}
        serverGrid={serverGrid}
      />
    </>
  );
}
