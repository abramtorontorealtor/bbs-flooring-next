'use client';

import Image from 'next/image';

// AdvancedSearchBar.jsx — Client-Side Search (Next.js port)
// Uses frontend SDK entities.Product.filter() + client-side scoring.
// Backend getAdvancedSearchResults is NOT called.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { entities } from '@/lib/base44-compat';
import { createPageUrl } from '@/lib/routes';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const Product = entities.Product;

let productCache = null;
let cacheBuilding = false;
const CACHE_TTL = 30 * 60 * 1000;
let lastCacheTime = 0;

const SYNONYMS = {
  'lvp': 'vinyl', 'spc': 'vinyl', 'wpc': 'vinyl',
  'luxury vinyl': 'vinyl', 'luxury vinyl plank': 'vinyl',
  'hardwood': 'solid hardwood', 'solid': 'solid hardwood',
  'engineered': 'engineered hardwood', 'eng': 'engineered hardwood',
  'hdf': 'laminate', 'grey': 'gray', 'gray': 'gray',
};

const TYPO_OVERRIDES = {
  'laminate': /lam[ia]nate/i,
  'limanate': /lam[ia]nate/i,
  'vinyl': /v[iy]n[iy]l/i,
  'vynil': /v[iy]n[iy]l/i,
  'hardwood': /hard\s*wood/i,
  'hardwod': /hard\s*wood/i,
  'engineerd': /engineer/i,
  'engieered': /engineer/i,
  'engineered': /engineer/i,
  'hickery': /hickory/i,
  'hickory': /hickory/i,
  'wallnut': /walnut/i,
  'walnut': /walnut/i,
};

function buildFuzzyRegex(term) {
  if (TYPO_OVERRIDES[term.toLowerCase()]) return TYPO_OVERRIDES[term.toLowerCase()];
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escaped, 'i');
}

function scoreProduct(product, terms) {
  let totalScore = 0;
  let termsMatched = 0;
  for (const term of terms) {
    const rx = buildFuzzyRegex(term);
    let s = 0;
    if (rx.test(product._name)) s += 100;
    if (rx.test(product._brand)) s += 70;
    if (rx.test(product._sku)) s += 60;
    if (rx.test(product._category)) s += 50;
    if (rx.test(product._colour)) s += 40;
    if (rx.test(product._species)) s += 40;
    if (rx.test(product._finish)) s += 40;
    if (rx.test(product._grade)) s += 40;
    if (rx.test(product._dimensions)) s += 35;
    if (rx.test(product._description)) s += 20;
    if (rx.test(product._specs)) s += 15;
    if (s > 0) { termsMatched++; totalScore += s; }
  }
  if (termsMatched === 0) return 0;
  return termsMatched === terms.length ? totalScore * 10 : totalScore * (termsMatched / terms.length);
}

async function buildClientCache() {
  if (cacheBuilding) return;
  cacheBuilding = true;
  try {
    // Lean grid API — card-level fields only
    const res = await fetch('/api/products/grid?limit=1000');
    const all = res.ok ? await res.json() : [];

    productCache = all.filter(p => p.name && !p.is_archived_variant && !p.parent_product_id).map(p => {
      return {
        id: p.id,
        slug: p.slug || p.id,
        name: p.name || 'Unnamed Product',
        brand: p.brand || '',
        image_url: p.image_url || p.image || p.thumbnail || null,
        public_price: p.public_price ?? p.sale_price_per_sqft ?? p.price_per_sqft ?? 0,
        member_price: p.member_price ?? p.sale_price_per_sqft ?? p.price_per_sqft ?? 0,
        category: p.category || '',
        _name: (p.name || '').toLowerCase(),
        _brand: (p.brand || '').toLowerCase(),
        _sku: (p.sku || '').toLowerCase(),
        _category: (p.category || '').toLowerCase(),
        _colour: (p.colour || '').toLowerCase(),
        _species: (p.species || '').toLowerCase(),
        _finish: (p.finish || '').toLowerCase(),
        _grade: (p.grade || '').toLowerCase(),
        _dimensions: (p.dimensions || '').toLowerCase(),
        _description: (p.product_description || '').toLowerCase(),
        _specs: (p.specifications || '').toLowerCase(),
      };
    });
    lastCacheTime = Date.now();
    // cache built silently — productCache.length products indexed
  } catch (err) {
    console.error('[Search] Cache build failed:', err);
    productCache = null;
  } finally {
    cacheBuilding = false;
  }
}

