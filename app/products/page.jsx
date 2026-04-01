import { Suspense } from 'react';
import ProductsClient from '@/components/ProductsClient';
import { SEO_DATA } from '@/lib/seo';

export const metadata = {
  title: SEO_DATA.products.title,
  description: SEO_DATA.products.description,
  alternates: { canonical: '/products' },
};

export default function ProductsPage() {
  return <Suspense><ProductsClient /></Suspense>;
}
