import { getSupabaseAdminClient, getSupabaseServerClient } from '@/lib/supabase';
import BlogClient from '@/components/BlogClient';
import { JsonLd } from '@/lib/schemas';

export const revalidate = 3600;

export const metadata = {
  title: 'Flooring Blog — Neighbourhood Flooring Guides',
  description: 'Neighbourhood-specific flooring advice from BBS Flooring in Markham. Real products, real homes — vinyl, hardwood, laminate & stair guides for the GTA.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Flooring Blog — Neighbourhood Flooring Guides',
    description: 'Neighbourhood-specific flooring advice from BBS Flooring in Markham. Real products, real homes — vinyl, hardwood, laminate & stair guides for the GTA.',
    url: '/blog',
    type: 'website',
  },
};

async function getPosts() {
  const supabase = getSupabaseAdminClient() || getSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, featured_image, image_alt_text, author_name, category, tags, keywords, read_time, status, published_at, view_count, neighbourhood, city, created_at, updated_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (error) console.error('[Blog] Server fetch error:', error.message);
  return data || [];
}

export default async function BlogPage() {
  const posts = await getPosts();

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bbsflooring.ca/' },
      { '@type': 'ListItem', position: 2, name: 'Blog' },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <BlogClient initialPosts={posts} />
    </>
  );
}
