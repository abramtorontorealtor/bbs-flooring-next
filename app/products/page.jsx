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
  return (
    <Suspense>
      <ProductsClient
        initialProducts={products}
        serverGrid={<ProductGridServer products={products} />}
      />
    </Suspense>
  );
}
