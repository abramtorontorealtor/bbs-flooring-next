import { Suspense } from 'react';
import { triforestFlooringData } from '@/data/brandPages';
import BrandLandingServer from '@/components/BrandLandingServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 3600; // 1-hour ISR (was 5-min; prices change a few times/mo, force-refresh via /api/revalidate after reconcile)

export const metadata = {
  title: triforestFlooringData.title,
  description: triforestFlooringData.description,
  alternates: { canonical: '/triforest-flooring' },
};

export default async function TriforestFlooringPage() {
  const products = await getProductsForGrid({ brand: 'Triforest' });
  const serverGrid = <ProductGridServer products={products} />;
  return (
    <>
      <JsonLd data={faqSchema(triforestFlooringData.faqItems)} />
      <BrandLandingServer
        {...triforestFlooringData}
        brandKey="triforest"
        initialProducts={products}
        serverGrid={serverGrid}
      />
    </>
  );
}
