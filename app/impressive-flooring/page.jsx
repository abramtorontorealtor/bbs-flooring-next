import { Suspense } from 'react';
import { impressiveFlooringData } from '@/data/brandPages';
import BrandLandingServer from '@/components/BrandLandingServer';
import { faqSchema, productItemListSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 3600; // 1-hour ISR (prices change a few times/mo, force-refresh via /api/revalidate after reconcile)

export const metadata = {
  title: impressiveFlooringData.title,
  description: impressiveFlooringData.description,
  alternates: { canonical: '/impressive-flooring' },
};

export default async function ImpressiveFlooringPage() {
  const products = await getProductsForGrid({ brand: 'Impressive' });
  const serverGrid = <ProductGridServer products={products} />;
  const itemList = productItemListSchema({
    name: 'Impressive Flooring — Canadian-Made Hardwood, Vinyl & Laminate at BBS Flooring',
    url: 'https://bbsflooring.ca/impressive-flooring',
    products,
  });
  return (
    <>
      <JsonLd data={faqSchema(impressiveFlooringData.faqItems)} />
      {itemList && <JsonLd data={itemList} />}
      <BrandLandingServer
        {...impressiveFlooringData}
        brandKey="impressive"
        initialProducts={products}
        serverGrid={serverGrid}
      />
    </>
  );
}
