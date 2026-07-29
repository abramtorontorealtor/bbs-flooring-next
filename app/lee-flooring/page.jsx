import { Suspense } from 'react';
import { leeFlooringData } from '@/data/brandPages';
import BrandLandingServer from '@/components/BrandLandingServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 3600; // 1-hour ISR (was 5-min; prices change a few times/mo, force-refresh via /api/revalidate after reconcile)

export const metadata = {
  title: leeFlooringData.title,
  description: leeFlooringData.description,
};

export default async function LeeFlooringPage() {
  const products = await getProductsForGrid({ brand: 'Lee' });
  const serverGrid = <ProductGridServer products={products} />;
  return (
    <>
      <JsonLd data={faqSchema(leeFlooringData.faqItems)} />
      <BrandLandingServer
        {...leeFlooringData}
        brandKey="lee"
        initialProducts={products}
        serverGrid={serverGrid}
      />
    </>
  );
}
