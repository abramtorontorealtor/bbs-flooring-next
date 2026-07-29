import { Suspense } from 'react';
import { evergreenFlooringData } from '@/data/brandPages';
import BrandLandingServer from '@/components/BrandLandingServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 3600; // 1-hour ISR (was 5-min; prices change a few times/mo, force-refresh via /api/revalidate after reconcile)

export const metadata = {
  title: evergreenFlooringData.title,
  description: evergreenFlooringData.description,
};

export default async function EvergreenFlooringPage() {
  const products = await getProductsForGrid({ brand: 'Evergreen' });
  const serverGrid = <ProductGridServer products={products} />;
  return (
    <>
      <JsonLd data={faqSchema(evergreenFlooringData.faqItems)} />
      <BrandLandingServer
        {...evergreenFlooringData}
        brandKey="evergreen"
        initialProducts={products}
        serverGrid={serverGrid}
      />
    </>
  );
}
