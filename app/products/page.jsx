import { Suspense } from 'react';
import ProductsClient from '@/components/ProductsClient';
import ProductGridServer from '@/components/ProductGridServer';
import { SEO_DATA } from '@/lib/seo';
import { getProductsForGrid } from '@/lib/products-server';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: SEO_DATA.products.title,
  description: SEO_DATA.products.description,
  alternates: { canonical: '/products' },
};

export default async function ProductsPage() {
  const products = await getProductsForGrid();
  const serverGrid = <ProductGridServer products={products} />;
  return (
    <Suspense fallback={serverGrid}>
      <ProductsClient initialProducts={products} serverGrid={serverGrid} />
    </Suspense>
  );
}
