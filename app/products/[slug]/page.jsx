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
      .eq('is_variant', false)
      .not('slug', 'is', null);
    return (products || []).map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

// Fetch product server-side (shared between metadata + page render)
async function getProduct(slug) {
  try {
    const products = await entities.Product.filter({ slug });
    if (products?.[0]) return products[0];
    const lcProducts = await entities.Product.filter({ slug: slug.toLowerCase() });
    return lcProducts?.[0] || null;
  } catch {
    return null;
  }
}

// Dynamic metadata based on product slug
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
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
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  // JSON-LD rendered server-side — in the HTML before any JS executes
  const productSchema = product ? generateProductSchema(product) : null;

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}

      {/* 
        initialProduct provides server-fetched data to React Query's initialData.
        This means the FULL product content (description, details, specs) renders
        in the server HTML — no loading skeleton, no client-fetch-then-render.
        Crawlers see the complete page immediately.
      */}
      <Suspense>
        <ProductDetailClient slug={slug} initialProduct={product} />
      </Suspense>
    </>
  );
}
