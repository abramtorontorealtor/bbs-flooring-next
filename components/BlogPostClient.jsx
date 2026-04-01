'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { Calendar, Clock, Tag, ArrowLeft, Share2 } from 'lucide-react';

const categories = [
  { value: 'flooring_tips', label: 'Flooring Tips' },
  { value: 'installation_guide', label: 'Installation Guide' },
  { value: 'design_trends', label: 'Design Trends' },
  { value: 'product_reviews', label: 'Product Reviews' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'company_news', label: 'Company News' },
];

function formatDate(dateStr, long = false) {
  if (!dateStr) return '';
  const opts = long ? { month: 'long', day: 'numeric', year: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' };
  return new Date(dateStr).toLocaleDateString('en-US', opts);
}

export default function BlogPostClient({ slug }) {
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase || !slug) { setIsLoading(false); return; }
      const { data: posts } = await supabase.from('blog_posts').select('*').eq('slug', slug).eq('status', 'published').limit(1);
      const p = posts?.[0] || null;
      setPost(p);
      if (p?.category) {
        const { data: related } = await supabase.from('blog_posts').select('id,slug,title,excerpt,featured_image,published_date,read_time').eq('category', p.category).eq('status', 'published').neq('id', p.id).limit(3);
        setRelatedPosts(related || []);
      }
      setIsLoading(false);
    }
    loadPost();
  }, [slug]);

  const handleShare = async () => {
    const shareData = { title: post?.title, text: post?.excerpt, url: window.location.href };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-6">
          <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-8 bg-slate-100 rounded animate-pulse" />
          <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-4 bg-slate-100 rounded animate-pulse" />)}</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Blog Post Not Found</h1>
        <p className="text-slate-600 mb-8">The article you&apos;re looking for doesn&apos;t exist or hasn&apos;t been published yet.</p>
        <Link href="/blog" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/blog" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-8 -ml-2 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Blog
      </Link>

      {post.featured_image && (
        <div className="rounded-2xl overflow-hidden mb-8">
          <img src={post.featured_image} alt={post.image_alt_text || post.title} className="w-full h-96 object-cover" />
        </div>
      )}

      <article className="prose prose-lg max-w-none">
        {post.category && <span className="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold mb-4">{post.category.replace('_', ' ').toUpperCase()}</span>}
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">{post.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-slate-600 mb-8 not-prose">
          {post.author_name && <span className="font-medium">By {post.author_name}</span>}
          {post.published_date && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDate(post.published_date, true)}</span>}
          {post.read_time && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{post.read_time} min read</span>}
          <button onClick={handleShare} className="ml-auto inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 not-prose">
            {post.tags.map((tag, i) => <span key={i} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm"><Tag className="w-3 h-3" />{tag}</span>)}
          </div>
        )}

        <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-amber-600 hover:prose-a:text-amber-700 prose-img:rounded-xl prose-strong:text-slate-800"
          dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>

      {relatedPosts.length > 0 && (
        <div className="mt-16 pt-16 border-t border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-8">Related Articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedPosts.map((rp) => (
              <Link key={rp.id} href={`/blog/${rp.slug}`}>
                <article className="group bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-lg transition-all">
                  {rp.featured_image && (
                    <div className="h-40 overflow-hidden">
                      <img src={rp.featured_image} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-800 group-hover:text-amber-600 transition-colors line-clamp-2 mb-2">{rp.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2">{rp.excerpt}</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
