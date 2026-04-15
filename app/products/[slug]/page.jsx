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

// Fetch product by UUID (for parent lookup from child variants)
async function getProductById(id) {
  try {
    return await entities.Product.get(id);
  } catch {
    return null;
  }
}

// Fetch child variants for a parent product
async function getChildVariants(parentId) {
  try {
    return await entities.Product.filter({ parent_product_id: parentId });
  } catch {
    return [];
  }
}

// Dynamic metadata based on product slug
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) {
    return { title: 'Product Not Found' };
  }
  // Fetch child variants for dynamic meta descriptions on parent products
  const childVariants = product.is_parent_product
    ? await getChildVariants(product.id)
    : [];
  const hidePrice = product.hide_price === true;
  const meta = generateProductMetaTags(product, product.category, childVariants, { hidePrice });

  // Child variants canonical → parent product (prevents 191 thin pages indexing)
  let canonicalSlug = slug;
  if (product.parent_product_id) {
    const parent = await getProductById(product.parent_product_id);
    if (parent?.slug) canonicalSlug = parent.slug;
  }

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/products/${canonicalSlug}` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      images: product.image_url ? [{ url: product.image_url }] : [],
    },
    // Prevent child variant pages from being indexed — canonical + noindex belt-and-suspenders
    ...(product.parent_product_id ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  // Fetch child variants server-side for ProductGroup JSON-LD
  const childVariants = product?.is_parent_product
    ? await getChildVariants(product.id)
    : [];

  // JSON-LD: ProductGroup + hasVariant + AggregateOffer for parents, single Product for others
  const hidePrice = product?.hide_price === true;
  const productSchema = product ? generateProductSchema(product, 'https://bbsflooring.ca', childVariants, { hidePrice }) : null;

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
        The Suspense fallback renders a lightweight shell with the hero image
        so users see content immediately while JS loads and hydrates.
      */}
      <Suspense fallback={
        product ? (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image_url || '/images/product-placeholder.svg'}
                  alt={product.image_alt_text || product.name}
                  className="w-full h-full object-cover"
                  fetchPriority="high"
                />
              </div>
              <div className="space-y-4">
                <div className="text-sm text-slate-500">{product.brand}</div>
                <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
                {!hidePrice && product.price_per_sqft > 0 && (
                  <div className="text-xl font-semibold text-slate-800">
                    C${product.price_per_sqft.toFixed(2)}/sqft
                  </div>
                )}
                <div className="h-8 bg-slate-100 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="aspect-square bg-slate-100 rounded-3xl animate-pulse" />
              <div className="space-y-4">
                <div className="h-8 bg-slate-100 rounded w-1/4 animate-pulse" />
                <div className="h-12 bg-slate-100 rounded w-3/4 animate-pulse" />
                <div className="h-6 bg-slate-100 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          </div>
        )
      }>
        <ProductDetailClient slug={slug} initialProduct={product} />
      </Suspense>
    </>
  );
}
