'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/lib/base44-compat';
import ProductCard from './ProductCard';

const STORAGE_KEY = 'bbs_recently_viewed';
const MAX_ITEMS = 12;

/** Record a product view in localStorage */
export function recordProductView(product) {
  if (!product?.id || typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let ids = raw ? JSON.parse(raw) : [];
    // Remove if already present, then prepend
    ids = ids.filter(id => id !== product.id);
    ids.unshift(product.id);
    // Cap at MAX_ITEMS
    if (ids.length > MAX_ITEMS) ids = ids.slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch { /* localStorage unavailable */ }
}

/** Get recently viewed IDs from localStorage */
function getRecentIds() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export default function RecentlyViewed({ excludeProductId, limit = 4 }) {
  const [recentIds, setRecentIds] = useState([]);

  useEffect(() => {
    const ids = getRecentIds().filter(id => id !== excludeProductId);
    setRecentIds(ids.slice(0, limit));
  }, [excludeProductId, limit]);

  const { data: products = [] } = useQuery({
    queryKey: ['recentlyViewed', recentIds.join(',')],
    queryFn: async () => {
      if (recentIds.length === 0) return [];
      // Fetch each product by ID — small list so this is fine
      const results = await Promise.all(
        recentIds.map(id => entities.Product.get(id).catch(() => null))
      );
      // Maintain order (most recent first), filter nulls + missing images
      return results.filter(p => p && p.image_url);
    },
    enabled: recentIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  if (products.length === 0) return null;

  return (
    <div className="mt-20 pt-12 border-t border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Recently Viewed</h2>
      <p className="text-slate-600 mb-8">Pick up where you left off</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
