import { Suspense } from 'react';
import VinylClient from '@/components/VinylClient';
import ProductGridServer from '@/components/ProductGridServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { VINYL_FAQS } from '@/data/faqs';
import { getProductsForGrid, getCategoryPriceStats } from '@/lib/products-server';

export const revalidate = 300; // 5-minute ISR

export async function generateMetadata() {
  const stats = await getCategoryPriceStats('vinyl');
  return {
    title: `Vinyl Plank Flooring Markham | LVP & SPC from $${stats.lowPrice}/sqft`,
    description: `Shop luxury vinyl plank (LVP) and SPC waterproof flooring in Markham from $${stats.lowPrice}/sqft. 100% waterproof, scratch-resistant. Perfect for basements, kitchens, bathrooms. Free in-home measurements across the GTA. Call (647) 428-1111.`,
    alternates: { canonical: '/vinyl' },
  };
}

export default async function VinylPage() {
  const [products, stats] = await Promise.all([
    getProductsForGrid({ category: 'vinyl' }),
    getCategoryPriceStats('vinyl'),
  ]);
  const serverGrid = <ProductGridServer products={products} />;
  return (
    <>
      <JsonLd data={[
        faqSchema(VINYL_FAQS),
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Vinyl LVP & SPC Flooring',
          description: `${stats.count} waterproof vinyl flooring options (LVP/SPC) from 6 brands. 100% waterproof, click-lock installation. Serving the Greater Toronto Area.`,
          category: 'Vinyl Flooring',
          brand: { '@type': 'Brand', name: 'BBS Flooring' },
          additionalProperty: { '@type': 'PropertyValue', name: 'Waterproof', value: 'Yes — 100% permanently waterproof' },
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'CAD',
            lowPrice: stats.lowPrice,
            highPrice: stats.highPrice,
            offerCount: stats.count,
            availability: 'https://schema.org/InStock',
            url: 'https://bbsflooring.ca/vinyl',
          },
        },
      ]} />
      <Suspense fallback={serverGrid}>
        <VinylClient initialProducts={products} serverGrid={serverGrid} priceStats={stats} />
      </Suspense>
    </>
  );
}
