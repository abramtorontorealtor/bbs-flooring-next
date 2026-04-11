'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, MapPin, Clock, ChevronRight } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getStaticBreadcrumbs } from '@/lib/breadcrumbs';

// Derive topic from post title/content
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

const TOPICS = [
  { value: 'all', label: 'All Articles' },
  { value: 'Vinyl', label: 'Vinyl' },
  { value: 'Engineered Hardwood', label: 'Engineered Hardwood' },
  { value: 'Solid Hardwood', label: 'Solid Hardwood' },
  { value: 'Laminate', label: 'Laminate' },
  { value: 'Stairs', label: 'Stairs' },
  { value: 'Guides', label: 'Guides' },
];

const POSTS_PER_PAGE = 9;

function PostCard({ post, featured = false }) {
  const topic = detectTopic(post);

  if (featured) {
    return (
      <Link href={`/blog/${post.slug}`} className="group block mb-12">
        <div className="relative rounded-2xl overflow-hidden bg-slate-900">
          {post.featured_image && (
            <div className="relative aspect-[21/9] sm:aspect-[2.4/1]">
              <Image
                src={post.featured_image}
                alt={post.image_alt_text || post.title}
                fill
                className="object-cover opacity-60 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500"
                sizes="(max-width: 768px) 100vw, 1280px"
                priority
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                Latest
              </span>
              <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                {topic}
              </span>
              {post.neighbourhood && (
                <span className="hidden sm:inline-flex items-center gap-1 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                  <MapPin className="w-3 h-3" />
                  {post.neighbourhood}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors line-clamp-2 max-w-3xl">
              {post.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 line-clamp-2 max-w-2xl mb-3 hidden sm:block">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              {post.published_at && (
                <span>{new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              )}
              {post.read_time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.read_time} min read
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} className="group">
      <article className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-200 h-full flex flex-col">
        {post.featured_image && (
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={post.featured_image}
              alt={post.image_alt_text || post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {/* Topic badge overlay */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded-md shadow-sm">
                {topic}
              </span>
            </div>
          </div>
        )}
        <div className="p-4 sm:p-5 flex flex-col flex-1">
          {/* Neighbourhood */}
          {post.neighbourhood && (
            <div className="flex items-center gap-1 text-amber-600 text-xs font-medium mb-2">
              <MapPin className="w-3 h-3" />
              {post.neighbourhood}
            </div>
          )}
          <h3 className="font-bold text-slate-800 text-[15px] leading-snug mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-slate-500 text-sm line-clamp-2 flex-1 leading-relaxed">
            {post.excerpt}
          </p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              {post.published_at && (
                <span>{new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              )}
              {post.read_time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.read_time} min
                </span>
              )}
            </div>
            <span className="text-amber-600 text-xs font-medium flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              Read <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function BlogClient({ initialPosts = [] }) {
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('all');
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  // Topic counts
  const topicCounts = useMemo(() => {
    const counts = { all: initialPosts.length };
    initialPosts.forEach(p => {
      const t = detectTopic(p);
      counts[t] = (counts[t] || 0) + 1;
    });
    return counts;
  }, [initialPosts]);

  const filtered = useMemo(() => {
    return initialPosts.filter(p => {
      if (topic !== 'all' && detectTopic(p) !== topic) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          p.title?.toLowerCase().includes(q) ||
          p.excerpt?.toLowerCase().includes(q) ||
          p.neighbourhood?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [initialPosts, topic, search]);

  const featured = filtered[0];
  const rest = filtered.slice(1, visibleCount + 1);
  const hasMore = filtered.length > visibleCount + 1;

  return (
    <div className="max-w-7xl mx-auto px-4 pt-10 pb-12 md:pt-14 md:pb-16">
      <Breadcrumbs items={getStaticBreadcrumbs('/blog')} />

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-800 mb-3">
          Flooring Blog
        </h1>
        <p className="text-base sm:text-lg text-slate-500 max-w-xl">
          Neighbourhood-specific flooring advice from our Markham team. Real products, real homes, real talk.
        </p>
      </div>

      {/* Topic chips + Search */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Topic chips — horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          {TOPICS.map(t => {
            const count = topicCounts[t.value] || 0;
            if (t.value !== 'all' && count === 0) return null;
            const active = topic === t.value;
            return (
              <button
                key={t.value}
                onClick={() => { setTopic(t.value); setVisibleCount(POSTS_PER_PAGE); }}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium px-3.5 py-2 rounded-full transition-all shrink-0 ${
                  active
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.label}
                <span className={`text-xs ${active ? 'text-slate-400' : 'text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or neighbourhood..."
            value={search}
            onChange={e => { setSearch(e.target.value); setVisibleCount(POSTS_PER_PAGE); }}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <p className="text-5xl mb-4">📝</p>
          <p className="text-lg font-semibold">No articles found</p>
          <p className="text-sm mt-1">Try a different search or topic.</p>
        </div>
      )}

      {/* Featured post */}
      {featured && <PostCard post={featured} featured />}

      {/* Post grid */}
      {rest.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {rest.map(post => (
            <PostCard key={post.id || post.slug} post={post} />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center mt-10">
          <button
            onClick={() => setVisibleCount(prev => prev + POSTS_PER_PAGE)}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Load More Articles
            <span className="text-slate-400 text-xs">
              ({filtered.length - visibleCount - 1} remaining)
            </span>
          </button>
        </div>
      )}

      {/* Browse by Neighbourhood */}
      {topic === 'all' && !search && (() => {
        const neighbourhoods = [...new Set(initialPosts.map(p => p.neighbourhood).filter(Boolean))].sort();
        if (neighbourhoods.length < 3) return null;
        return (
          <div className="mt-16 pt-12 border-t border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Browse by Neighbourhood</h2>
            <p className="text-sm text-slate-500 mb-6">Flooring advice tailored to homes in your area.</p>
            <div className="flex flex-wrap gap-2">
              {neighbourhoods.map(n => {
                const count = initialPosts.filter(p => p.neighbourhood === n).length;
                return (
                  <button
                    key={n}
                    onClick={() => { setSearch(n); }}
                    className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-700 hover:text-amber-700 text-sm font-medium px-3 py-2 rounded-lg transition-all"
                  >
                    <MapPin className="w-3 h-3" />
                    {n}
                    <span className="text-slate-400 text-xs">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
