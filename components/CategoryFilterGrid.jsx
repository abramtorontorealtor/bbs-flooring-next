'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/lib/base44-compat';
import ProductCard from '@/components/ProductCard';
import ProductToolbar from '@/components/ProductToolbar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { X, ChevronDown, RotateCcw } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Analytics } from '@/components/analytics';

// ── Constants ──
const ITEMS_PER_PAGE = 24;

const HARDWOOD_CATEGORIES = ['solid_hardwood', 'engineered_hardwood'];

const WIDTH_BUCKETS = [
  { value: 'narrow', label: 'Narrow (< 5")', test: (w) => w < 5 },
  { value: 'standard', label: 'Standard (5–7")', test: (w) => w >= 5 && w <= 7 },
  { value: 'wide', label: 'Wide Plank (7"+)', test: (w) => w > 7 },
];

const getProductWidth = (product) => {
  const text = (product.name || '') + ' ' + (product.dimensions || '') + ' ' + (product.product_description || '');
  const match = text.match(/(\d+)\s+(\d+)\/(\d+)\s*["']?|(\d+(?:\.\d+)?)\s*["']?\s*(?:inch|in\b|wide\b)/i);
  let width = null;
  if (match) {
    if (match[1] && match[2] && match[3]) {
      width = parseFloat(match[1]) + parseFloat(match[2]) / parseFloat(match[3]);
    } else if (match[4]) {
      width = parseFloat(match[4]);
    }
  }
  if (width === null) return null;
  if (width < 5) return 'narrow';
  if (width <= 7) return 'standard';
  return 'wide';
};

// ── Collapsible Filter Section ──
function FilterSection({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-3 text-sm font-semibold text-slate-700 hover:text-slate-900"
      >
        {title}
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}

// ── Checkbox filter list with counts ──
function CheckboxFilterList({ options, selected, onChange, maxVisible = 6 }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? options : options.slice(0, maxVisible);
  const hasMore = options.length > maxVisible;

  return (
    <div className="space-y-1.5">
      {visible.map((opt) => (
        <label key={opt.value} className="flex items-center gap-2 cursor-pointer group py-0.5">
          <Checkbox
            checked={selected.includes(opt.value)}
            onCheckedChange={(checked) => {
              if (checked) onChange([...selected, opt.value]);
              else onChange(selected.filter(v => v !== opt.value));
            }}
            className="w-4 h-4"
          />
          <span className="text-sm text-slate-600 group-hover:text-slate-800 flex-1 truncate">{opt.label}</span>
          {opt.count !== undefined && (
            <span className="text-[11px] text-slate-400 tabular-nums">{opt.count}</span>
          )}
        </label>
      ))}
      {hasMore && (
        <button onClick={() => setShowAll(!showAll)} className="text-xs text-amber-600 hover:text-amber-700 font-medium mt-1">
          {showAll ? 'Show less' : `+${options.length - maxVisible} more`}
        </button>
      )}
    </div>
  );
}

/**
 * CategoryFilterGrid — World-class filter + product grid for category & brand pages.
 *
 * Reuses the same filter architecture as ProductsClient but pre-scoped to a
 * single category or brand. The page wrapper provides hero content, FAQs, and
 * SEO blocks around this component.
 *
 * @param {string}   [category]       — Supabase category value (e.g. 'vinyl', 'engineered_hardwood')
 * @param {function} [categoryFilter]  — JS predicate for client-side filtering (brand pages)
 * @param {string}   sessionKey       — sessionStorage prefix for scroll/filter persistence
 * @param {string}   queryKey         — react-query cache key
 * @param {boolean}  [hideBrand]      — Hide the brand filter when pre-scoped to a brand
 */
export default function CategoryFilterGrid({ category, categoryFilter, sessionKey, queryKey, hideBrand = false, initialProducts, serverGrid }) {
  const [clientReady, setClientReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user: currentUser } = useAuth();

  // When using categoryFilter (brand pages), detect categories dynamically
  // Otherwise use the single category prop
  const isHardwood = category ? HARDWOOD_CATEGORIES.includes(category) : false;
  const isVinyl = category === 'vinyl';
  const isLaminate = category === 'laminate';
  // For brand pages (no category), we'll compute these dynamically after loading products
  const isMixedCategory = !category && !!categoryFilter;

  // ── Saved items ──
  const { data: savedItems = [] } = useQuery({
    queryKey: ['saved-items', currentUser?.email],
    queryFn: () => entities.SavedItem.filter({ user_email: currentUser.email }),
    enabled: !!currentUser?.email,
    staleTime: 5 * 60 * 1000,
  });
  const savedProductIds = useMemo(() => new Set(savedItems.map(s => s.product_id)), [savedItems]);

  // ── Initial filters from URL → sessionStorage → defaults ──
  const getInitialFilters = () => {
    const p = (k) => searchParams.get(k) || '';
    const defaults = {
      search: p('search'),
      priceRange: [
        p('priceMin') ? parseFloat(p('priceMin')) : 0,
        p('priceMax') ? parseFloat(p('priceMax')) : 50,
      ],
      isOnSale: searchParams.get('sale') === 'true',
      isWaterproof: searchParams.get('waterproof') === 'true',
      isNewArrival: searchParams.get('new') === 'true',
      isClearance: searchParams.get('clearance') === 'true',
      brands: p('brand') ? p('brand').split(',') : [],
      collections: p('collection') ? p('collection').split(',') : [],
      species: p('species') ? p('species').split(',') : [],
      colours: p('colour') ? p('colour').split(',') : [],
      widths: p('width') ? p('width').split(',') : [],
      thicknesses: p('thickness') ? p('thickness').split(',') : [],
      finishes: p('finish') ? p('finish').split(',') : [],
      grades: p('grade') ? p('grade').split(',') : [],
      wearLayers: p('wearLayer') ? p('wearLayer').split(',') : [],
      acRatings: p('acRating') ? p('acRating').split(',') : [],
      categories: p('cat') ? p('cat').split(',') : [],
      sortBy: p('sort') || 'recommended',
    };

    const hasUrlFilters = defaults.search || defaults.brands.length || defaults.collections.length ||
      defaults.species.length || defaults.colours.length || defaults.widths.length ||
      defaults.thicknesses.length || defaults.finishes.length || defaults.grades.length ||
      defaults.wearLayers.length || defaults.acRatings.length || defaults.categories.length ||
      defaults.isOnSale || defaults.isWaterproof || defaults.isNewArrival || defaults.isClearance ||
      defaults.sortBy !== 'recommended' || defaults.priceRange[0] !== 0 || defaults.priceRange[1] !== 50;

    if (hasUrlFilters) return defaults;

    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(`${sessionKey}_filters_v2`);
      if (saved) { try { return JSON.parse(saved); } catch {} }
    }
    return defaults;
  };

  const [filters, setFilters] = useState(getInitialFilters);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [viewMode, setViewMode] = useState('grid');

  // ── Load products (pre-filtered by category on server, or all for brand pages) ──
  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      // Brand pages: no category param → fetches all products, filtered client-side
      const res = await fetch(`/api/products/grid?${params}`);
      if (!res.ok) throw new Error(`Products grid API ${res.status}`);
      const data = await res.json();
      if (!data || data.length === 0) throw new Error('EMPTY_CATALOG');
      return data;
    },
    // SSR: server passes initialProducts → skip client fetch on first render
    initialData: initialProducts?.length ? initialProducts : undefined,
    staleTime: 5 * 60 * 1000,
    retry: 4,
    retryDelay: (attempt) => Math.min(1000 * Math.pow(2, attempt), 5000),
    refetchOnWindowFocus: false,
  });

  const products = useMemo(() =>
    allProducts.filter(p => {
      if (!p.image_url || p.is_variant) return false;
      if (p.name && (p.name.toLowerCase().includes('installation') || p.name.toLowerCase().includes('removal'))) return false;
      // Apply client-side brand/landing filter if provided
      if (categoryFilter && !categoryFilter(p)) return false;
      return true;
    }), [allProducts, categoryFilter]
  );

  // Detect category composition for mixed-category brand pages
  const hasHardwood = useMemo(() => isMixedCategory && products.some(p => HARDWOOD_CATEGORIES.includes(p.category)), [products, isMixedCategory]);
  const hasVinyl = useMemo(() => isMixedCategory && products.some(p => p.category === 'vinyl'), [products, isMixedCategory]);
  const hasLaminate = useMemo(() => isMixedCategory && products.some(p => p.category === 'laminate'), [products, isMixedCategory]);

  // Unified category awareness — works for both single-category and mixed-brand pages
  const showSpecies = isHardwood || hasHardwood;
  const showGrades = isHardwood || hasHardwood;
  const showWearLayer = isVinyl || hasVinyl;
  const showAcRating = isLaminate || hasLaminate;

  // ── Dynamic filter options with counts ──
  const filterOptions = useMemo(() => {
    const countBy = (arr, field) => {
      const counts = {};
      arr.forEach(p => { const v = p[field]; if (v) counts[v] = (counts[v] || 0) + 1; });
      return Object.entries(counts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([value, count]) => ({ value, label: value, count }));
    };

    // Collections scoped to selected brand(s)
    const brandFiltered = filters.brands.length
      ? products.filter(p => filters.brands.includes(p.brand))
      : products;

    return {
      brands: countBy(products, 'brand'),
      collections: countBy(brandFiltered, 'collection'),
      species: showSpecies ? countBy(products, 'species') : [],
      colours: countBy(products, 'colour'),
      thicknesses: countBy(products, 'thickness'),
      finishes: countBy(products, 'finish'),
      grades: showGrades ? countBy(products, 'grade') : [],
      wearLayers: showWearLayer ? countBy(products, 'wear_layer') : [],
      acRatings: showAcRating ? countBy(products, 'ac_rating') : [],
      categories: isMixedCategory ? countBy(products, 'category') : [],
    };
  }, [products, filters.brands, showSpecies, showGrades, showWearLayer, showAcRating, isMixedCategory]);

  // ── Apply filters ──
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.species?.toLowerCase().includes(q) ||
        p.colour?.toLowerCase().includes(q) ||
        p.finish?.toLowerCase().includes(q) ||
        p.collection?.toLowerCase().includes(q) ||
        p.subcategory?.toLowerCase().includes(q)
      );
    }

    if (filters.isOnSale) result = result.filter(p => p.is_on_sale);
    if (filters.isWaterproof) result = result.filter(p => p.is_waterproof);
    if (filters.isNewArrival) result = result.filter(p => p.is_new_arrival);
    if (filters.isClearance) result = result.filter(p => p.is_clearance);
    if (filters.brands.length) result = result.filter(p => filters.brands.includes(p.brand));
    if (filters.collections.length) result = result.filter(p => filters.collections.includes(p.collection));
    if (filters.species.length) result = result.filter(p => filters.species.includes(p.species));
    if (filters.colours.length) result = result.filter(p => filters.colours.includes(p.colour));
    if (filters.widths.length) result = result.filter(p => filters.widths.includes(getProductWidth(p)));
    if (filters.thicknesses.length) result = result.filter(p => filters.thicknesses.includes(p.thickness));
    if (filters.finishes.length) result = result.filter(p => filters.finishes.includes(p.finish));
    if (filters.grades.length) result = result.filter(p => filters.grades.includes(p.grade));
    if (filters.wearLayers.length) result = result.filter(p => filters.wearLayers.includes(p.wear_layer));
    if (filters.acRatings.length) result = result.filter(p => filters.acRatings.includes(p.ac_rating));
    if (filters.categories.length) result = result.filter(p => filters.categories.includes(p.category));

    result = result.filter(p => {
      const price = p.sale_price_per_sqft || p.price_per_sqft || 0;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Sort
    switch (filters.sortBy) {
      case 'recommended':
        result.sort((a, b) => (b.sort_score || 0) - (a.sort_score || 0));
        break;
      case 'price_low':
        result.sort((a, b) => (a.sale_price_per_sqft || a.price_per_sqft || 0) - (b.sale_price_per_sqft || b.price_per_sqft || 0));
        break;
      case 'price_high':
        result.sort((a, b) => (b.sale_price_per_sqft || b.price_per_sqft || 0) - (a.sale_price_per_sqft || a.price_per_sqft || 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at || b.created_date || 0) - new Date(a.created_at || a.created_date || 0));
        break;
      default:
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return result;
  }, [products, filters]);

  // Visible products (load more pagination)
  const visibleProducts = useMemo(() => filteredProducts.slice(0, visibleCount), [filteredProducts, visibleCount]);
  const hasMore = visibleCount < filteredProducts.length;

  // Reset visible count when filters change
  useEffect(() => { setVisibleCount(ITEMS_PER_PAGE); }, [filters]);

  // ── Active filter tracking ──
  const activeFilters = useMemo(() => {
    const pills = [];
    if (filters.search) pills.push({ key: 'search', label: `"${filters.search}"`, clear: () => setFilters(f => ({ ...f, search: '' })) });
    if (filters.isOnSale) pills.push({ key: 'sale', label: 'On Sale', clear: () => setFilters(f => ({ ...f, isOnSale: false })) });
    if (filters.isWaterproof) pills.push({ key: 'waterproof', label: 'Waterproof', clear: () => setFilters(f => ({ ...f, isWaterproof: false })) });
    if (filters.isNewArrival) pills.push({ key: 'new', label: 'New Arrivals', clear: () => setFilters(f => ({ ...f, isNewArrival: false })) });
    if (filters.isClearance) pills.push({ key: 'clearance', label: 'Clearance', clear: () => setFilters(f => ({ ...f, isClearance: false })) });
    filters.brands.forEach(b => pills.push({ key: `brand-${b}`, label: b, clear: () => setFilters(f => ({ ...f, brands: f.brands.filter(x => x !== b) })) }));
    filters.collections.forEach(c => pills.push({ key: `collection-${c}`, label: c, clear: () => setFilters(f => ({ ...f, collections: f.collections.filter(x => x !== c) })) }));
    filters.species.forEach(s => pills.push({ key: `species-${s}`, label: s, clear: () => setFilters(f => ({ ...f, species: f.species.filter(x => x !== s) })) }));
    filters.colours.forEach(c => pills.push({ key: `colour-${c}`, label: c, clear: () => setFilters(f => ({ ...f, colours: f.colours.filter(x => x !== c) })) }));
    filters.widths.forEach(w => pills.push({ key: `width-${w}`, label: WIDTH_BUCKETS.find(b => b.value === w)?.label || w, clear: () => setFilters(f => ({ ...f, widths: f.widths.filter(x => x !== w) })) }));
    filters.thicknesses.forEach(t => pills.push({ key: `thickness-${t}`, label: t, clear: () => setFilters(f => ({ ...f, thicknesses: f.thicknesses.filter(x => x !== t) })) }));
    filters.finishes.forEach(fi => pills.push({ key: `finish-${fi}`, label: fi, clear: () => setFilters(f => ({ ...f, finishes: f.finishes.filter(x => x !== fi) })) }));
    filters.grades.forEach(g => pills.push({ key: `grade-${g}`, label: g, clear: () => setFilters(f => ({ ...f, grades: f.grades.filter(x => x !== g) })) }));
    filters.wearLayers.forEach(w => pills.push({ key: `wl-${w}`, label: `${w} Wear Layer`, clear: () => setFilters(f => ({ ...f, wearLayers: f.wearLayers.filter(x => x !== w) })) }));
    filters.acRatings.forEach(a => pills.push({ key: `ac-${a}`, label: a, clear: () => setFilters(f => ({ ...f, acRatings: f.acRatings.filter(x => x !== a) })) }));
    const CAT_LABELS = { vinyl: 'Vinyl', engineered_hardwood: 'Engineered Hardwood', solid_hardwood: 'Solid Hardwood', laminate: 'Laminate' };
    filters.categories.forEach(c => pills.push({ key: `cat-${c}`, label: CAT_LABELS[c] || c, clear: () => setFilters(f => ({ ...f, categories: f.categories.filter(x => x !== c) })) }));
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 50) pills.push({ key: 'price', label: `C$${filters.priceRange[0]}–$${filters.priceRange[1]}/sqft`, clear: () => setFilters(f => ({ ...f, priceRange: [0, 50] })) });
    return pills;
  }, [filters]);

  const activeFilterCount = activeFilters.length;

  // ── Clear all filters ──
  const clearAllFilters = useCallback(() => {
    const reset = {
      search: '', priceRange: [0, 50],
      isOnSale: false, isWaterproof: false, isNewArrival: false, isClearance: false,
      brands: [], collections: [], species: [], colours: [], widths: [],
      thicknesses: [], finishes: [], grades: [], wearLayers: [], acRatings: [],
      categories: [],
      sortBy: 'recommended',
    };
    setFilters(reset);
    sessionStorage.removeItem(`${sessionKey}_filters_v2`);
    router.replace(pathname, { scroll: false });
  }, [router, pathname, sessionKey]);

  // ── Persist filters to sessionStorage ──
  useEffect(() => { sessionStorage.setItem(`${sessionKey}_filters_v2`, JSON.stringify(filters)); }, [filters, sessionKey]);

  // ── Sync filters to URL ──
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.brands.length) params.set('brand', filters.brands.join(','));
    if (filters.collections.length) params.set('collection', filters.collections.join(','));
    if (filters.species.length) params.set('species', filters.species.join(','));
    if (filters.colours.length) params.set('colour', filters.colours.join(','));
    if (filters.isOnSale) params.set('sale', 'true');
    if (filters.isWaterproof) params.set('waterproof', 'true');
    if (filters.isNewArrival) params.set('new', 'true');
    if (filters.isClearance) params.set('clearance', 'true');
    if (filters.widths.length) params.set('width', filters.widths.join(','));
    if (filters.thicknesses.length) params.set('thickness', filters.thicknesses.join(','));
    if (filters.finishes.length) params.set('finish', filters.finishes.join(','));
    if (filters.grades.length) params.set('grade', filters.grades.join(','));
    if (filters.wearLayers.length) params.set('wearLayer', filters.wearLayers.join(','));
    if (filters.acRatings.length) params.set('acRating', filters.acRatings.join(','));
    if (filters.categories.length) params.set('cat', filters.categories.join(','));
    if (filters.sortBy !== 'recommended') params.set('sort', filters.sortBy);
    if (filters.priceRange[0] !== 0) params.set('priceMin', String(filters.priceRange[0]));
    if (filters.priceRange[1] !== 50) params.set('priceMax', String(filters.priceRange[1]));

    const newSearch = params.toString();
    const currentSearch = searchParams.toString();
    if (newSearch !== currentSearch) {
      router.replace(newSearch ? `${pathname}?${newSearch}` : pathname, { scroll: false });
    }
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── GA4: view_item_list ──
  useEffect(() => {
    if (!isLoading && filteredProducts.length > 0) {
      const listName = category ? category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Brand Products';
      Analytics.trackViewItemList(filteredProducts, listName);
    }
  }, [filteredProducts, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mark client as ready (hides server-rendered grid) ──
  useEffect(() => { setClientReady(true); }, []);

  // ── Restore scroll position ──
  useEffect(() => {
    const savedScroll = sessionStorage.getItem(`${sessionKey}_scroll`);
    if (savedScroll) {
      setTimeout(() => { window.scrollTo(0, parseInt(savedScroll)); sessionStorage.removeItem(`${sessionKey}_scroll`); }, 100);
    }
  }, [sessionKey]);

  // ── Filter Sidebar ──
  const FilterSidebar = () => (
    <div className="space-y-1">
      {/* Price Range */}
      <FilterSection title="Price (per sq.ft)" defaultOpen={true}>
        <div className="px-1">
          <Slider
            value={filters.priceRange}
            onValueChange={(val) => setFilters(f => ({ ...f, priceRange: val }))}
            min={0}
            max={50}
            step={0.5}
            className="mb-3"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 font-medium tabular-nums">C${filters.priceRange[0].toFixed(2)}</span>
            <span className="text-slate-400">—</span>
            <span className="text-slate-600 font-medium tabular-nums">C${filters.priceRange[1].toFixed(2)}</span>
          </div>
        </div>
      </FilterSection>

      {/* Category — brand pages with mixed categories */}
      {filterOptions.categories.length > 1 && (
        <FilterSection title="Category" defaultOpen={true}>
          <CheckboxFilterList
            options={filterOptions.categories.map(c => ({ ...c, label: ({ vinyl: 'Vinyl', engineered_hardwood: 'Engineered Hardwood', solid_hardwood: 'Solid Hardwood', laminate: 'Laminate' })[c.value] || c.value }))}
            selected={filters.categories}
            onChange={(val) => setFilters(f => ({ ...f, categories: val }))}
          />
        </FilterSection>
      )}

      {/* Quick Filters */}
      <FilterSection title="Quick Filters" defaultOpen={true}>
        <div className="space-y-1.5">
          {[
            { label: 'On Sale', key: 'isOnSale', count: products.filter(p => p.is_on_sale).length },
            ...(isVinyl || isLaminate || hasVinyl || hasLaminate ? [{ label: 'Waterproof', key: 'isWaterproof', count: products.filter(p => p.is_waterproof).length }] : []),
            { label: 'New Arrivals', key: 'isNewArrival', count: products.filter(p => p.is_new_arrival).length },
            { label: 'Clearance', key: 'isClearance', count: products.filter(p => p.is_clearance).length },
          ].filter(({ count }) => count > 0).map(({ label, key, count }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer group py-0.5">
              <Checkbox
                checked={filters[key]}
                onCheckedChange={(checked) => setFilters(f => ({ ...f, [key]: !!checked }))}
                className="w-4 h-4"
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-800 flex-1">{label}</span>
              <span className="text-[11px] text-slate-400 tabular-nums">{count}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Brand — hidden when pre-scoped to a single brand */}
      {!hideBrand && filterOptions.brands.length > 1 && (
        <FilterSection title="Brand" defaultOpen={filters.brands.length > 0}>
          <CheckboxFilterList
            options={filterOptions.brands}
            selected={filters.brands}
            onChange={(val) => setFilters(f => ({ ...f, brands: val, collections: [] }))}
            maxVisible={8}
          />
        </FilterSection>
      )}

      {/* Collection — scoped to selected brand(s) */}
      {filterOptions.collections.length > 1 && (
        <FilterSection title="Collection" defaultOpen={filters.collections.length > 0}>
          <CheckboxFilterList
            options={filterOptions.collections}
            selected={filters.collections}
            onChange={(val) => setFilters(f => ({ ...f, collections: val }))}
            maxVisible={8}
          />
        </FilterSection>
      )}

      {/* Colour */}
      {filterOptions.colours.length > 1 && (
        <FilterSection title="Colour" defaultOpen={filters.colours.length > 0}>
          <CheckboxFilterList
            options={filterOptions.colours}
            selected={filters.colours}
            onChange={(val) => setFilters(f => ({ ...f, colours: val }))}
            maxVisible={8}
          />
        </FilterSection>
      )}

      {/* Species — hardwood only */}
      {filterOptions.species.length > 0 && (
        <FilterSection title="Species" defaultOpen={filters.species.length > 0}>
          <CheckboxFilterList
            options={filterOptions.species}
            selected={filters.species}
            onChange={(val) => setFilters(f => ({ ...f, species: val }))}
          />
        </FilterSection>
      )}

      {/* Width */}
      <FilterSection title="Width" defaultOpen={filters.widths.length > 0}>
        <div className="space-y-1.5">
          {WIDTH_BUCKETS.map((bucket) => (
            <label key={bucket.value} className="flex items-center gap-2 cursor-pointer group py-0.5">
              <Checkbox
                checked={filters.widths.includes(bucket.value)}
                onCheckedChange={(checked) => {
                  setFilters(f => ({
                    ...f,
                    widths: checked ? [...f.widths, bucket.value] : f.widths.filter(w => w !== bucket.value),
                  }));
                }}
                className="w-4 h-4"
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-800 flex-1">{bucket.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Thickness */}
      {filterOptions.thicknesses.length > 0 && (
        <FilterSection title="Thickness" defaultOpen={filters.thicknesses.length > 0}>
          <CheckboxFilterList
            options={filterOptions.thicknesses}
            selected={filters.thicknesses}
            onChange={(val) => setFilters(f => ({ ...f, thicknesses: val }))}
          />
        </FilterSection>
      )}

      {/* Finish */}
      {filterOptions.finishes.length > 0 && (
        <FilterSection title="Finish" defaultOpen={filters.finishes.length > 0}>
          <CheckboxFilterList
            options={filterOptions.finishes}
            selected={filters.finishes}
            onChange={(val) => setFilters(f => ({ ...f, finishes: val }))}
          />
        </FilterSection>
      )}

      {/* Grade — hardwood only */}
      {filterOptions.grades.length > 0 && (
        <FilterSection title="Grade" defaultOpen={filters.grades.length > 0}>
          <CheckboxFilterList
            options={filterOptions.grades}
            selected={filters.grades}
            onChange={(val) => setFilters(f => ({ ...f, grades: val }))}
          />
        </FilterSection>
      )}

      {/* Wear Layer — vinyl only */}
      {filterOptions.wearLayers.length > 0 && (
        <FilterSection title="Wear Layer" defaultOpen={filters.wearLayers.length > 0}>
          <CheckboxFilterList
            options={filterOptions.wearLayers}
            selected={filters.wearLayers}
            onChange={(val) => setFilters(f => ({ ...f, wearLayers: val }))}
          />
        </FilterSection>
      )}

      {/* AC Rating — laminate only */}
      {filterOptions.acRatings.length > 0 && (
        <FilterSection title="AC Rating" defaultOpen={filters.acRatings.length > 0}>
          <CheckboxFilterList
            options={filterOptions.acRatings}
            selected={filters.acRatings}
            onChange={(val) => setFilters(f => ({ ...f, acRatings: val }))}
          />
        </FilterSection>
      )}

      {/* Clear All */}
      {activeFilterCount > 0 && (
        <div className="pt-3">
          <Button variant="outline" size="sm" className="w-full gap-1.5 text-slate-600" onClick={clearAllFilters}>
            <RotateCcw className="w-3.5 h-3.5" />
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex gap-6">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-[152px] max-h-[calc(100vh-10rem)] overflow-y-auto overscroll-contain pr-2 scrollbar-thin">
          <FilterSidebar />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <ProductToolbar
          filters={filters}
          onFilterChange={setFilters}
          onSortChange={(value) => setFilters(f => ({ ...f, sortBy: value }))}
          filterSheetOpen={filterSheetOpen}
          onFilterSheetOpenChange={setFilterSheetOpen}
          FilterSidebar={FilterSidebar}
          activeFilterCount={activeFilterCount}
          resultCount={filteredProducts.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Active filter pills */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {activeFilters.map((pill) => (
              <button
                key={pill.key}
                onClick={pill.clear}
                className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium hover:bg-amber-100 transition-colors group"
              >
                {pill.label}
                <X className="w-3 h-3 text-amber-500 group-hover:text-amber-700" />
              </button>
            ))}
            {activeFilters.length > 1 && (
              <button onClick={clearAllFilters} className="text-xs text-slate-500 hover:text-slate-700 font-medium px-2 py-1">
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Product Grid */}
        {!clientReady && serverGrid ? (
          /* Server-rendered grid visible until client hydrates — zero CLS */
          serverGrid
        ) : isLoading && !serverGrid ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden border border-slate-100 animate-pulse">
                <div className="aspect-[4/3] bg-slate-100" />
                <div className="p-3 space-y-2">
                  <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                  <div className="h-3.5 bg-slate-100 rounded w-3/4" />
                  <div className="h-5 bg-slate-100 rounded w-1/2" />
                  <div className="flex gap-1.5 pt-1">
                    <div className="h-5 bg-slate-100 rounded-full w-14" />
                    <div className="h-5 bg-slate-100 rounded-full w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">No products match your filters</h3>
            <p className="text-sm text-slate-500 mb-4">Try removing some filters or search for something else</p>
            <Button variant="outline" onClick={clearAllFilters} className="gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </Button>
          </div>
        ) : (
          <>
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4'
                : 'grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'
            }>
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} isSaved={savedProductIds.has(product.id)} user={currentUser} />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                  className="px-8 gap-2 text-sm"
                >
                  Load More Products
                  <span className="text-xs text-slate-400">
                    ({visibleCount} of {filteredProducts.length})
                  </span>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
