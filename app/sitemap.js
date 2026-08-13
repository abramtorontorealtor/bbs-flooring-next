import { getSupabaseServerClient } from '@/lib/supabase';
import { locationData } from '@/data/locationData';
import { getAllCityProductSlugs } from '@/data/cityProductData';
import { stairsImages, flooringImages, commercialImages } from '@/data/galleryImages';

// Force dynamic rendering so Supabase queries run at request time (not build time)
export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bbsflooring.ca';

// Google rejects the WHOLE sitemap with "Invalid URL" if any <image:loc> is not an
// absolute http(s) URL. Product/blog image columns can contain relative paths
// (e.g. "/images/product-placeholder.svg") or empty strings — normalize them:
// absolute URLs pass through, root-relative paths get the site origin prepended,
// and anything else (empty/null/data:) is dropped.
function toAbsoluteImageUrl(raw) {
  if (typeof raw !== 'string') return null;
  const v = raw.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith('/')) return `${SITE_URL}${v}`;
  return null;
}

export default async function sitemap() {
  const entries = [];
  const now = new Date().toISOString();

  // ── Static pages ──
  const staticPages = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/products', priority: 0.9, changeFrequency: 'daily' },
    { path: '/clearance', priority: 0.9, changeFrequency: 'daily' },
    { path: '/cheap-flooring-gta', priority: 0.8, changeFrequency: 'weekly' },
    // /flooring-clearance-sale canonicals to /clearance — omitted from sitemap
    // Category pages
    { path: '/engineered-hardwood', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/solid-hardwood', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/vinyl', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/commercial-vinyl-flooring', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/laminate', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/waterproof-flooring', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/waterproof-laminate-flooring', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/white-oak-flooring', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/vidar-flooring', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/wickham-flooring', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/naf-flooring', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/northernest-flooring', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/woden-flooring', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/falcon-flooring', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/canadian-standard-flooring', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/triforest-flooring', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/simba-flooring', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/lee-flooring', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/tosca-flooring', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/appalachian-flooring', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/evergreen-flooring', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/sherwood-flooring', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/golden-choice-flooring', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/basement-flooring', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/contractor-flooring', priority: 0.7, changeFrequency: 'weekly' },
    // Service pages
    { path: '/installation', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/stairs', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/stair-refinishing', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/hardwood-refinishing', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/carpet-removal', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/carpet-to-hardwood-stairs', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/stair-recapping', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/carpet-to-hardwood-stairs-richmond-hill', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/carpet-to-hardwood-stairs-vaughan', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/carpet-to-hardwood-stairs-scarborough', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/carpet-to-hardwood-stairs-oakville', priority: 0.7, changeFrequency: 'monthly' },
    // City service pages (Phase D — Markham)
    { path: '/hardwood-refinishing-markham', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/stair-refinishing-markham', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/stair-refinishing-vaughan', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/stair-refinishing-pickering', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/stair-recapping-markham', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/stair-recapping-richmond-hill', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/stair-recapping-vaughan', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/stair-renovation-markham', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/carpet-removal-markham', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/free-measurement', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/floor-finder', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/flooring-installation-cost', priority: 0.8, changeFrequency: 'monthly' },
    // Content pages
    { path: '/flooring-showroom-markham', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/grade-guide', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/engineered-hardwood-guide', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/flooring-comparison-guide', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/flooring-cost-toronto-2026', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/basement-flooring-guide', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/vinyl-flooring-guide', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/stair-renovation-guide', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/solid-hardwood-guide', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/laminate-flooring-guide', priority: 0.8, changeFrequency: 'monthly' },
    // Care & maintenance guides (Phase C)
    { path: '/how-to-clean-engineered-hardwood', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/how-to-clean-vinyl-plank-flooring', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/how-to-clean-laminate-flooring', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/contact', priority: 0.6, changeFrequency: 'yearly' },
    { path: '/gallery', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/blog', priority: 0.7, changeFrequency: 'daily' },
    { path: '/financing', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/compare', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/quote-calculator', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/faq', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/price-match', priority: 0.8, changeFrequency: 'monthly' },
    // Room Visualizer hidden — needs rework (Apr 5, 2026)
    // { path: '/room-visualizer', priority: 0.6, changeFrequency: 'monthly' },
    // Policy pages
    { path: '/privacy-policy', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/terms-of-service', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/return-policy', priority: 0.2, changeFrequency: 'yearly' },
    // Removal service pages
    { path: '/hardwood-removal', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/tile-removal', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/vinyl-laminate-removal', priority: 0.7, changeFrequency: 'monthly' },
    // AI-friendly content files (helps AI crawlers discover our structured data)
    { path: '/llms.txt', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/llms-full.txt', priority: 0.8, changeFrequency: 'weekly' },
  ];

  for (const page of staticPages) {
    const entry = {
      url: `${SITE_URL}${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    };

    // Add gallery images to the /gallery page
    if (page.path === '/gallery') {
      const galleryUrls = [
        ...stairsImages.map(img => img.url),
        ...flooringImages.map(img => img.url),
        ...commercialImages.map(img => img.url),
      ].map(toAbsoluteImageUrl).filter(Boolean);
      if (galleryUrls.length > 0) {
        entry.images = galleryUrls;
      }
    }

    entries.push(entry);
  }

  // ── Location pages ──
  for (const citySlug of Object.keys(locationData)) {
    entries.push({
      url: `${SITE_URL}/flooring-in/${citySlug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  // ── City × Product type pages (SEO landing pages) ──
  for (const slug of getAllCityProductSlugs()) {
    entries.push({
      url: `${SITE_URL}/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  // ── Product pages (from Supabase) — with images ──
  try {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data: products } = await supabase
        .from('products')
        .select('slug, updated_at, image_url, additional_images')
        .not('slug', 'is', null)
        .eq('is_variant', false)
        .order('updated_at', { ascending: false });

      if (products) {
        for (const product of products) {
          const images = [];

          // Primary product image
          const primary = toAbsoluteImageUrl(product.image_url);
          if (primary) {
            images.push(primary);
          }

          // Additional images (room scenes, plank strips, etc.)
          if (product.additional_images) {
            try {
              const additional = typeof product.additional_images === 'string'
                ? JSON.parse(product.additional_images)
                : product.additional_images;
              if (Array.isArray(additional)) {
                for (const img of additional) {
                  const url = toAbsoluteImageUrl(typeof img === 'string' ? img : img?.url);
                  if (url) images.push(url);
                }
              }
            } catch {
              // Skip malformed additional_images
            }
          }

          const entry = {
            url: `${SITE_URL}/products/${product.slug}`,
            lastModified: product.updated_at || now,
            changeFrequency: 'weekly',
            priority: 0.6,
          };

          if (images.length > 0) {
            entry.images = images;
          }

          entries.push(entry);
        }
      }
    }
  } catch (e) {
    console.warn('Sitemap: could not fetch products from Supabase', e.message);
  }

  // ── Blog posts (from Supabase) — with featured images ──
  try {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data: posts } = await supabase
        .from('blog_posts')
        .select('slug, updated_at, featured_image')
        .eq('status', 'published')
        .not('slug', 'is', null)
        .order('published_at', { ascending: false });

      if (posts) {
        for (const post of posts) {
          const entry = {
            url: `${SITE_URL}/blog/${post.slug}`,
            lastModified: post.updated_at || now,
            changeFrequency: 'monthly',
            priority: 0.5,
          };

          const featured = toAbsoluteImageUrl(post.featured_image);
          if (featured) {
            entry.images = [featured];
          }

          entries.push(entry);
        }
      }
    }
  } catch (e) {
    console.warn('Sitemap: could not fetch blog posts from Supabase', e.message);
  }

  return entries;
}
