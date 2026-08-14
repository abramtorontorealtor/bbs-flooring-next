import { Suspense } from 'react';
import { canadianMadeFlooringTorontoData } from '@/data/brandPages';
import BrandLandingServer from '@/components/BrandLandingServer';
import { faqSchema, productItemListSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 3600; // 1-hour ISR (prices change a few times/mo, force-refresh via /api/revalidate after reconcile)

export const metadata = {
  title: canadianMadeFlooringTorontoData.title,
  description: canadianMadeFlooringTorontoData.description,
  alternates: { canonical: '/canadian-made-flooring-toronto' },
};

export default async function CanadianMadeFlooringTorontoPage() {
  const products = await getProductsForGrid({ canadian: true });
  const serverGrid = <ProductGridServer products={products} />;
  const itemList = productItemListSchema({
    name: 'Canadian-Made Flooring in Toronto — Domestic Hardwood at BBS Flooring',
    url: 'https://bbsflooring.ca/canadian-made-flooring-toronto',
    products,
  });
  return (
    <>
      <JsonLd data={faqSchema(canadianMadeFlooringTorontoData.faqItems)} />
      {itemList && <JsonLd data={itemList} />}
      <BrandLandingServer
        {...canadianMadeFlooringTorontoData}
        brandKey="canadian-made-toronto"
        initialProducts={products}
        serverGrid={serverGrid}
      />
    </>
  );
}
