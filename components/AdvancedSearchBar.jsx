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
import { track } from '@/lib/track';
import { getBrandAlias } from '@/lib/brandAliases';

const Product = entities.Product;

let productCache = null;
// Accessories (the `supplies` table, served by /api/supplies/search) are
// indexed alongside flooring (Oct 5 2026). Before this the search bar only
// knew the `products` table, so "underlay" / "vents" / "glue" were dead ends.
let supplyCache = null;
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

// Accessory vocabulary: shoppers say "glue", the catalogue says "adhesive".
// Only applied when scoring supplies so flooring scoring is unchanged.
const ACCESSORY_TERM_RX = {
  'underlay': /underlay|underpad|underlayment|acoustic/i,
  'underlayment': /underlay|underpad|underlayment/i,
  'underpad': /underlay|underpad|underlayment/i,
  'pad': /underlay|underpad|underlayment|pad/i,
  'glue': /glue|adhesive/i,
  'adhesive': /glue|adhesive/i,
  'vent': /vent|register/i,
  'vents': /vent|register/i,
  'register': /vent|register/i,
  'registers': /vent|register/i,
  'trim': /trim|moulding|molding|quarter|shoe/i,
  'molding': /moulding|molding/i,
  'moulding': /moulding|molding/i,
  'quarter': /quarter|shoe/i,
  'baseboard': /baseboard/i,
  'baseboards': /baseboard/i,
  'transition': /transition|t-mould|t-mold|reducer|threshold|stair\s*nos/i,
  'transitions': /transition|t-mould|t-mold|reducer|threshold/i,
  'reducer': /reducer|transition/i,
  'threshold': /threshold|transition/i,
  'nosing': /nosing|stair/i,
  'leveler': /level|self-lev|patch/i,
  'leveller': /level|self-lev|patch/i,
  'levelling': /level|self-lev/i,
  'leveling': /level|self-lev/i,
  'primer': /primer/i,
  'vapor': /vapou?r|moisture|barrier/i,
  'vapour': /vapou?r|moisture|barrier/i,
  'moisture': /moisture|vapou?r|barrier/i,
  'barrier': /barrier|moisture|vapou?r/i,
  'spacer': /spacer/i,
  'spacers': /spacer/i,
  'tool': /tool|tapping|pull\s*bar|trowel|knee|kit/i,
  'tools': /tool|tapping|pull\s*bar|trowel|knee|kit/i,
  'cleaner': /clean/i,
  'cleaning': /clean/i,
  'nail': /nail|cleat|staple|fastener/i,
  'nails': /nail|cleat|staple|fastener/i,
  'cleats': /cleat|nail|fastener/i,
  'staples': /staple|fastener/i,
  'screws': /screw|fastener/i,
  'accessory': /./,
  'accessories': /./,
  'supplies': /./,
};

const SUPPLY_CATEGORY_LABELS = {
  underlay: 'Underlay',
  stair: 'Stair Treads & Posts',
  fasteners: 'Fasteners',
  repair: 'Repair & Touch-Up',
  cleaner: 'Floor Care',
  protection: 'Surface Protection',
  moisture_barrier: 'Moisture Barrier',
  adhesive: 'Adhesive',
  primer: 'Primer',
  subfloor_prep: 'Subfloor Prep',
  trim: 'Shoe Moulding & Quarter Round',
  baseboard: 'Baseboard',
  floor_vent: 'Floor Vent',
  tools: 'Installer Tool',
  transition: 'Transition',
};

const UNIT_LABEL = { gal: 'gal', pail: 'pail', bag: 'bag', roll: 'roll', tube: 'tube', each: 'ea', kit: 'kit', piece: 'pc' };

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

