import { Suspense } from 'react';
import { wickhamFlooringData } from '@/data/landingPages';
import BrandLandingServer from '@/components/BrandLandingServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 3600; // 1-hour ISR (was 5-min; prices change a few times/mo, force-refresh via /api/revalidate after reconcile)

export const metadata = {
  title: wickhamFlooringData.title,
  description: wickhamFlooringData.description,
};

export default async function WickhamFlooringPage() {
  const products = await getProductsForGrid({ brand: 'Wickham' });
  const serverGrid = <ProductGridServer products={products} />;
  return (
    <>
      <JsonLd data={faqSchema(wickhamFlooringData.faqItems)} />
      <BrandLandingServer
        {...wickhamFlooringData}
        brandKey="wickham"
        initialProducts={products}
        serverGrid={serverGrid}
      />
    </>
  );
}
