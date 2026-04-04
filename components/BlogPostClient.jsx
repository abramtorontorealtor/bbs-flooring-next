'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { Calendar, Clock, Tag, ArrowLeft, Share2, Phone, Ruler, Star } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getBlogPostBreadcrumbs } from '@/lib/breadcrumbs';

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
        const { data: related } = await supabase.from('blog_posts').select('id,slug,title,excerpt,featured_image,published_at,read_time').eq('category', p.category).eq('status', 'published').neq('id', p.id).limit(3);
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
      <Breadcrumbs items={getBlogPostBreadcrumbs(post.title)} />

      {post.featured_image && (
        <div className="relative rounded-2xl overflow-hidden mb-8 h-96">
          <Image src={post.featured_image} alt={post.image_alt_text || post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 896px" priority />
        </div>
      )}

      <article className="prose prose-lg max-w-none">
        {post.category && <span className="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold mb-4">{post.category.replace('_', ' ').toUpperCase()}</span>}
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">{post.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-slate-600 mb-8 not-prose">
          {post.author_name && <span className="font-medium">By {post.author_name}</span>}
          {post.published_at && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDate(post.published_at, true)}</span>}
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

      {/* Category-Contextual Internal Links */}
      {post.category && (() => {
        const linkMap = {
          flooring_tips: [
            { href: '/products', label: 'Browse 794+ Flooring Products', icon: '🏠' },
            { href: '/quote-calculator', label: 'Get an Instant Quote', icon: '💰' },
            { href: '/compare', label: 'Compare Flooring Types', icon: '⚖️' },
          ],
          installation_guide: [
            { href: '/installation', label: 'Professional Installation Services', icon: '🔨' },
            { href: '/free-measurement', label: 'Book a Free Measurement', icon: '📏' },
            { href: '/flooring-installation-cost', label: 'Installation Cost Calculator', icon: '💰' },
          ],
          design_trends: [
            { href: '/gallery', label: 'Project Gallery & Inspiration', icon: '📸' },
            { href: '/vinyl', label: 'Shop Vinyl Flooring', icon: '🏠' },
            { href: '/engineered-hardwood', label: 'Shop Engineered Hardwood', icon: '🪵' },
          ],
          product_reviews: [
            { href: '/products', label: 'Browse All Products', icon: '🛒' },
            { href: '/vidar-flooring', label: 'Vidar Collection', icon: '🌳' },
            { href: '/quote-calculator', label: 'Get Your Quote', icon: '💰' },
          ],
          maintenance: [
            { href: '/hardwood-refinishing', label: 'Hardwood Refinishing Service', icon: '✨' },
            { href: '/products', label: 'Shop Replacement Flooring', icon: '🏠' },
            { href: '/contact', label: 'Ask an Expert', icon: '💬' },
          ],
          company_news: [
            { href: '/about', label: 'About BBS Flooring', icon: '📖' },
            { href: '/flooring-showroom-markham', label: 'Visit Our Showroom', icon: '📍' },
            { href: '/free-measurement', label: 'Book a Free Measurement', icon: '📏' },
          ],
        };
        const links = linkMap[post.category] || linkMap.flooring_tips;
        return (
          <div className="mt-10 bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Related Products & Services</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100 hover:border-amber-300 hover:shadow-sm transition-all group"
                >
                  <span className="text-xl">{link.icon}</span>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-amber-600 transition-colors">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Blog Post CTA Block */}
      <div className="mt-12 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 md:p-10 text-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to Transform Your Floors?</h2>
        <p className="text-slate-300 mb-6 max-w-2xl">
          Get expert advice and a free in-home measurement from BBS Flooring. 794+ products in stock, professional installation, and the best prices in the GTA.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/free-measurement" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
            <Ruler className="w-4 h-4" /> Free Measurement
          </Link>
          <a href="tel:6474281111" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg transition-colors border border-white/20">
            <Phone className="w-4 h-4" /> (647) 428-1111
          </a>
          <Link href="/products" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg transition-colors border border-white/20">
            Browse Products
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-5 text-sm text-slate-400">
          <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-400" /> 4.7★ from 41 Google Reviews</span>
          <span>•</span>
          <span>Serving Markham, Toronto & Durham</span>
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <div className="mt-16 pt-16 border-t border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-8">Related Articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedPosts.map((rp) => (
              <Link key={rp.id} href={`/blog/${rp.slug}`}>
                <article className="group bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-lg transition-all">
                  {rp.featured_image && (
                    <div className="relative h-40 overflow-hidden">
                      <Image src={rp.featured_image} alt={rp.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
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
