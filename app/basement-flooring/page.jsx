import { Suspense } from 'react';
import { basementFlooringData } from '@/data/landingPages';
import BrandLandingServer from '@/components/BrandLandingServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 3600; // 1-hour ISR (was 5-min; prices change a few times/mo, force-refresh via /api/revalidate after reconcile)

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
