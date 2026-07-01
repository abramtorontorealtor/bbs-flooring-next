import Link from 'next/link';
import { getSupabaseAdminClient, getSupabaseServerClient } from '@/lib/supabase';
import BlogPostClient from '@/components/BlogPostClient';
import DeepPageCapture from '@/components/DeepPageCapture';
import { JsonLd } from '@/lib/schemas';
import Breadcrumbs from '@/components/Breadcrumbs';

// --- Server-side internal-link computation (Phase A: blog -> money pages) ---
// Only cities with a live /flooring-in/{slug} page.
const NEIGHBOURHOOD_TO_CITY = {
  // Markham neighbourhoods
  'Markham': 'markham', 'Unionville': 'markham', 'Cornell': 'markham', 'Cachet': 'markham',
  'Cathedraltown': 'markham', 'Markham Village': 'markham', 'Old Markham Village': 'markham',
  'Berczy Village': 'markham', 'Wismer': 'markham', 'Downtown Markham': 'markham',
  'Milliken': 'markham', 'Greensborough': 'markham', 'Angus Glen': 'markham',
  'Box Grove': 'markham', 'Raymerville': 'markham', 'Legacy': 'markham',
  'Markville': 'markham', 'Bullock': 'markham', 'Vinegar Hill': 'markham',
  'Sherwood-Amberglen': 'markham', 'Vinegar Hill ': 'markham',
  // Scarborough
  'Agincourt': 'scarborough', 'Malvern': 'scarborough',
  // Richmond Hill
  'Oak Ridges': 'richmond-hill', 'Elgin Mills': 'richmond-hill',
  // Vaughan
  'Kleinburg': 'vaughan', 'Maple': 'vaughan', 'Concord': 'vaughan', 'Thornhill': 'vaughan',
  // Whitchurch-Stouffville → stouffville page exists
  'Ballantrae': 'stouffville', 'Stonehaven': 'stouffville', 'Vinegar Hill, Stouffville': 'stouffville',
  // Toronto
  'Bridle Path': 'toronto',
};

// Live city×product pages (data/cityProductData.js). Only link if the cell exists.
const LIVE_CITY_PRODUCT = new Set([
  'engineered-hardwood', // category, always live
  'flooring-installation-ajax', 'flooring-installation-markham', 'flooring-installation-newmarket',
  'flooring-installation-oshawa', 'flooring-installation-pickering', 'flooring-installation-richmond-hill',
  'flooring-installation-scarborough', 'flooring-installation-vaughan',
  'hardwood-flooring-ajax', 'hardwood-flooring-markham', 'hardwood-flooring-oshawa',
  'hardwood-flooring-richmond-hill', 'hardwood-flooring-scarborough', 'hardwood-flooring-toronto',
  'hardwood-flooring-vaughan',
  'laminate-flooring-markham', 'laminate-flooring-newmarket', 'laminate-flooring-richmond-hill',
  'laminate-flooring-scarborough',
  'vinyl-flooring-ajax', 'vinyl-flooring-markham', 'vinyl-flooring-pickering',
  'vinyl-flooring-richmond-hill', 'vinyl-flooring-scarborough', 'vinyl-flooring-toronto',
  'vinyl-flooring-vaughan',
]);

const PRODUCT_CATEGORY_PAGE = {
  vinyl: '/vinyl',
  hardwood: '/engineered-hardwood',
  'solid-hardwood': '/solid-hardwood',
  laminate: '/laminate',
  stair: '/stairs',
};
const PRODUCT_LABEL = {
  vinyl: 'Vinyl', hardwood: 'Engineered Hardwood', 'solid-hardwood': 'Solid Hardwood',
  laminate: 'Laminate', stair: 'Stairs',
};
const CITY_DISPLAY = {
  markham: 'Markham', scarborough: 'Scarborough', 'richmond-hill': 'Richmond Hill',
  vaughan: 'Vaughan', toronto: 'Toronto', stouffville: 'Stouffville',
};

function inferProductType(post) {
  const s = `${post?.title || ''} ${post?.slug || ''}`.toLowerCase();
  if (s.includes('solid hardwood')) return 'solid-hardwood';
  if (s.includes('engineered') || s.includes('hardwood')) return 'hardwood';
  if (s.includes('vinyl') || s.includes('lvp') || s.includes('luxury vinyl')) return 'vinyl';
  if (s.includes('laminate')) return 'laminate';
  if (s.includes('stair')) return 'stair';
  return null;
}

