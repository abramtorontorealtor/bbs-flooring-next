import { walnutFlooringData, isWalnutProduct } from '@/data/landingPages';
import BrandLandingServer from '@/components/BrandLandingServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid, deriveOfferStats } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';

export const revalidate = 3600; // 1-hour ISR (prices change a few times/mo; force-refresh via /api/revalidate after reconcile)

// Species hub: hardwood rows with species = Walnut (American black walnut + NAF exotic walnut).
// Keyed off the `species` column so Wickham/Tosca "Walnut" stain colours on maple/red oak stay out.
async function getWalnutProducts() {
  const [eng, solid] = await Promise.all([
    getProductsForGrid({ category: 'engineered_hardwood' }),
    getProductsForGrid({ category: 'solid_hardwood' }),
  ]);
  return [...eng, ...solid].filter(isWalnutProduct);
}

export async function generateMetadata() {
  const products = await getWalnutProducts();
  const stats = deriveOfferStats(products);
  const from = stats ? ` from $${stats.lowPrice}/sqft` : '';
  return {
    title: `Walnut Flooring Toronto${from} | Engineered American Walnut`,
    description: `Shop engineered and solid walnut hardwood flooring in stock — American black walnut and exotic walnut, 5"–7½" planks, wire-brushed and hand-scraped. Markham showroom, installation across Toronto & GTA. Free measurements. Call (647) 428-1111.`,
    alternates: { canonical: '/walnut-flooring' },
  };
}

export default async function WalnutFlooringPage() {
  const products = await getWalnutProducts();
  const serverGrid = <ProductGridServer products={products} />;
  const stats = deriveOfferStats(products);
  return (
    <>
      <JsonLd data={[
        faqSchema(walnutFlooringData.faqItems),
        ...(stats ? [{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Walnut Flooring',
          description: `${stats.count} walnut flooring options — engineered and solid American black walnut and exotic walnut. Serving Toronto and the Greater Toronto Area from our Markham showroom.`,
          category: 'Walnut Flooring',
          brand: { '@type': 'Brand', name: 'BBS Flooring' },
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'CAD',
            lowPrice: stats.lowPrice,
            highPrice: stats.highPrice,
            offerCount: stats.count,
            availability: 'https://schema.org/InStock',
            url: 'https://bbsflooring.ca/walnut-flooring',
          },
        }] : []),
      ]} />
      <BrandLandingServer
        {...walnutFlooringData}
        brandKey="walnut"
        initialProducts={products}
        serverGrid={serverGrid}
      />
    </>
  );
}
