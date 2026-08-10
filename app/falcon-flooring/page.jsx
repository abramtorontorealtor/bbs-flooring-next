import { Suspense } from 'react';
import { falconFlooringData } from '@/data/brandPages';
import BrandLandingServer from '@/components/BrandLandingServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 3600; // 1-hour ISR (was 5-min; prices change a few times/mo, force-refresh via /api/revalidate after reconcile)

export const metadata = {
  title: falconFlooringData.title,
  description: falconFlooringData.description,
  alternates: { canonical: '/falcon-flooring' },
};

export default async function FalconFlooringPage() {
  const products = await getProductsForGrid({ brand: 'Falcon' });
  const serverGrid = <ProductGridServer products={products} />;
  return (
    <>
      <JsonLd data={faqSchema(falconFlooringData.faqItems)} />
      <BrandLandingServer
        {...falconFlooringData}
        brandKey="falcon"
        initialProducts={products}
        serverGrid={serverGrid}
      />
    </>
  );
}
