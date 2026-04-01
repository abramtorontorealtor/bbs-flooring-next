'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/lib/base44-compat';
import ProductCard from './ProductCard';
import { Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductToolbar from './ProductToolbar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const WIDTH_BUCKETS = [
  { value: 'narrow', label: 'Narrow (< 5")' },
  { value: 'standard', label: 'Standard (5" – 7")' },
  { value: 'wide', label: 'Wide Plank (7"+)' },
];

const getProductWidth = (product) => {
  const text = (product.name || '') + ' ' + (product.dimensions || '') + ' ' + (product.product_description || '');
  const match = text.match(/(\d+)\s+(\d+)\/(\d+)\s*["']?|(\d+(?:\.\d+)?)\s*["']?\s*(?:inch|in\b|wide\b)/i);
  let width = null;
  if (match) {
    if (match[1] && match[2] && match[3]) width = parseFloat(match[1]) + parseFloat(match[2]) / parseFloat(match[3]);
    else if (match[4]) width = parseFloat(match[4]);
  }
  if (width === null) return null;
  if (width < 5) return 'narrow';
  if (width <= 7) return 'standard';
  return 'wide';
};

const DEFAULT_FILTERS = {
  search: '',
  priceRange: [0, 50],
  isOnSale: false,
  isWaterproof: false,
  isNewArrival: false,
  isClearance: false,
  brand: 'all',
  colour: 'all',
  species: 'all',
  width: 'all',
  thickness: 'all',
  finish: 'all',
  grade: 'all',
  sortBy: 'recommended',
};

/**
 * CategoryProductGrid
 *
 * @param {string}   sessionKey      — sessionStorage key prefix (e.g. 'vinyl')
 * @param {string}   queryKey        — react-query cache key (e.g. 'products-vinyl')
 * @param {string}   [category]      — exact Supabase category value (e.g. 'vinyl', 'solid_hardwood')
 *                                     When provided, products are filtered SERVER-SIDE (fast).
 * @param {function} [categoryFilter] — JS predicate for client-side filtering (fallback for complex filters).
 *                                     Only used when `category` is NOT provided.
 */
const PRODUCTS_PER_PAGE = 48;

export default function CategoryProductGrid({ sessionKey, queryKey, category, categoryFilter }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse filters from Next.js searchParams hook (replaces window.location.search)
  const getInitialFilters = () => {
    const getParam = (key, type = 'string') => {
      const val = searchParams.get(key);
      if (!val) return undefined;
      if (type === 'boolean') return val === 'true';
      if (type === 'number') return parseFloat(val);
      return val;
    };

    const hasUrlParams = searchParams.toString().length > 0;
    if (hasUrlParams) {
      return {
        search: getParam('search') || '',
        priceRange: [
          getParam('priceMin', 'number') ?? 0,
          getParam('priceMax', 'number') ?? 50,
        ],
        isOnSale: getParam('onSale', 'boolean') || false,
        isWaterproof: getParam('waterproof', 'boolean') || false,
        isNewArrival: getParam('newArrival', 'boolean') || false,
        isClearance: getParam('clearance', 'boolean') || false,
        brand: getParam('brand') || 'all',
        colour: getParam('colour') || 'all',
        species: getParam('species') || 'all',
        width: getParam('width') || 'all',
        thickness: getParam('thickness') || 'all',
        finish: getParam('finish') || 'all',
        grade: getParam('grade') || 'all',
        sortBy: getParam('sort') || 'name',
      };
    }

    return DEFAULT_FILTERS;
  };

  const [filters, setFilters] = useState(getInitialFilters);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // URL-based pagination for SEO crawlability
  const getInitialPage = () => {
    const p = parseInt(searchParams.get('page') || '1', 10);
    return (p && p > 0) ? p : 1;
  };
  const [currentPage, setCurrentPage] = useState(getInitialPage);

  // Sync filters + page to URL params (replaces window.history.replaceState)
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.priceRange[0] !== 0) params.set('priceMin', filters.priceRange[0]);
    if (filters.priceRange[1] !== 50) params.set('priceMax', filters.priceRange[1]);
    if (filters.isOnSale) params.set('onSale', 'true');
    if (filters.isWaterproof) params.set('waterproof', 'true');
    if (filters.isNewArrival) params.set('newArrival', 'true');
    if (filters.isClearance) params.set('clearance', 'true');
    if (filters.brand !== 'all') params.set('brand', filters.brand);
    if (filters.colour !== 'all') params.set('colour', filters.colour);
    if (filters.species !== 'all') params.set('species', filters.species);
    if (filters.width !== 'all') params.set('width', filters.width);
    if (filters.thickness !== 'all') params.set('thickness', filters.thickness);
    if (filters.finish !== 'all') params.set('finish', filters.finish);
    if (filters.grade !== 'all') params.set('grade', filters.grade);
    if (filters.sortBy !== 'name') params.set('sort', filters.sortBy);
    if (currentPage > 1) params.set('page', currentPage);

    const newSearch = params.toString();
    const currentSearch = searchParams.toString();
    if (newSearch !== currentSearch) {
      router.replace(newSearch ? `${pathname}?${newSearch}` : pathname, { scroll: false });
    }
  }, [filters, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const savedScroll = sessionStorage.getItem(`${sessionKey}_scroll`);
    if (savedScroll) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScroll));
        sessionStorage.removeItem(`${sessionKey}_scroll`);
      }, 100);
    }
  }, [sessionKey]);

  const { user: currentUser } = useAuth();

  const { data: savedItems = [] } = useQuery({
    queryKey: ['saved-items', currentUser?.email],
    queryFn: () => entities.SavedItem.filter({ user_email: currentUser.email }),
    enabled: !!currentUser?.email,
    staleTime: 5 * 60 * 1000,
  });
  const savedProductIds = useMemo(() => new Set(savedItems.map(s => s.product_id)), [savedItems]);

  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      // When `category` prop is provided, filter server-side (Supabase) — much faster
      const filters = category ? { category } : {};
      const results = await entities.Product.filter(filters, { limit: 1000, order: '-created_date' });
      if (!results || results.length === 0) throw new Error('EMPTY_CATALOG');
      return results;
    },
    staleTime: 5 * 60 * 1000,
    retry: 4,
    retryDelay: (attempt) => Math.min(1000 * Math.pow(2, attempt), 5000),
    refetchOnWindowFocus: false,
  });

  const baseProducts = useMemo(() =>
    allProducts.filter(p => {
      // Basic quality gate: must have image, not be a variant, not be a service item
      if (!p.image_url || p.is_variant) return false;
      if (p.name && (p.name.toLowerCase().includes('installation') || p.name.toLowerCase().includes('removal'))) return false;
      // If server-side category filter was used, no client filter needed
      if (category) return true;
      // Fallback: client-side filter for complex cases (landing pages)
      return categoryFilter ? categoryFilter(p) : true;
    }), [allProducts, category, categoryFilter]
  );

  // Derived filter options from current category products
  const brands = useMemo(() => {
    const u = [...new Set(baseProducts.map(p => p.brand).filter(Boolean))];
    return [{ value: 'all', label: 'All Brands' }, ...u.map(b => ({ value: b, label: b }))];
  }, [baseProducts]);
  const colours = useMemo(() => {
    const u = [...new Set(baseProducts.map(p => p.colour).filter(Boolean))];
    return [{ value: 'all', label: 'All Colours' }, ...u.map(c => ({ value: c, label: c }))];
  }, [baseProducts]);
  const species = useMemo(() => {
    const u = [...new Set(baseProducts.map(p => p.species).filter(Boolean))];
    return [{ value: 'all', label: 'All Species' }, ...u.map(s => ({ value: s, label: s }))];
  }, [baseProducts]);
  const thicknesses = useMemo(() => {
    const u = [...new Set(baseProducts.map(p => p.thickness).filter(Boolean))];
    return [{ value: 'all', label: 'All Thicknesses' }, ...u.map(t => ({ value: t, label: t }))];
  }, [baseProducts]);
  const finishes = useMemo(() => {
    const u = [...new Set(baseProducts.map(p => p.finish).filter(Boolean))];
    return [{ value: 'all', label: 'All Finishes' }, ...u.map(f => ({ value: f, label: f }))];
  }, [baseProducts]);
  const grades = useMemo(() => {
    const u = [...new Set(baseProducts.map(p => p.grade).filter(Boolean))];
    return [{ value: 'all', label: 'All Grades' }, ...u.map(g => ({ value: g, label: g }))];
  }, [baseProducts]);

  const preFilteredProducts = useMemo(() => {
    let r = [...baseProducts];
    if (filters.search) {
      const s = filters.search.toLowerCase();
      r = r.filter(p =>
        p.name?.toLowerCase().includes(s) ||
        p.sku?.toLowerCase().includes(s) ||
        p.brand?.toLowerCase().includes(s) ||
        p.species?.toLowerCase().includes(s) ||
        p.colour?.toLowerCase().includes(s) ||
        p.product_description?.toLowerCase().includes(s) ||
        p.finish?.toLowerCase().includes(s)
      );
    }
    if (filters.isOnSale) r = r.filter(p => p.is_on_sale);
    if (filters.isWaterproof) r = r.filter(p => p.is_waterproof);
    if (filters.isNewArrival) r = r.filter(p => p.is_new_arrival);
    if (filters.isClearance) r = r.filter(p => p.is_clearance);
    if (filters.brand !== 'all') r = r.filter(p => p.brand === filters.brand);
    if (filters.colour !== 'all') r = r.filter(p => p.colour === filters.colour);
    if (filters.species !== 'all') r = r.filter(p => p.species === filters.species);
    if (filters.width !== 'all') r = r.filter(p => getProductWidth(p) === filters.width);
    if (filters.thickness !== 'all') r = r.filter(p => p.thickness === filters.thickness);
    if (filters.finish !== 'all') r = r.filter(p => p.finish === filters.finish);
    if (filters.grade !== 'all') r = r.filter(p => p.grade === filters.grade);
    r = r.filter(p => {
      const price = p.sale_price_per_sqft || p.price_per_sqft;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });
    return r;
  }, [baseProducts, filters]);

  const filteredProducts = useMemo(() => {
    const r = [...preFilteredProducts];
    switch (filters.sortBy) {
      case 'recommended': r.sort((a, b) => (b.sort_score || 0) - (a.sort_score || 0)); break;
      case 'price_low': r.sort((a, b) => (a.sale_price_per_sqft || a.price_per_sqft) - (b.sale_price_per_sqft || b.price_per_sqft)); break;
      case 'price_high': r.sort((a, b) => (b.sale_price_per_sqft || b.price_per_sqft) - (a.sale_price_per_sqft || a.price_per_sqft)); break;
      case 'newest': r.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)); break;
      case 'name_asc': r.sort((a, b) => a.name?.localeCompare(b.name || '')); break;
      case 'name_desc': r.sort((a, b) => b.name?.localeCompare(a.name || '')); break;
      default: r.sort((a, b) => (b.sort_score || 0) - (a.sort_score || 0));
    }
    return r;
  }, [preFilteredProducts, filters.sortBy]);

  // Inject rel="prev"/"next" link tags in <head> for SEO pagination signals
  // NOTE: Placed AFTER filteredProducts is defined to avoid reference-before-declaration bug
  useEffect(() => {
    const cleanup = [];
    const removeExisting = (rel) => {
      const existing = document.querySelector(`link[rel="${rel}"][data-pagination]`);
      if (existing) existing.remove();
    };
    const addLink = (rel, href) => {
      removeExisting(rel);
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      link.setAttribute('data-pagination', 'true');
      document.head.appendChild(link);
      cleanup.push(() => link.remove());
    };

    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
    const buildFullUrl = (pageNum) => {
      const params = new URLSearchParams(searchParams.toString());
      if (pageNum > 1) params.set('page', pageNum); else params.delete('page');
      const qs = params.toString();
      return `${window.location.origin}${pathname}${qs ? '?' + qs : ''}`;
    };

    if (currentPage > 1) addLink('prev', buildFullUrl(currentPage - 1));
    if (currentPage < totalPages) addLink('next', buildFullUrl(currentPage + 1));

    return () => { cleanup.forEach(fn => fn()); removeExisting('prev'); removeExisting('next'); };
  }, [currentPage, filteredProducts.length, pathname, searchParams]);

  const clearFilters = () => { setFilters(DEFAULT_FILTERS); setCurrentPage(1); };
  const set = (key, val) => { setFilters(f => ({ ...f, [key]: val })); setCurrentPage(1); };

  const hasActiveFilters = filters.search || filters.isOnSale || filters.isWaterproof ||
    filters.isNewArrival || filters.isClearance || filters.brand !== 'all' ||
    filters.colour !== 'all' || filters.species !== 'all' || filters.width !== 'all' ||
    filters.thickness !== 'all' || filters.finish !== 'all' || filters.grade !== 'all';

  const FilterSidebar = () => (
    <div className="space-y-8">
      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-slate-800 mb-3">Price Range (per sq.ft)</h3>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">Min</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">C$</span>
              <input type="number" min={0} max={filters.priceRange[1]} step={0.5} value={filters.priceRange[0]}
                onChange={(e) => set('priceRange', [Math.min(parseFloat(e.target.value) || 0, filters.priceRange[1]), filters.priceRange[1]])}
                className="w-full pl-7 pr-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </div>
          </div>
          <span className="text-slate-400 mt-5">–</span>
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">Max</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">C$</span>
              <input type="number" min={filters.priceRange[0]} max={50} step={0.5} value={filters.priceRange[1]}
                onChange={(e) => set('priceRange', [filters.priceRange[0], Math.max(parseFloat(e.target.value) || 0, filters.priceRange[0])])}
                className="w-full pl-7 pr-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Brand */}
      <div>
        <h3 className="font-semibold text-slate-800 mb-4">Brand</h3>
        <Select value={filters.brand} onValueChange={(v) => set('brand', v)}>
          <SelectTrigger><SelectValue placeholder="All Brands" /></SelectTrigger>
          <SelectContent>{brands.map(b => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {colours.length > 1 && (
        <div>
          <h3 className="font-semibold text-slate-800 mb-4">Colour</h3>
          <Select value={filters.colour} onValueChange={(v) => set('colour', v)}>
            <SelectTrigger><SelectValue placeholder="All Colours" /></SelectTrigger>
            <SelectContent>{colours.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}

      {species.length > 1 && (
        <div>
          <h3 className="font-semibold text-slate-800 mb-4">Species</h3>
          <Select value={filters.species} onValueChange={(v) => set('species', v)}>
            <SelectTrigger><SelectValue placeholder="All Species" /></SelectTrigger>
            <SelectContent>{species.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-slate-800 mb-4">Width</h3>
        <Select value={filters.width} onValueChange={(v) => set('width', v)}>
          <SelectTrigger><SelectValue placeholder="All Widths" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Widths</SelectItem>
            {WIDTH_BUCKETS.map(b => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {thicknesses.length > 1 && (
        <div>
          <h3 className="font-semibold text-slate-800 mb-4">Thickness</h3>
          <Select value={filters.thickness} onValueChange={(v) => set('thickness', v)}>
            <SelectTrigger><SelectValue placeholder="All Thicknesses" /></SelectTrigger>
            <SelectContent>{thicknesses.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}

      {finishes.length > 1 && (
        <div>
          <h3 className="font-semibold text-slate-800 mb-4">Finish</h3>
          <Select value={filters.finish} onValueChange={(v) => set('finish', v)}>
            <SelectTrigger><SelectValue placeholder="All Finishes" /></SelectTrigger>
            <SelectContent>{finishes.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}

      {grades.length > 1 && (
        <div>
          <h3 className="font-semibold text-slate-800 mb-4">Grade</h3>
          <Select value={filters.grade} onValueChange={(v) => set('grade', v)}>
            <SelectTrigger><SelectValue placeholder="All Grades" /></SelectTrigger>
            <SelectContent>{grades.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="font-semibold text-slate-800 mb-4">Features</h3>
        {[
          { key: 'isOnSale', label: 'On Sale' },
          { key: 'isWaterproof', label: 'Waterproof' },
          { key: 'isNewArrival', label: 'New Arrivals' },
          { key: 'isClearance', label: 'Clearance' },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer">
            <Checkbox checked={filters[key]} onCheckedChange={(v) => set(key, v)} />
            <span className="text-slate-600">{label}</span>
          </label>
        ))}
      </div>

      <Button variant="outline" className="w-full" onClick={clearFilters}>Clear All Filters</Button>
    </div>
  );

  return (
    <>
      {isLoading && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-32 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <FilterSidebar />
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {/* Shared Product Toolbar */}
          <ProductToolbar
            filters={filters}
            onFilterChange={setFilters}
            onSortChange={(value) => set('sortBy', value)}
            filterSheetOpen={filterSheetOpen}
            onFilterSheetOpenChange={setFilterSheetOpen}
            FilterSidebar={FilterSidebar}
          />

          {/* Result count */}
          <div className="pt-3">
            <p className="text-sm text-slate-500 mb-4">
              {filteredProducts.length <= PRODUCTS_PER_PAGE ? (
                <>Showing <span className="font-semibold text-slate-700">{filteredProducts.length}</span> products</>
              ) : (
                <>Showing <span className="font-semibold text-slate-700">
                  {Math.min((currentPage - 1) * PRODUCTS_PER_PAGE + 1, filteredProducts.length)}–{Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length)}
                </span> of <span className="font-semibold text-slate-700">{filteredProducts.length}</span> products</>
              )}
            </p>
          </div>

          {/* Active filter pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-5">
              {filters.search && (
                <Pill label={`"${filters.search}"`} onRemove={() => set('search', '')} />
              )}
              {filters.isOnSale && <Pill label="On Sale" onRemove={() => set('isOnSale', false)} />}
              {filters.isWaterproof && <Pill label="Waterproof" onRemove={() => set('isWaterproof', false)} />}
              {filters.isNewArrival && <Pill label="New Arrivals" onRemove={() => set('isNewArrival', false)} />}
              {filters.isClearance && <Pill label="Clearance" onRemove={() => set('isClearance', false)} />}
              {filters.brand !== 'all' && <Pill label={filters.brand} onRemove={() => set('brand', 'all')} />}
              {filters.colour !== 'all' && <Pill label={filters.colour} onRemove={() => set('colour', 'all')} />}
              {filters.species !== 'all' && <Pill label={filters.species} onRemove={() => set('species', 'all')} />}
              {filters.width !== 'all' && <Pill label={WIDTH_BUCKETS.find(b => b.value === filters.width)?.label} onRemove={() => set('width', 'all')} />}
              {filters.thickness !== 'all' && <Pill label={filters.thickness} onRemove={() => set('thickness', 'all')} />}
              {filters.finish !== 'all' && <Pill label={filters.finish} onRemove={() => set('finish', 'all')} />}
              {filters.grade !== 'all' && <Pill label={filters.grade} onRemove={() => set('grade', 'all')} />}
            </div>
          )}

          {/* Products grid */}
          {(() => {
            const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
            const safePage = Math.min(currentPage, totalPages || 1);
            const startIdx = (safePage - 1) * PRODUCTS_PER_PAGE;
            const pageProducts = filteredProducts.slice(startIdx, startIdx + PRODUCTS_PER_PAGE);

            // Build pagination URL preserving current filters
            // Uses searchParams + pathname (replaces window.location references)
            const buildPageUrl = (pageNum) => {
              const params = new URLSearchParams(searchParams.toString());
              if (pageNum > 1) {
                params.set('page', pageNum);
              } else {
                params.delete('page');
              }
              const qs = params.toString();
              return qs ? `${pathname}?${qs}` : pathname;
            };

            return isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-slate-100 rounded-2xl aspect-[4/5] animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">No products found</h3>
                <p className="text-slate-600">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {pageProducts.map((product) => (
                    <ProductCard key={product.id} product={product} isSaved={savedProductIds.has(product.id)} user={currentUser} />
                  ))}
                </div>

                {/* SEO-crawlable pagination */}
                {totalPages > 1 && (
                  <nav aria-label="Product pagination" className="flex items-center justify-center gap-2 mt-10 mb-4 flex-wrap">
                    {/* Prev link */}
                    {safePage > 1 ? (
                      <a
                        href={buildPageUrl(safePage - 1)}
                        onClick={(e) => { e.preventDefault(); setCurrentPage(safePage - 1); window.scrollTo(0, 0); }}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-amber-50 hover:border-amber-300 transition-colors"
                        rel="prev"
                      >
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-100 text-sm font-medium text-slate-300 cursor-not-allowed">
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </span>
                    )}

                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      const showPage = pageNum === 1 || pageNum === totalPages ||
                        Math.abs(pageNum - safePage) <= 1;
                      const showEllipsis = !showPage && (
                        (pageNum === 2 && safePage > 3) ||
                        (pageNum === totalPages - 1 && safePage < totalPages - 2)
                      );

                      if (showEllipsis) {
                        return <span key={pageNum} className="px-2 py-2 text-slate-400 text-sm">…</span>;
                      }
                      if (!showPage) return null;

                      return pageNum === safePage ? (
                        <span key={pageNum} className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-amber-600 text-white text-sm font-bold">
                          {pageNum}
                        </span>
                      ) : (
                        <a
                          key={pageNum}
                          href={buildPageUrl(pageNum)}
                          onClick={(e) => { e.preventDefault(); setCurrentPage(pageNum); window.scrollTo(0, 0); }}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-amber-50 hover:border-amber-300 transition-colors"
                        >
                          {pageNum}
                        </a>
                      );
                    })}

                    {/* Next link */}
                    {safePage < totalPages ? (
                      <a
                        href={buildPageUrl(safePage + 1)}
                        onClick={(e) => { e.preventDefault(); setCurrentPage(safePage + 1); window.scrollTo(0, 0); }}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-amber-50 hover:border-amber-300 transition-colors"
                        rel="next"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-100 text-sm font-medium text-slate-300 cursor-not-allowed">
                        Next <ChevronRight className="w-4 h-4" />
                      </span>
                    )}

                    {/* Page count summary */}
                    <p className="w-full text-center text-xs text-slate-400 mt-2">
                      Page {safePage} of {totalPages} · {filteredProducts.length} products
                    </p>
                  </nav>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </>
  );
}

function Pill({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
      {label}
      <button onClick={onRemove}><X className="w-3 h-3" /></button>
    </span>
  );
}
