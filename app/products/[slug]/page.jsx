import { Suspense } from 'react';
import ProductDetailClient from '@/components/ProductDetailClient';
import { entities } from '@/lib/base44-compat-server';
import { generateProductMetaTags, generateProductSchema } from '@/lib/seo';

// Dynamic metadata based on product slug
export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const products = await entities.Product.filter({ slug });
    const product = products?.[0];
    if (!product) {
      return { title: 'Product Not Found | BBS Flooring' };
    }
    const meta = generateProductMetaTags(product, product.category);
    return {
      title: meta.title,
      description: meta.description,
      openGraph: {
        title: meta.title,
        description: meta.description,
        images: product.image_url ? [{ url: product.image_url }] : [],
      },
    };
  } catch {
    return { title: 'Product | BBS Flooring' };
  }
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  return <Suspense><ProductDetailClient slug={slug} /></Suspense>;
}
