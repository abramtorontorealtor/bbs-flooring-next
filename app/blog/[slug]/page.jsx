import { getSupabaseServerClient } from '@/lib/supabase';
import BlogPostClient from '@/components/BlogPostClient';
import { JsonLd } from '@/lib/schemas';
import Breadcrumbs from '@/components/Breadcrumbs';

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

async function getPost(slug) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('title,seo_title,seo_description,excerpt,featured_image,keywords,author,created_at,updated_at,slug,category')
    .eq('slug', slug)
    .limit(1);
  return posts?.[0] || null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Blog Post Not Found | BBS Flooring' };
  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    keywords: post.keywords || undefined,
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      type: 'article',
      images: post.featured_image ? [post.featured_image] : [],
      publishedTime: post.created_at,
      modifiedTime: post.updated_at || post.created_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo_title || post.title,
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

  return (
    <>
      {articleSchema && <JsonLd data={[articleSchema, breadcrumbSchema]} />}
      <BlogPostClient slug={slug} />
    </>
  );
}
