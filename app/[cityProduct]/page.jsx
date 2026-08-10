import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import CityProductClient from '@/components/CityProductClient';
import ProductGridServer from '@/components/ProductGridServer';
import { JsonLd, faqSchema, cityLocalBusinessSchema } from '@/lib/schemas';
import { getProductsForGrid, getCategoryPriceStats } from '@/lib/products-server';
import { getAllCityProductSlugs, getCityProductPage, PRODUCT_TYPES } from '@/data/cityProductData';

export const revalidate = 3600; // 1-hour ISR — prices refresh hourly

// ── Static params for build-time generation ──────────────────────────────────
export function generateStaticParams() {
  return getAllCityProductSlugs().map(slug => ({ cityProduct: slug }));
}

// ── Dynamic metadata ─────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const { cityProduct } = await params;
  const page = getCityProductPage(cityProduct);
  if (!page) return {};

  const productType = PRODUCT_TYPES[page.productType];
  const stats = await getCategoryPriceStats(productType.dbCategory);

  // Use page-specific title/description with live pricing injected
  const title = page.title.replace(/\$[\d.]+\/sqft/, `$${stats.lowPrice}/sqft`);
  const description = page.metaDescription.replace(/\$[\d.]+\/sqft/, `$${stats.lowPrice}/sqft`);

  return {
    title,
    description,
    alternates: {
      canonical: `/${cityProduct}`,
    },
    openGraph: {
      title,
      description,
      url: `https://bbsflooring.ca/${cityProduct}`,
      siteName: 'BBS Flooring',
      locale: 'en_CA',
      type: 'website',
    },
  };
}

// ── Page component ───────────────────────────────────────────────────────────
export default async function CityProductPage({ params }) {
  const { cityProduct } = await params;
  const page = getCityProductPage(cityProduct);
  if (!page) notFound();

  const productType = PRODUCT_TYPES[page.productType];

  // For installation pages, load a mix of product types
  const isInstall = page.isInstallationPage;
  const [products, stats] = await Promise.all([
    isInstall
      ? getProductsForGrid({ limit: 12 })
      : getProductsForGrid({ category: productType.dbCategory, limit: 12 }),
    getCategoryPriceStats(productType.dbCategory),
  ]);

  // Build schema
  const schemas = [];

  // 1. FAQ schema
  if (page.faqs && page.faqs.length > 0) {
    schemas.push(faqSchema(page.faqs));
  }

  // 2. LocalBusiness schema for the city
  schemas.push(cityLocalBusinessSchema(page.city, page.metaDescription));

  // 3. Product/AggregateOffer schema
  if (!isInstall) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: `${productType.label} in ${page.city}`,
      description: `${stats.count}+ ${productType.shortLabel.toLowerCase()} flooring options available for ${page.city} homeowners. Professional installation available.`,
      image: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/bbs-logo-official-v2.png',
      category: productType.label,
      brand: { '@type': 'Brand', name: 'BBS Flooring' },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'CAD',
        lowPrice: stats.lowPrice,
        highPrice: stats.highPrice,
        offerCount: stats.count,
        availability: 'https://schema.org/InStock',
        url: `https://bbsflooring.ca/${cityProduct}`,
      },
    });
  }

  // 4. Service schema for installation pages
  if (isInstall) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `Flooring Installation in ${page.city}`,
      description: `Professional flooring installation services in ${page.city}. Hardwood, vinyl, and laminate installation by BBS Flooring.`,
      provider: {
        '@type': 'LocalBusiness',
        name: 'BBS Flooring',
        telephone: '(647) 428-1111',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '6061 Highway 7, Unit B',
          addressLocality: 'Markham',
          addressRegion: 'ON',
          postalCode: 'L3P 3B2',
          addressCountry: 'CA',
        },
      },
      areaServed: { '@type': 'City', name: page.city },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'CAD',
        lowPrice: productType === 'vinyl' ? '1.79' : productType === 'laminate' ? '1.49' : '2.49',
        availability: 'https://schema.org/InStock',
      },
    });
  }

  // 5. BreadcrumbList schema
  const breadcrumbItems = [
    { name: 'Home', url: 'https://bbsflooring.ca/' },
  ];
  if (!isInstall) {
    breadcrumbItems.push({ name: productType.label, url: `https://bbsflooring.ca${productType.categoryPage}` });
  } else {
    breadcrumbItems.push({ name: 'Installation', url: 'https://bbsflooring.ca/installation' });
  }
  breadcrumbItems.push({ name: `${page.city}` });

  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  });

  const serverGrid = <ProductGridServer products={products} />;

  return (
    <>
      <JsonLd data={schemas} />
      <Suspense fallback={serverGrid}>
        <CityProductClient
          pageData={page}
          productType={productType}
          initialProducts={products}
          priceStats={stats}
          serverGrid={serverGrid}
          slug={cityProduct}
        />
      </Suspense>
    </>
  );
}