function scoreSupply(supply, terms) {
  let totalScore = 0;
  let termsMatched = 0;
  for (const term of terms) {
    const rx = ACCESSORY_TERM_RX[term] || buildFuzzyRegex(term);
    let s = 0;
    if (rx.test(supply._name)) s += 100;
    if (rx.test(supply._brand)) s += 70;
    if (rx.test(supply._category)) s += 60;
    if (rx.test(supply._members)) s += 45;
    // Blurb / floor-type hits only BOOST a real match — on their own they
    // would drag an underlay into an "oak" search because its copy says oak.
    if (s > 0) {
      if (rx.test(supply._blurb)) s += 20;
      if (rx.test(supply._floorTypes)) s += 10;
      termsMatched++; totalScore += s;
    }
  }
  if (termsMatched === 0) return 0;
  return termsMatched === terms.length ? totalScore * 10 : totalScore * (termsMatched / terms.length);
}

async function fetchSupplyIndex() {
  try {
    const res = await fetch('/api/supplies/search');
    if (!res.ok) return [];
    const rows = await res.json();
    if (!Array.isArray(rows)) return [];
    return rows.filter(function(s) { return s.slug && s.name; }).map(function(s) {
      var catLabel = SUPPLY_CATEGORY_LABELS[s.category] || (s.category || '').replace(/_/g, ' ');
      return {
        id: 'supply:' + s.slug,
        slug: s.slug,
        name: s.name,
        brand: s.brand || '',
        image_url: s.image || null,
        category: s.category || '',
        categoryLabel: catLabel,
        priceLow: s.priceLow,
        priceHigh: s.priceHigh,
        unit: s.unit || '',
        isMulti: !!s.isMulti,
        optionCount: s.optionCount || 1,
        kind: 'supply',
        _name: (s.name || '').toLowerCase(),
        _brand: (s.brand || '').toLowerCase(),
        _category: ((s.category || '') + ' ' + catLabel).toLowerCase(),
        _members: (s.members || '').toLowerCase(),
        _blurb: (s.blurb || '').toLowerCase(),
        _floorTypes: (s.floorTypes || []).join(' ').toLowerCase(),
      };
    });
  } catch (err) {
    console.error('[Search] Supply index failed:', err);
    return [];
  }
}

