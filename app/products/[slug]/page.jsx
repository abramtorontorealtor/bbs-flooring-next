import { Suspense } from 'react';
import ProductDetailClient from '@/components/ProductDetailClient';
import { entities } from '@/lib/base44-compat-server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { generateProductMetaTags, generateProductSchema } from '@/lib/seo';

// ISR: revalidate product pages every hour
export const revalidate = 3600;

// Pre-generate all parent product pages at build time
export async function generateStaticParams() {
  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) return [];
    const { data: products } = await supabase
      .from('products')
      .select('slug')
      .eq('is_parent', true)
      .not('slug', 'is', null);
    return (products || []).map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

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
