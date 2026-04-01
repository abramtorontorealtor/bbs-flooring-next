import { getSupabaseServerClient } from '@/lib/supabase';
import BlogPostClient from '@/components/BlogPostClient';

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
