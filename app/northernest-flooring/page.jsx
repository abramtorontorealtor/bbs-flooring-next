import { Suspense } from 'react';
import { northernestFlooringData } from '@/data/brandPages';
import BrandLandingServer from '@/components/BrandLandingServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 3600; // 1-hour ISR (was 5-min; prices change a few times/mo, force-refresh via /api/revalidate after reconcile)

export const metadata = {
  title: northernestFlooringData.title,
  description: northernestFlooringData.description,
};

export default async function NorthernestFlooringPage() {
  const products = await getProductsForGrid({ brand: 'Northernest' });
  const serverGrid = <ProductGridServer products={products} />;
  return (
    <>
      <JsonLd data={faqSchema(northernestFlooringData.faqItems)} />
      <BrandLandingServer
        {...northernestFlooringData}
        brandKey="northernest"
        initialProducts={products}
        serverGrid={serverGrid}
      />
    </>
  );
}
