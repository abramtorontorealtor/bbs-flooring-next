import { cheapFlooringGtaData } from '@/data/landingPages';
import BrandLandingServer from '@/components/BrandLandingServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { getProductsForGrid, deriveOfferStats } from '@/lib/products-server';
import ProductGridServer from '@/components/ProductGridServer';
import FloorFinderCTA from '@/components/FloorFinderCTA';

export const revalidate = 3600; // 1-hour ISR (prices change a few times/mo; force-refresh via /api/revalidate after reconcile)

export const metadata = {
  title: cheapFlooringGtaData.title,
  description: cheapFlooringGtaData.description,
  alternates: { canonical: 'https://bbsflooring.ca/cheap-flooring-gta' },
};

export default async function CheapFlooringGtaPage() {
  const [products, allForStats] = await Promise.all([
    getProductsForGrid({ limit: 100 }),
    getProductsForGrid({ limit: 1000 }),
  ]);
  const filter = cheapFlooringGtaData.productFilter;
  const budgetProducts = typeof filter === 'function' ? products.filter(filter) : products;
  const serverGrid = <ProductGridServer products={budgetProducts} />;
  const stats = deriveOfferStats(typeof filter === 'function' ? allForStats.filter(filter) : allForStats);

  return (
    <>
      <JsonLd data={[
        faqSchema(cheapFlooringGtaData.faqItems),
        ...(stats ? [{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Cheap Flooring GTA',
          description: `${stats.count} budget-friendly flooring options in stock in the Greater Toronto Area — laminate, waterproof vinyl (LVP/SPC), and engineered hardwood at contractor-direct prices, professionally installed.`,
          category: 'Flooring',
          brand: { '@type': 'Brand', name: 'BBS Flooring' },
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'CAD',
            lowPrice: stats.lowPrice,
            highPrice: stats.highPrice,
            offerCount: stats.count,
            availability: 'https://schema.org/InStock',
            url: 'https://bbsflooring.ca/cheap-flooring-gta',
            seller: { '@type': 'Organization', name: 'BBS Flooring', url: 'https://bbsflooring.ca' },
          },
          // Store-level Google rating intentionally omitted from Product schema
          // (self-serving → ignored by Google since Jul 2026). Lives on LocalBusiness only.
        }] : []),
      ]} />
      <BrandLandingServer
        {...cheapFlooringGtaData}
        brandKey="cheap-flooring-gta"
        initialProducts={budgetProducts}
        serverGrid={serverGrid}
        guidedNav={<FloorFinderCTA context="budget floor" />}
      />
    </>
  );
}
