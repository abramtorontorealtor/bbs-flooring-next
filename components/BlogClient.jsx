'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { Search } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getStaticBreadcrumbs } from '@/lib/breadcrumbs';

const CATEGORIES = [
  { value: 'all', label: 'All Posts' },
  { value: 'flooring_tips', label: 'Flooring Tips' },
  { value: 'installation_guide', label: 'Installation Guides' },
  { value: 'design_trends', label: 'Design Trends' },
  { value: 'product_reviews', label: 'Product Reviews' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'company_news', label: 'Company News' },
];

export default function BlogClient() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [activeTag, setActiveTag] = useState(null);

  useEffect(() => {
    async function fetchPosts() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) { setLoading(false); return; }
      let query = supabase.from('blog_posts').select('*').eq('status', 'published').order('published_at', { ascending: false });
      const { data } = await query;
      setPosts(data || []);
      setLoading(false);
    }
    fetchPosts();
  }, []);

  // Extract popular tags from all posts
  const popularTags = (() => {
    const tagCount = {};
    posts.forEach(p => {
      const tags = Array.isArray(p.tags) ? p.tags : [];
      tags.forEach(t => {
        if (t && typeof t === 'string' && t.length > 1) {
          // Normalize: trim, title case
          const normalized = t.replace(/_/g, ' ').trim();
          tagCount[normalized] = (tagCount[normalized] || 0) + 1;
        }
      });
    });
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([tag]) => tag);
  })();

  const filtered = posts.filter(p => {
    if (category !== 'all' && p.category !== category) return false;
    if (search && !p.title?.toLowerCase().includes(search.toLowerCase()) && !p.excerpt?.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeTag) {
      const tags = Array.isArray(p.tags) ? p.tags.map(t => t.replace(/_/g, ' ').trim().toLowerCase()) : [];
      if (!tags.includes(activeTag.toLowerCase())) return false;
    }
    return true;
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-slate-200 rounded w-1/3" />
          <div className="h-64 bg-slate-200 rounded-2xl" />
          <div className="grid md:grid-cols-3 gap-6">{[1,2,3].map(i => <div key={i} className="h-48 bg-slate-200 rounded-xl" />)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Breadcrumbs items={getStaticBreadcrumbs('/blog')} />
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">Flooring Blog</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Expert tips, installation guides, and design inspiration for your flooring project.</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-400" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-white">
          {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
        </select>
      </div>

      {/* Tag Pills */}
      {popularTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {activeTag && (
            <button onClick={() => setActiveTag(null)}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors">
              ✕ Clear tag
            </button>
          )}
          {popularTags.map(tag => (
            <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                activeTag === tag
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-700'
              }`}>
              {tag}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <p className="text-5xl mb-4">📝</p>
          <p className="text-lg font-semibold">No articles found</p>
          <p className="text-sm mt-1">Try adjusting your search or filter.</p>
        </div>
      )}

      {/* Featured Post */}
      {featured && (
        <Link href={`/blog/${featured.slug}`} className="block mb-12 group">
          <div className="grid md:grid-cols-2 gap-6 bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
            {featured.featured_image && (
              <div className="relative aspect-video md:aspect-auto min-h-[240px] overflow-hidden">
                <Image src={featured.featured_image} alt={featured.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, 50vw" priority />
              </div>
            )}
            <div className="p-6 md:p-8 flex flex-col justify-center">
              {featured.category && (
                <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full mb-3 w-fit">
                  {featured.category.replace(/_/g, ' ')}
                </span>
              )}
              <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-amber-600 transition-colors">{featured.title}</h2>
              <p className="text-slate-600 text-sm line-clamp-3 mb-4">{featured.excerpt}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                {featured.published_at && <span>{new Date(featured.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                {featured.read_time && <span>· {featured.read_time} min read</span>}
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Post Grid */}
      {rest.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map(post => (
            <Link key={post.id || post.slug} href={`/blog/${post.slug}`} className="group">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                {post.featured_image && (
                  <div className="relative aspect-video overflow-hidden">
                    <Image src={post.featured_image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {post.category && (
                      <span className="inline-block bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded">
                        {post.category.replace(/_/g, ' ')}
                      </span>
                    )}
                    {Array.isArray(post.tags) && post.tags.slice(0, 2).map((tag, i) => (
                      <button key={i} onClick={(e) => { e.preventDefault(); setActiveTag(tag.replace(/_/g, ' ').trim()); }}
                        className="inline-block bg-amber-50 text-amber-700 text-[10px] font-medium px-1.5 py-0.5 rounded hover:bg-amber-100 transition-colors">
                        {tag.replace(/_/g, ' ').trim()}
                      </button>
                    ))}
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">{post.title}</h3>
                  <p className="text-slate-600 text-sm line-clamp-2 flex-1">{post.excerpt}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-3">
                    {(post.published_at || post.published_at) && <span>{new Date(post.published_at || post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                    {post.read_time && <span>· {post.read_time} min</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
