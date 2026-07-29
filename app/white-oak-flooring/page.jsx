import { Suspense } from 'react';
import { whiteOakFlooringData } from '@/data/landingPages';
import BrandLandingServer from '@/components/BrandLandingServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 3600; // 1-hour ISR (was 5-min; prices change a few times/mo, force-refresh via /api/revalidate after reconcile)

export const metadata = {
  title: whiteOakFlooringData.title,
  description: whiteOakFlooringData.description,
};

export default async function WhiteOakFlooringPage() {
  const products = await getProductsForGrid({ limit: 100 });
  const serverGrid = <ProductGridServer products={products} />;
  return (
    <>
      <JsonLd data={faqSchema(whiteOakFlooringData.faqItems)} />
      <BrandLandingServer
        {...whiteOakFlooringData}
        brandKey="white-oak"
        initialProducts={products}
        serverGrid={serverGrid}
      />
    </>
  );
}