function clientSearch(query, limit) {
  if (!limit) limit = 8;
  if (!productCache || productCache.length === 0) return [];
  var rawTerms = query.toLowerCase().trim().split(/\s+/);
  var terms = Array.from(new Set(rawTerms.map(function(t) { return SYNONYMS[t] || t; })));
  var scored = productCache
    .map(function(p) { return Object.assign({}, p, { score: scoreProduct(p, terms) }); })
    .filter(function(p) { return p.score > 0; })
    .sort(function(a, b) { return b.score - a.score; });
  var seen = new Set();
  var results = [];
  for (var i = 0; i < scored.length; i++) {
    var p = scored[i];
    if (!seen.has(p.slug)) {
      seen.add(p.slug);
      var clean = {
        id: p.id, slug: p.slug, name: p.name, brand: p.brand,
        image_url: p.image_url, public_price: p.public_price, member_price: p.member_price, category: p.category
      };
      results.push(clean);
    }
    if (results.length >= limit) break;
  }
  return results;
}

export default function AdvancedSearchBar({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [cacheReady, setCacheReady] = useState(!!productCache);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const router = useRouter();
  const { user } = useAuth();
  const isVerified = user?.is_verified === true;

  useEffect(function() {
    if (!productCache || (Date.now() - lastCacheTime > CACHE_TTL)) {
      buildClientCache().then(function() { setCacheReady(true); });
    }
  }, []);

  const handleFocus = useCallback(function() {
    if (results.length > 0) setShowDropdown(true);
  }, [results.length]);

  useEffect(function() {
    clearTimeout(debounceRef.current);
    var trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setShowDropdown(false);
      setHasError(false);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setHasError(false);
    debounceRef.current = setTimeout(function() {
      try {
        if (productCache) {
          var items = clientSearch(trimmed, 8);
          setResults(items);
          if (items.length === 0 && productCache.length < 100) {
            // Cache loaded but very small — something may be wrong
            setHasError(false); // still show "no results" rather than error
          }
        } else {
          setResults([]);
          setHasError(true);
        }
        setShowDropdown(true);
      } catch (err) {
        setResults([]);
        setHasError(true);
        setShowDropdown(true);
      } finally {
        setIsLoading(false);
      }
    }, 150);
    return function() { clearTimeout(debounceRef.current); };
  }, [query, cacheReady]);

  useEffect(function() {
    function onClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setShowDropdown(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return function() { document.removeEventListener('mousedown', onClickOutside); };
  }, []);

  const navigateToProduct = useCallback(function(slug) {
    router.push(createPageUrl('ProductDetail?slug=' + slug));
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    if (onClose) onClose();
  }, [router, onClose]);

  const navigateToAll = useCallback(function() {
    router.push(createPageUrl('Products') + '?search=' + encodeURIComponent(query));
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    if (onClose) onClose();
  }, [router, query, onClose]);

  const handleKeyDown = function(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(function(prev) { return Math.min(prev + 1, results.length - 1); });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(function(prev) { return Math.max(prev - 1, -1); });
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && results[activeIndex]) {
        navigateToProduct(results[activeIndex].slug);
      } else if (query.trim()) {
        navigateToAll();
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setQuery('');
      setActiveIndex(-1);
    }
  };

  useEffect(function() { setActiveIndex(-1); }, [results]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={function(e) { setQuery(e.target.value); }}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="Search products, brands, species\u2026"
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
          autoComplete="off"
          role="combobox"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </span>
      </div>
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-[200] overflow-hidden">
          {hasError && (
            <div className="px-4 py-6 text-center text-sm text-slate-500">
              Search loading — please try again in a moment.
            </div>
          )}
          {!hasError && results.length === 0 && !isLoading && (
            <div className="px-4 py-6 text-center text-sm text-slate-500">
              No products found for &ldquo;<span className="font-medium text-slate-700">{query}</span>&rdquo;
            </div>
          )}
          {!hasError && results.length > 0 && (
            <ul className="divide-y divide-slate-100">
              {results.map(function(product, idx) {
                return (
                  <li key={product.id}>
                    <button
                      className={"w-full flex items-center gap-3 px-4 py-3 transition-colors text-left group " + (idx === activeIndex ? "bg-amber-50" : "hover:bg-amber-50")}
                      onClick={function() { navigateToProduct(product.slug); }}
                      onMouseEnter={function() { setActiveIndex(idx); }}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                        {product.image_url ? (
                          <Image src={product.image_url.split('?')[0]} alt="" className="w-full h-full object-cover" width={48} height={48} quality={60} unoptimized />
                        ) : (
                          <div className="w-full h-full bg-slate-200" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-amber-700">{product.name}</p>
                        {product.brand && <p className="text-xs text-slate-500 mt-0.5">{product.brand}</p>}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span className="text-sm font-bold text-amber-600">{"C$" + ((isVerified ? product.member_price : product.public_price) || 0).toFixed(2)}</span>
                        <span className="block text-xs text-slate-400">/sq.ft</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {query.trim().length >= 2 && (
            <div className="border-t border-slate-100 bg-slate-50">
              <button
                onClick={navigateToAll}
                className="w-full px-4 py-3 text-sm text-amber-600 hover:text-amber-700 font-medium hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-3.5 h-3.5" />
                {" View all results for \u201C" + query + "\u201D"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
