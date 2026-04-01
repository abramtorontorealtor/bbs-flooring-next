import { getSupabaseServerClient } from '@/lib/supabase';
import BlogPostClient from '@/components/BlogPostClient';

// ISR: revalidate blog posts every hour
export const revalidate = 3600;

// Pre-generate published blog posts at build time
export async function generateStaticParams() {
  try {
    const supabase = getSupabaseServerClient();
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

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const supabase = getSupabaseServerClient();
  if (!supabase) return { title: 'Blog Post | BBS Flooring' };
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('title,seo_title,seo_description,excerpt,featured_image,keywords')
    .eq('slug', slug)
    .limit(1);
  const post = posts?.[0];
  if (!post) return { title: 'Blog Post Not Found | BBS Flooring' };
  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      images: post.featured_image ? [post.featured_image] : [],
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  return <BlogPostClient slug={slug} />;
}
