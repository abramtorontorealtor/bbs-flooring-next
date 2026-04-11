'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { Calendar, Clock, MapPin, ArrowLeft, Share2, Phone, Ruler, Star, ChevronRight } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getBlogPostBreadcrumbs } from '@/lib/breadcrumbs';

function formatDate(dateStr, long = false) {
  if (!dateStr) return '';
  const opts = long
    ? { month: 'long', day: 'numeric', year: 'numeric' }
    : { month: 'short', day: 'numeric', year: 'numeric' };
  return new Date(dateStr).toLocaleDateString('en-US', opts);
}

function detectTopic(post) {
  const t = (post.title || '').toLowerCase();
  if (t.includes('stair')) return 'Stairs';
  if (t.includes('vinyl')) return 'Vinyl';
  if (t.includes('laminate')) return 'Laminate';
  if (t.includes('solid hardwood')) return 'Solid Hardwood';
  if (t.includes('engineered hardwood') || t.includes('engineered')) return 'Engineered Hardwood';
  if (t.includes('trend') || t.includes('guide') || t.includes('vs.') || t.includes('vs ')) return 'Guides';
  return 'Flooring Tips';
}

export default function BlogPostClient({ slug, initialPost = null }) {
  const [post, setPost] = useState(initialPost);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(!initialPost);

  useEffect(() => {
    async function loadPost() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase || !slug) { setIsLoading(false); return; }
      let p = initialPost;
      if (!p) {
        const { data: posts } = await supabase.from('blog_posts').select('*').eq('slug', slug).eq('status', 'published').limit(1);
        p = posts?.[0] || null;
        setPost(p);
      }
      // Fetch related posts — prefer same neighbourhood, then same category
      if (p) {
        let related = [];
        if (p.neighbourhood) {
          const { data } = await supabase
            .from('blog_posts')
            .select('id,slug,title,excerpt,featured_image,image_alt_text,published_at,read_time,neighbourhood')
            .eq('status', 'published')
            .eq('neighbourhood', p.neighbourhood)
            .neq('id', p.id)
            .limit(3);
          related = data || [];
        }
        // Fill remaining slots from same category
        if (related.length < 3 && p.category) {
          const existingIds = [p.id, ...related.map(r => r.id)];
          const { data } = await supabase
            .from('blog_posts')
            .select('id,slug,title,excerpt,featured_image,image_alt_text,published_at,read_time,neighbourhood')
            .eq('category', p.category)
            .eq('status', 'published')
            .not('id', 'in', `(${existingIds.join(',')})`)
            .order('published_at', { ascending: false })
            .limit(3 - related.length);
          related = [...related, ...(data || [])];
        }
        setRelatedPosts(related);
      }
      setIsLoading(false);
    }
    loadPost();
  }, [slug, initialPost]);

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
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="space-y-6">
          <div className="h-8 bg-slate-100 rounded animate-pulse w-1/3" />
          <div className="h-12 bg-slate-100 rounded animate-pulse" />
          <div className="h-4 bg-slate-100 rounded animate-pulse w-2/3" />
          <div className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-4 bg-slate-100 rounded animate-pulse" />)}</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Blog Post Not Found</h1>
        <p className="text-slate-600 mb-8">The article you&apos;re looking for doesn&apos;t exist or hasn&apos;t been published yet.</p>
        <Link href="/blog" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </div>
    );
  }

  const topic = detectTopic(post);

  return (
    <div className="max-w-3xl mx-auto px-4 pt-8 pb-12 md:pt-12 md:pb-16">
      <Breadcrumbs items={getBlogPostBreadcrumbs(post.title)} />

      {/* Article header — title FIRST, then image */}
      <article>
        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
            {topic}
          </span>
          {post.neighbourhood && (
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full">
              <MapPin className="w-3 h-3" />
              {post.neighbourhood}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] md:leading-[1.15] font-extrabold text-slate-800 mb-4">
          {post.title}
        </h1>

        {/* Author + date + share row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 mb-6 pb-6 border-b border-slate-200">
          <span className="font-medium text-slate-700">
            {post.author_name || 'BBS Flooring Team'}
          </span>
          {post.published_at && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(post.published_at, true)}
            </span>
          )}
          {post.read_time && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.read_time} min read
            </span>
          )}
          <button
            onClick={handleShare}
            className="ml-auto inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Share article"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>

        {/* Hero image — below title */}
        {post.featured_image && (
          <div className="relative rounded-2xl overflow-hidden mb-10 aspect-[16/9]">
            <Image
              src={post.featured_image}
              alt={post.image_alt_text || post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        {/* Article body */}
        <div
          className="prose prose-lg max-w-none
            prose-headings:font-bold prose-headings:text-slate-800 prose-headings:mt-10 prose-headings:mb-4
            prose-h2:text-2xl prose-h2:sm:text-[1.65rem]
            prose-h3:text-xl
            prose-p:text-slate-600 prose-p:leading-[1.8] prose-p:mb-5
            prose-a:text-amber-600 prose-a:font-medium hover:prose-a:text-amber-700 prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-xl prose-img:my-8
            prose-strong:text-slate-800 prose-strong:font-semibold
            prose-ul:text-slate-600 prose-ol:text-slate-600
            prose-li:leading-[1.7] prose-li:mb-1"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
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
            { href: '/installation', label: 'Professional Installation', icon: '🔨' },
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
            { href: '/hardwood-refinishing', label: 'Hardwood Refinishing', icon: '✨' },
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
          <div className="mt-12 bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-800 mb-4">Related Products & Services</h3>
            <div className="grid sm:grid-cols-3 gap-2.5">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100 hover:border-amber-300 hover:shadow-sm transition-all group"
                >
                  <span className="text-lg">{link.icon}</span>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-amber-600 transition-colors">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        );
      })()}

      {/* CTA Block */}
      <div className="mt-12 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-7 sm:p-8 md:p-10 text-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Ready to Transform Your Floors?</h2>
        <p className="text-slate-300 mb-6 text-sm sm:text-base max-w-xl">
          Get expert advice and a free in-home measurement. 794+ products in stock, professional installation, and the best prices in the GTA.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/free-measurement" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl transition-colors text-sm sm:text-base">
            <Ruler className="w-4 h-4" /> Free Measurement
          </Link>
          <a href="tel:6474281111" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl transition-colors border border-white/20 text-sm sm:text-base">
            <Phone className="w-4 h-4" /> (647) 428-1111
          </a>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-4 text-xs sm:text-sm text-slate-400">
          <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" /> 4.7★ · 41 Google Reviews</span>
          <span className="hidden sm:inline">·</span>
          <span>Serving Markham, Toronto & Durham</span>
        </div>
      </div>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <div className="mt-14 pt-10 border-t border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Keep Reading</h2>
            <Link href="/blog" className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
              All articles <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {relatedPosts.map((rp) => (
              <Link key={rp.id} href={`/blog/${rp.slug}`} className="group">
                <article className="bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all h-full flex flex-col">
                  {rp.featured_image && (
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={rp.featured_image}
                        alt={rp.image_alt_text || rp.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-4 flex flex-col flex-1">
                    {rp.neighbourhood && (
                      <div className="flex items-center gap-1 text-amber-600 text-xs font-medium mb-1.5">
                        <MapPin className="w-3 h-3" />
                        {rp.neighbourhood}
                      </div>
                    )}
                    <h3 className="font-semibold text-slate-800 group-hover:text-amber-600 transition-colors line-clamp-2 text-sm leading-snug mb-1.5">
                      {rp.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 flex-1">{rp.excerpt}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 pt-2 border-t border-slate-100">
                      {rp.published_at && <span>{formatDate(rp.published_at)}</span>}
                      {rp.read_time && <span>· {rp.read_time} min</span>}
                    </div>
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