// city×product slug uses 'hardwood' for engineered HW pages
function cityProductSlug(productType, citySlug) {
  if (!citySlug) return null;
  const seg = productType === 'hardwood' ? 'hardwood-flooring'
    : productType === 'vinyl' ? 'vinyl-flooring'
    : productType === 'laminate' ? 'laminate-flooring'
    : null; // solid-hardwood & stair have no city pages yet
  if (!seg) return null;
  const slug = `${seg}-${citySlug}`;
  return LIVE_CITY_PRODUCT.has(slug) ? slug : null;
}

function buildInternalLinks(post) {
  if (!post) return [];
  const citySlug = NEIGHBOURHOOD_TO_CITY[post.neighbourhood] || null;
  const productType = inferProductType(post);
  const links = [];

  if (citySlug) {
    links.push({
      href: `/flooring-in/${citySlug}`,
      label: `Flooring in ${CITY_DISPLAY[citySlug] || citySlug} — Local Showroom & Prices`,
    });
    const cps = cityProductSlug(productType, citySlug);
    if (cps) {
      links.push({
        href: `/${cps}`,
        label: `${PRODUCT_LABEL[productType]} Flooring in ${CITY_DISPLAY[citySlug] || citySlug}`,
      });
    }
  }
  if (productType && PRODUCT_CATEGORY_PAGE[productType]) {
    links.push({
      href: PRODUCT_CATEGORY_PAGE[productType],
      label: `Browse All ${PRODUCT_LABEL[productType]} Flooring`,
    });
  }
  // De-dupe by href, cap at 3
  const seen = new Set();
  return links.filter((l) => (seen.has(l.href) ? false : (seen.add(l.href), true))).slice(0, 3);
}

// ISR: revalidate blog posts every hour
export const revalidate = 3600;

// Pre-generate published blog posts at build time
export async function generateStaticParams() {
  try {
    const supabase = getSupabaseAdminClient() || getSupabaseServerClient();
    if (!supabase) return [];
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug')
      .eq('status', 'published')
      .not('slug', 'is', null);
    return (posts || []).map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

async function getPost(slug) {
  const supabase = getSupabaseAdminClient() || getSupabaseServerClient();
  if (!supabase) return null;
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .limit(1);
  if (error) console.error('[BlogPost] Server fetch error:', error.message);
  return posts?.[0] || null;
}

// Strip trailing "| BBS Flooring" — root layout template adds it
function cleanTitle(t) { return t ? t.replace(/\s*\|\s*BBS\s*Flooring\s*$/i, '').trim() : t; }

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Blog Post Not Found' };
  const title = cleanTitle(post.seo_title || post.title);
  return {
    title,
    description: post.seo_description || post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    keywords: post.keywords || undefined,
    openGraph: {
      title,
      description: post.seo_description || post.excerpt,
      type: 'article',
      images: post.featured_image ? [post.featured_image] : [],
      publishedTime: post.created_at,
      modifiedTime: post.updated_at || post.created_at,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: post.seo_description || post.excerpt,
      images: post.featured_image ? [post.featured_image] : [],
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  // BlogPosting JSON-LD
  const articleSchema = post ? {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    image: post.featured_image || undefined,
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: {
      '@type': 'Person',
      name: post.author || 'BBS Flooring Team',
    },
    publisher: {
      '@type': 'Organization',
      '@id': 'https://bbsflooring.ca/#organization',
      name: 'BBS Flooring',
      logo: {
        '@type': 'ImageObject',
        url: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/bbs-logo-official-v2.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://bbsflooring.ca/blog/${slug}`,
    },
  } : null;

  // Breadcrumb JSON-LD
  const breadcrumbSchema = post ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bbsflooring.ca/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://bbsflooring.ca/blog' },
      { '@type': 'ListItem', position: 3, name: post.title },
    ],
  } : null;

  const internalLinks = buildInternalLinks(post);
  const captureProductType = post ? inferProductType(post) : null;

  return (
    <>
      {articleSchema && <JsonLd data={[articleSchema, breadcrumbSchema]} />}
      <BlogPostClient slug={slug} initialPost={post} />
      {internalLinks.length > 0 && (
        <nav
          aria-label="Related local flooring pages"
          className="max-w-3xl mx-auto px-4 sm:px-6 -mt-4 mb-12"
        >
          <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
            <h2 className="text-base font-bold text-slate-800 mb-3">
              Local Flooring Near You
            </h2>
            <ul className="space-y-2">
              {internalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-amber-700 hover:text-amber-900 font-medium underline underline-offset-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}
      {post && <DeepPageCapture productType={captureProductType} />}
    </>
  );
}
