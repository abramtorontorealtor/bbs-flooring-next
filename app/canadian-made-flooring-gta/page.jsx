import { Suspense } from 'react';
import { canadianMadeFlooringData } from '@/data/brandPages';
import BrandLandingServer from '@/components/BrandLandingServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 3600; // 1-hour ISR (prices change a few times/mo, force-refresh via /api/revalidate after reconcile)

export const metadata = {
  title: canadianMadeFlooringData.title,
  description: canadianMadeFlooringData.description,
  alternates: { canonical: '/canadian-made-flooring-gta' },
};

export default async function CanadianMadeFlooringGtaPage() {
  const products = await getProductsForGrid({ canadian: true });
  const serverGrid = <ProductGridServer products={products} />;
  return (
    <>
      <JsonLd data={faqSchema(canadianMadeFlooringData.faqItems)} />
      <BrandLandingServer
        {...canadianMadeFlooringData}
        brandKey="canadian-made"
        initialProducts={products}
        serverGrid={serverGrid}
      />
    </>
  );
}
