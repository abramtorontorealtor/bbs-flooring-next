'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '@/components/ProductCard';
import { createPageUrl } from '@/lib/routes';

function ArrowRightIcon({ className = 'w-4 h-4' }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;
}

export default function ProductShowcase() {
  const [showcaseTab, setShowcaseTab] = useState('new');

  const { data: featuredProducts = [] } = useQuery({
    queryKey: ['featuredProductsOptimized'],
    queryFn: async () => {
      const res = await fetch('/api/products/grid?limit=8');
      if (!res.ok) return [];
      const data = await res.json();
      return data.filter(p => p.image_url).slice(0, 8);
    },
  });

  const { data: popularProducts = [] } = useQuery({
    queryKey: ['popularProductsHome'],
    queryFn: async () => {
      const res = await fetch('/api/products/grid?limit=50');
      if (!res.ok) return [];
      const items = await res.json();
      const withImages = items.filter(p => p.image_url && p.price_per_sqft > 0);
      withImages.sort((a, b) => (b.price_per_sqft || 0) - (a.price_per_sqft || 0));
      const seen = {};
      const result = [];
      for (const p of withImages) {
        const cat = p.category || 'other';
        if (!seen[cat]) seen[cat] = 0;
        if (seen[cat] < 3) { result.push(p); seen[cat]++; }
        if (result.length >= 8) break;
      }
      return result;
    },
  });

  const { data: saleProducts = [] } = useQuery({
    queryKey: ['saleProductsHome'],
    queryFn: async () => {
      const res = await fetch('/api/products/grid?sale=true&limit=16');
      if (!res.ok) return [];
      const items = await res.json();
      return items.filter(p => p.image_url).slice(0, 8);
    },
  });

  const { data: clearanceProducts = [] } = useQuery({
    queryKey: ['clearanceProductsHome'],
    queryFn: async () => {
      const res = await fetch('/api/products/grid?clearance=true&limit=4');
      if (!res.ok) return [];
      return (await res.json()).filter(p => p.image_url).slice(0, 4);
    },
  });

  if (featuredProducts.length === 0 && clearanceProducts.length === 0) return null;

  const tabProducts = showcaseTab === 'popular' ? popularProducts
    : showcaseTab === 'sale' ? saleProducts
    : featuredProducts;
  const emptyMsg = showcaseTab === 'sale' && tabProducts.length === 0 ? 'No sale items right now — check back soon!' : null;

  return (
    <>
      {/* Product Showcase — Multi-Tab */}
      {featuredProducts.length > 0 && (
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
              <div>
                <h2 className="text-4xl font-bold text-slate-800 mb-2">Shop Our Flooring</h2>
                <p className="text-slate-600">Handpicked selections from our 700+ product showroom</p>
              </div>
              <Link href={createPageUrl('Products')} className="hidden sm:flex items-center gap-2 border border-slate-200 bg-white shadow-sm hover:bg-slate-50 hover:text-amber-600 rounded-md text-sm font-medium h-9 px-4 py-2 transition-colors">
                View All Products <ArrowRightIcon className="ml-2 w-4 h-4" />
              </Link>
            </div>

            <div className="flex gap-1 mb-8 bg-slate-100 rounded-xl p-1 w-fit">
              {[
                { key: 'new', label: 'New Arrivals', icon: '✨' },
                { key: 'popular', label: 'Best Sellers', icon: '🔥' },
                { key: 'sale', label: 'On Sale', icon: '💰' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setShowcaseTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    showcaseTab === tab.key
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span className="mr-1.5">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {emptyMsg ? (
              <p className="text-slate-500 text-center py-8">{emptyMsg}</p>
            ) : (
              <>
                <div className="grid grid-cols-2 md:hidden gap-4">
                  {tabProducts.slice(0, 4).map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {tabProducts.slice(0, 8).map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}

            <div className="mt-8 text-center md:hidden">
              <Link href={createPageUrl('Products') + (showcaseTab === 'new' ? '?sort=newest' : '')} className="flex items-center justify-center gap-2 w-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 hover:text-amber-600 rounded-md text-sm font-medium h-10 px-8 transition-colors">
                View All Products <ArrowRightIcon className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Clearance Deals */}
      {clearanceProducts.length > 0 && (
        <section className="py-20 px-4 bg-red-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <div className="inline-flex items-center gap-2 bg-red-100 border border-red-200 rounded-full px-4 py-1.5 mb-4">
                  <span className="text-red-700 text-sm font-bold uppercase tracking-wider">Clearance</span>
                </div>
                <h2 className="text-4xl font-bold text-slate-800 mb-2">Clearance Deals</h2>
                <p className="text-slate-600">Premium flooring at closeout prices. When it's gone, it's gone.</p>
              </div>
              <Link href={createPageUrl('Clearance')} className="hidden sm:flex items-center gap-2 border border-red-300 text-red-700 hover:bg-red-100 bg-white shadow-sm rounded-md text-sm font-medium h-9 px-4 py-2 transition-colors">
                Shop All Clearance <ArrowRightIcon className="ml-2 w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {clearanceProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link href={createPageUrl('Clearance')} className="flex items-center justify-center gap-2 w-full border border-red-300 text-red-700 hover:bg-red-100 bg-white shadow-sm rounded-md text-sm font-medium h-10 px-8 transition-colors">
                Shop All Clearance <ArrowRightIcon className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
