import { whiteOakFlooringData, isWhiteOakProduct } from '@/data/landingPages';
import BrandLandingServer from '@/components/BrandLandingServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid, deriveOfferStats } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 3600; // 1-hour ISR (prices change a few times/mo; force-refresh via /api/revalidate after reconcile)

// Species hub: only hardwood rows whose `species` is white oak (see isWhiteOakProduct).
// Fetching both hardwood categories (not the global top-100) so the SSR grid and the
// client island's initialData are the SAME white-oak-only set — the old page shipped
// 100 unfiltered products (vinyl, laminate, maple…) in its server HTML.
async function getWhiteOakProducts() {
  const [eng, solid] = await Promise.all([
    getProductsForGrid({ category: 'engineered_hardwood' }),
    getProductsForGrid({ category: 'solid_hardwood' }),
  ]);
  return [...eng, ...solid].filter(isWhiteOakProduct);
}

export async function generateMetadata() {
  const products = await getWhiteOakProducts();
  const stats = deriveOfferStats(products);
  const from = stats ? ` from $${stats.lowPrice}/sqft` : '';
  const count = stats ? `${stats.count}+ ` : '';
  return {
    title: `White Oak Flooring Toronto & GTA${from} | Engineered & Solid`,
    description: `Shop ${count}white oak hardwood floors in stock — engineered and solid, 6½"–9½" wide plank, wire-brushed, natural to smoked. Markham showroom, installation across Toronto & GTA. Free measurements. Call (647) 428-1111.`,
    alternates: { canonical: '/white-oak-flooring' },
  };
}

export default async function WhiteOakFlooringPage() {
  const products = await getWhiteOakProducts();
  const serverGrid = <ProductGridServer products={products} />;
  const stats = deriveOfferStats(products);
  return (
    <>
      <JsonLd data={[
        faqSchema(whiteOakFlooringData.faqItems),
        ...(stats ? [{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'White Oak Flooring',
          description: `${stats.count} white oak flooring options — engineered and solid white oak in a range of finishes and grades. Serving Toronto and the Greater Toronto Area from our Markham showroom.`,
          category: 'White Oak Flooring',
          brand: { '@type': 'Brand', name: 'BBS Flooring' },
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'CAD',
            lowPrice: stats.lowPrice,
            highPrice: stats.highPrice,
            offerCount: stats.count,
            availability: 'https://schema.org/InStock',
            url: 'https://bbsflooring.ca/white-oak-flooring',
          },
        }] : []),
      ]} />
      <BrandLandingServer
        {...whiteOakFlooringData}
        brandKey="white-oak"
        initialProducts={products}
        serverGrid={serverGrid}
      />
    </>
  );
}