async function buildClientCache() {
  if (cacheBuilding) return;
  cacheBuilding = true;
  try {
    // Lean grid API — card-level fields only. Supplies index in parallel;
    // a supplies failure never blocks flooring search.
    const [res, supplies] = await Promise.all([fetch('/api/products/grid'), fetchSupplyIndex()]);
    const all = res.ok ? await res.json() : [];
    supplyCache = supplies;

    productCache = all.filter(p => p.name && !p.is_archived_variant && !p.parent_product_id).map(p => {
      return {
        id: p.id,
        slug: p.slug || p.id,
        name: p.name || 'Unnamed Product',
        brand: p.brand || '',
        image_url: p.image_url || p.image || p.thumbnail || null,
        price_per_sqft: (p.sale_price_per_sqft && (!p.price_per_sqft || p.sale_price_per_sqft < p.price_per_sqft))
          ? p.sale_price_per_sqft
          : (p.price_per_sqft ?? 0),
        hide_price: p.hide_price !== false, // default true (hidden) unless explicitly false
        category: p.category || '',
        _name: (p.name || '').toLowerCase(),
        // Brand + consumer alias (e.g. Triforest → Toucan) so "toucan" finds the planks
        _brand: ((p.brand || '') + ' ' + (getBrandAlias(p.brand)?.alias || '')).trim().toLowerCase(),
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
  if (!productCache || productCache.length === 0) return { products: [], supplies: [] };
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
        image_url: p.image_url, price_per_sqft: p.price_per_sqft, hide_price: p.hide_price, category: p.category,
        kind: 'product'
      };
      results.push(clean);
    }
    if (results.length >= limit) break;
  }

  // Accessories score on the RAW query terms (no flooring synonym expansion —
  // "hardwood" → "solid hardwood" would stop "hardwood cleaner" matching).
  var supplies = [];
  if (supplyCache && supplyCache.length > 0) {
    var rawUnique = Array.from(new Set(rawTerms));
    supplies = supplyCache
      .map(function(s) { return Object.assign({}, s, { score: scoreSupply(s, rawUnique) }); })
      .filter(function(s) { return s.score > 0; })
      .sort(function(a, b) { return b.score - a.score; });
  }

  // Mixed dropdown: flooring first, accessories under their own header.
  // No flooring hit → accessories get the whole list ("underlay", "vents").
  var supplyLimit = results.length === 0 ? limit : 3;
  var shownSupplies = Math.min(supplies.length, supplyLimit);
  var productLimit = Math.max(limit - shownSupplies, 3);
  return {
    products: results.slice(0, productLimit),
    supplies: supplies.slice(0, supplyLimit).map(function(s) {
      return {
        id: s.id, slug: s.slug, name: s.name, brand: s.brand, image_url: s.image_url,
        category: s.category, categoryLabel: s.categoryLabel, priceLow: s.priceLow, priceHigh: s.priceHigh,
        unit: s.unit, isMulti: s.isMulti, optionCount: s.optionCount, kind: 'supply'
      };
    })
  };
}

function supplyPriceLabel(s) {
  if (s.priceLow == null) return null;
  var from = s.isMulti && s.priceLow !== s.priceHigh;
  return (from ? 'from ' : '') + 'C$' + Number(s.priceLow).toFixed(2);
}

export default function AdvancedSearchBar({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [supplyResults, setSupplyResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [cacheReady, setCacheReady] = useState(!!productCache);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const router = useRouter();

  // One flat list for keyboard navigation: flooring rows then accessory rows.
  const allRows = results.concat(supplyResults);

  useEffect(function() {
    if (!productCache || (Date.now() - lastCacheTime > CACHE_TTL)) {
      buildClientCache().then(function() { setCacheReady(true); });
    }
  }, []);

  const handleFocus = useCallback(function() {
    if (results.length > 0 || supplyResults.length > 0) setShowDropdown(true);
  }, [results.length, supplyResults.length]);

  useEffect(function() {
    clearTimeout(debounceRef.current);
    var trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSupplyResults([]);
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
          var found = clientSearch(trimmed, 8);
          setResults(found.products);
          setSupplyResults(found.supplies);
        } else {
          setResults([]);
          setSupplyResults([]);
          setHasError(true);
        }
        setShowDropdown(true);
      } catch (err) {
        setResults([]);
        setSupplyResults([]);
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

  const navigateToProduct = useCallback(function(row) {
    var slug = typeof row === 'string' ? row : row.slug;
    var isSupply = !!(row && typeof row === 'object' && row.kind === 'supply');
    if (isSupply) {
      var q = query.trim();
      if (q.length >= 3) track('search', { meta: { query: q, kind: 'accessory', slug: slug } });
      router.push('/flooring-accessories/' + encodeURIComponent(slug));
    } else {
      router.push(createPageUrl('ProductDetail?slug=' + slug));
    }
    setQuery('');
    setResults([]);
    setSupplyResults([]);
    setShowDropdown(false);
    if (onClose) onClose();
  }, [router, onClose, query]);

  const navigateToAll = useCallback(function() {
    const submittedQuery = query.trim();
    if (submittedQuery.length >= 3) {
      track('search', { meta: { query: submittedQuery } });
    }
    router.push(createPageUrl('Products') + '?search=' + encodeURIComponent(query));
    setQuery('');
    setResults([]);
    setSupplyResults([]);
    setShowDropdown(false);
    if (onClose) onClose();
  }, [router, query, onClose]);

  const navigateToAccessories = useCallback(function() {
    const submittedQuery = query.trim();
    if (submittedQuery.length >= 3) {
      track('search', { meta: { query: submittedQuery, kind: 'accessory_hub' } });
    }
    router.push('/flooring-accessories');
    setQuery('');
    setResults([]);
    setSupplyResults([]);
    setShowDropdown(false);
    if (onClose) onClose();
  }, [router, query, onClose]);

  const handleKeyDown = function(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(function(prev) { return Math.min(prev + 1, allRows.length - 1); });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(function(prev) { return Math.max(prev - 1, -1); });
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && allRows[activeIndex]) {
        navigateToProduct(allRows[activeIndex]);
      } else if (results.length === 0 && supplyResults.length > 0 && query.trim()) {
        // Accessory-only query: Enter opens the top accessory, not an empty flooring grid
        navigateToProduct(supplyResults[0]);
      } else if (query.trim()) {
        navigateToAll();
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setQuery('');
      setActiveIndex(-1);
    }
  };

  useEffect(function() { setActiveIndex(-1); }, [results, supplyResults]);

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
          {!hasError && results.length === 0 && supplyResults.length === 0 && !isLoading && (
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
                      onClick={function() { navigateToProduct(product); }}
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
                        {product.hide_price ? (
                          <span className="text-xs font-medium text-amber-600">Call for Pricing</span>
                        ) : (
                          <>
                            <span className="text-sm font-bold text-amber-600">{"C$" + (product.price_per_sqft || 0).toFixed(2)}</span>
                            <span className="block text-xs text-slate-400">/sq.ft</span>
                          </>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {!hasError && supplyResults.length > 0 && (
            <div className={results.length > 0 ? "border-t border-slate-200" : ""}>
              <div className="px-4 pt-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-50/70">
                Accessories &amp; supplies
              </div>
              <ul className="divide-y divide-slate-100" data-search-group="accessories">
                {supplyResults.map(function(s, j) {
                  var idx = results.length + j;
                  var price = supplyPriceLabel(s);
                  return (
                    <li key={s.id}>
                      <button
                        className={"w-full flex items-center gap-3 px-4 py-3 transition-colors text-left group " + (idx === activeIndex ? "bg-amber-50" : "hover:bg-amber-50")}
                        onClick={function() { navigateToProduct(s); }}
                        onMouseEnter={function() { setActiveIndex(idx); }}
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 flex items-center justify-center">
                          {s.image_url ? (
                            <Image src={s.image_url.split('?')[0]} alt="" className="w-full h-full object-contain" width={48} height={48} quality={60} unoptimized />
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-amber-700">{s.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                            {s.categoryLabel}{s.isMulti ? " \u00b7 " + s.optionCount + " options" : ""}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          {price ? (
                            <>
                              <span className="text-sm font-bold text-amber-600">{price}</span>
                              {s.unit && !s.isMulti && <span className="block text-xs text-slate-400">{"/" + (UNIT_LABEL[s.unit] || s.unit)}</span>}
                            </>
                          ) : (
                            <span className="text-xs font-medium text-amber-600">Call for Pricing</span>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {query.trim().length >= 2 && (
            <div className="border-t border-slate-100 bg-slate-50">
              {results.length > 0 && (
                <button
                  onClick={navigateToAll}
                  className="w-full px-4 py-3 text-sm text-amber-600 hover:text-amber-700 font-medium hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-3.5 h-3.5" />
                  {" View all results for \u201C" + query + "\u201D"}
                </button>
              )}
              {supplyResults.length > 0 && (
                <button
                  onClick={navigateToAccessories}
                  className={"w-full px-4 py-2.5 text-xs text-slate-600 hover:text-amber-700 font-medium hover:bg-amber-50 transition-colors flex items-center justify-center gap-2" + (results.length > 0 ? " border-t border-slate-100" : "")}
                >
                  {"Shop all accessories & supplies \u2192"}
                </button>
              )}
              {results.length === 0 && supplyResults.length === 0 && (
                <button
                  onClick={navigateToAll}
                  className="w-full px-4 py-3 text-sm text-amber-600 hover:text-amber-700 font-medium hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-3.5 h-3.5" />
                  {" View all results for \u201C" + query + "\u201D"}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
