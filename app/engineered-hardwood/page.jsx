import { Suspense } from 'react';
import EngineeredHardwoodClient from '@/components/EngineeredHardwoodClient';
import ProductGridServer from '@/components/ProductGridServer';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { ENGINEERED_HARDWOOD_FAQS } from '@/data/faqs';
import { getProductsForGrid } from '@/lib/products-server';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: 'Engineered Hardwood Flooring Markham | Vidar, Wickham & More',
  description:
    'Shop engineered hardwood flooring in Markham. Vidar, Wickham, wide-plank European oak. 100+ styles in stock. Free measurements across the GTA. Call (647) 428-1111.',
  alternates: { canonical: '/engineered-hardwood' },
};

export default async function EngineeredHardwoodPage() {
  const products = await getProductsForGrid({ category: 'engineered_hardwood' });
  const serverGrid = <ProductGridServer products={products} />;
  return (
    <>
      <JsonLd data={faqSchema(ENGINEERED_HARDWOOD_FAQS)} />
      <Suspense fallback={serverGrid}>
        <EngineeredHardwoodClient initialProducts={products} serverGrid={serverGrid} />
      </Suspense>
    </>
  );
}
