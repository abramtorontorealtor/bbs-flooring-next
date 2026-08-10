import { Suspense } from 'react';
import { wodenFlooringData } from '@/data/brandPages';
import BrandLandingServer from '@/components/BrandLandingServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 3600; // 1-hour ISR (was 5-min; prices change a few times/mo, force-refresh via /api/revalidate after reconcile)

export const metadata = {
  title: wodenFlooringData.title,
  description: wodenFlooringData.description,
  alternates: { canonical: '/woden-flooring' },
};

export default async function WodenFlooringPage() {
  const products = await getProductsForGrid({ brand: 'Woden' });
  const serverGrid = <ProductGridServer products={products} />;
  return (
    <>
      <JsonLd data={faqSchema(wodenFlooringData.faqItems)} />
      <BrandLandingServer
        {...wodenFlooringData}
        brandKey="woden"
        initialProducts={products}
        serverGrid={serverGrid}
      />
    </>
  );
}
