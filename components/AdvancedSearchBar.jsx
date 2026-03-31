'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { entities } from '@/lib/base44-compat';

/**
 * AdvancedSearchBar — search products by name/brand/category
 * TODO: Port the full cloud function getAdvancedSearchResults to a Next.js API route.
 * For now, uses a simple client-side Supabase text search.
 */
export default function AdvancedSearchBar({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const router = useRouter();
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        // Simple search — will be replaced with proper API route later
        const products = await entities.Product.filter({}, { limit: 200 });
        const q = query.toLowerCase();
        const filtered = products.filter(p => 
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
        ).slice(0, 8);
        setResults(filtered);
        setOpen(filtered.length > 0);
      } catch (err) {
        console.warn('Search failed:', err);
        setResults([]);
      }
      setLoading(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelect = (product) => {
    setQuery('');
    setOpen(false);
    onClose?.();
    router.push(`/products/${product.slug}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setOpen(false);
      onClose?.();
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search flooring..."
          className="w-full pl-9 pr-8 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </form>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
          {results.map((product) => (
            <button
              key={product.id}
              onClick={() => handleSelect(product)}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex items-center gap-3"
            >
              {product.image_url && (
                <img src={product.image_url} alt="" className="w-10 h-10 object-cover rounded" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                <p className="text-xs text-slate-500">{product.brand} · {product.category}</p>
              </div>
              {(product.public_price || product.price_per_sqft) && (
                <span className="text-sm font-semibold text-amber-600">
                  ${(product.public_price || product.price_per_sqft).toFixed(2)}/sqft
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
