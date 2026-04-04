import { getSupabaseServerClient } from '@/lib/supabase';
import { locationData } from '@/data/locationData';

// Force dynamic rendering so Supabase queries run at request time (not build time)
export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bbsflooring.ca';

export default async function sitemap() {
  const entries = [];
  const now = new Date().toISOString();

  // ── Static pages ──
  const staticPages = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/products', priority: 0.9, changeFrequency: 'daily' },
    { path: '/clearance', priority: 0.9, changeFrequency: 'daily' },
    // /flooring-clearance-sale canonicals to /clearance — omitted from sitemap
    // Category pages
    { path: '/engineered-hardwood', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/solid-hardwood', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/vinyl', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/laminate', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/waterproof-flooring', priority: 0.8, changeFrequency: 'weekly' },
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
    { path: '/free-measurement', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/flooring-installation-cost', priority: 0.8, changeFrequency: 'monthly' },
    // Content pages
    { path: '/flooring-showroom-markham', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/contact', priority: 0.6, changeFrequency: 'yearly' },
    { path: '/gallery', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/blog', priority: 0.7, changeFrequency: 'daily' },
    { path: '/financing', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/compare', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/quote-calculator', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/room-visualizer', priority: 0.6, changeFrequency: 'monthly' },
    // Policy pages
    { path: '/privacy-policy', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/terms-of-service', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/return-policy', priority: 0.2, changeFrequency: 'yearly' },
  ];

  for (const page of staticPages) {
    entries.push({
      url: `${SITE_URL}${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    });
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

  // ── Product pages (from Supabase) ──
  try {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data: products } = await supabase
        .from('products')
        .select('slug, updated_at')
        .not('slug', 'is', null)
        .eq('is_variant', false)
        .order('updated_at', { ascending: false });

      if (products) {
        for (const product of products) {
          entries.push({
            url: `${SITE_URL}/products/${product.slug}`,
            lastModified: product.updated_at || now,
            changeFrequency: 'weekly',
            priority: 0.6,
          });
        }
      }
    }
  } catch (e) {
    console.warn('Sitemap: could not fetch products from Supabase', e.message);
  }

  // ── Blog posts (from Supabase) ──
  try {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data: posts } = await supabase
        .from('blog_posts')
        .select('slug, updated_at')
        .eq('status', 'published')
        .not('slug', 'is', null)
        .order('published_at', { ascending: false });

      if (posts) {
        for (const post of posts) {
          entries.push({
            url: `${SITE_URL}/blog/${post.slug}`,
            lastModified: post.updated_at || now,
            changeFrequency: 'monthly',
            priority: 0.5,
          });
        }
      }
    }
  } catch (e) {
    console.warn('Sitemap: could not fetch blog posts from Supabase', e.message);
  }

  return entries;
}
