'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/lib/base44-compat';
import { createPageUrl } from '@/lib/routes';
import { generateCollectionMetaTags } from '@/lib/seo';
import ProductCard from '@/components/ProductCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import { CATEGORY_PAGES } from '@/lib/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';
import ProductToolbar from '@/components/ProductToolbar';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Analytics } from '@/components/analytics';


export default function ProductsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Auth from context — no extra API call
  const { user: currentUser } = useAuth();

  const { data: savedItems = [] } = useQuery({
    queryKey: ['saved-items', currentUser?.email],
    queryFn: () => entities.SavedItem.filter({ user_email: currentUser.email }),
    enabled: !!currentUser?.email,
    staleTime: 5 * 60 * 1000,
  });
  const savedProductIds = useMemo(() => new Set(savedItems.map(s => s.product_id)), [savedItems]);

  // Derive search mode from reactive searchParams
  const urlSearchParam = searchParams.get('search') || '';
  const isSearchMode = urlSearchParam.trim().length >= 2;

  // Restore filters from URL params (shareable) → sessionStorage fallback → defaults
  const getInitialFilters = () => {
    const urlCategory = searchParams.get('category') || '';
    const urlSearch = searchParams.get('search') || '';
    const urlShowSale = searchParams.get('sale') === 'true';
    const urlSpecies = searchParams.get('species') || '';
    const urlBrand = searchParams.get('brand') || '';
    const urlWidth = searchParams.get('width') || '';
    const urlThickness = searchParams.get('thickness') || '';
    const urlFinish = searchParams.get('finish') || '';
    const urlGrade = searchParams.get('grade') || '';
    const urlWearLayer = searchParams.get('wearLayer') || '';
    const urlAcRating = searchParams.get('acRating') || '';
    const urlSort = searchParams.get('sort') || '';
    const urlPriceMin = searchParams.get('priceMin');
    const urlPriceMax = searchParams.get('priceMax');
    const urlWaterproof = searchParams.get('waterproof') === 'true';
    const urlNewArrival = searchParams.get('new') === 'true';
    const urlClearance = searchParams.get('clearance') === 'true';
    const urlPriceRange = (urlPriceMin != null || urlPriceMax != null)
      ? [urlPriceMin != null ? parseFloat(urlPriceMin) : 0, urlPriceMax != null ? parseFloat(urlPriceMax) : 15]
      : null;

    const defaults = {
      category: urlCategory || 'all',
      search: urlSearch,
      priceRange: urlPriceRange || [0, 50],
      isOnSale: urlShowSale,
      isWaterproof: urlWaterproof,
      isNewArrival: urlNewArrival,
      isClearance: urlClearance,
      brand: urlBrand || 'all',
      species: urlSpecies || 'all',
      width: urlWidth || 'all',
      thickness: urlThickness || 'all',
      finish: urlFinish || 'all',
      grade: urlGrade || 'all',
      wearLayer: urlWearLayer || 'all',
      acRating: urlAcRating || 'all',
      sortBy: urlSort || 'recommended',
    };

    const hasUrlFilters = urlCategory || urlSearch || urlSpecies || urlBrand ||
      urlWidth || urlThickness || urlFinish || urlGrade || urlWearLayer || urlAcRating || urlSort ||
      urlShowSale || urlWaterproof || urlNewArrival || urlClearance ||
      urlPriceMin != null || urlPriceMax != null;

    if (hasUrlFilters) {
      if (urlSearch) defaults.category = 'all';
      return defaults;
    }

    // No URL params — restore from sessionStorage if available
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('products_filters');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Fall through to defaults
        }
      }
    }
    return defaults;
  };

  const [filters, setFilters] = useState(getInitialFilters);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // ── Helper to exit search mode by clearing URL param ──
  const clearSearchMode = useCallback(() => {
    setFilters(prev => ({ ...prev, search: '' }));
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('search');
    const remaining = newParams.toString();
    sessionStorage.removeItem('products_filters');
    router.replace(
      remaining ? `${pathname}?${remaining}` : createPageUrl('Products'),
      { scroll: false }
    );
  }, [router, pathname, searchParams]);

  // Sync filters.search with URL searchParams (reactive — fires on back/forward nav)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch && urlSearch !== filters.search) {
      setFilters(prev => ({ ...prev, search: urlSearch }));
    } else if (!urlSearch && filters.search) {
      setFilters(prev => ({ ...prev, search: '' }));
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clean stale search from sessionStorage when leaving search mode
  useEffect(() => {
    if (!isSearchMode) {
      const saved = sessionStorage.getItem('products_filters');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.search) {
            parsed.search = '';
            sessionStorage.setItem('products_filters', JSON.stringify(parsed));
          }
        } catch {}
      }
    }
  }, [isSearchMode]);

  // Always load full catalog via lean grid API (card-level fields only — ~890KB vs 1.8MB)
  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ['products-grid'],
    queryFn: async () => {
      const res = await fetch('/api/products/grid');
      if (!res.ok) throw new Error(`Products grid API ${res.status}`);
      const data = await res.json();
      if (!data || data.length === 0) throw new Error('EMPTY_CATALOG');
      return data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 4,
    retryDelay: (attempt) => Math.min(1000 * Math.pow(2, attempt), 5000),
    refetchOnWindowFocus: false,
  });

  // Filter to valid products (image present, not archived)
  const products = useMemo(() => {
    return allProducts.filter(p => p.image_url && !p.is_archived_variant);
  }, [allProducts]);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'vinyl', label: 'Vinyl' },
    { value: 'laminate', label: 'Laminate' },
    { value: 'engineered_hardwood', label: 'Engineered Hardwood' },
    { value: 'solid_hardwood', label: 'Solid Hardwood' },
  ];

  const brands = useMemo(() => {
    const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];
    return [{ value: 'all', label: 'All Brands' }, ...uniqueBrands.map(b => ({ value: b, label: b }))];
  }, [products]);

  const HARDWOOD_CATEGORIES = ['solid_hardwood', 'engineered_hardwood'];

  const species = useMemo(() => {
    const found = new Set();
    products
      .filter(p => HARDWOOD_CATEGORIES.includes(p.category))
      .forEach(p => { if (p.species) found.add(p.species); });
    return [{ value: 'all', label: 'All Species' }, ...[...found].sort().map(s => ({ value: s, label: s }))];
  }, [products]);

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

  const thicknesses = useMemo(() => {
    const uniqueThicknesses = [...new Set(products.map(p => p.thickness).filter(Boolean))];
    return [{ value: 'all', label: 'All Thicknesses' }, ...uniqueThicknesses.map(t => ({ value: t, label: t }))];
  }, [products]);

  const finishes = useMemo(() => {
    const uniqueFinishes = [...new Set(products.map(p => p.finish).filter(Boolean))];
    return [{ value: 'all', label: 'All Finishes' }, ...uniqueFinishes.map(f => ({ value: f, label: f }))];
  }, [products]);

  const grades = useMemo(() => {
    const uniqueGrades = [...new Set(products.filter(p => HARDWOOD_CATEGORIES.includes(p.category)).map(p => p.grade).filter(Boolean))];
    return [{ value: 'all', label: 'All Grades' }, ...uniqueGrades.sort().map(g => ({ value: g, label: g }))];
  }, [products]);

  const wearLayers = useMemo(() => {
    const unique = [...new Set(products.filter(p => p.category === 'vinyl').map(p => p.wear_layer).filter(Boolean))];
    return [{ value: 'all', label: 'All Wear Layers' }, ...unique.sort().map(w => ({ value: w, label: w }))];
  }, [products]);

  const acRatings = useMemo(() => {
    const unique = [...new Set(products.filter(p => p.category === 'laminate').map(p => p.ac_rating).filter(Boolean))];
    return [{ value: 'all', label: 'All AC Ratings' }, ...unique.sort().map(a => ({ value: a, label: a }))];
  }, [products]);

  // Apply all filters
  const preFilteredProducts = useMemo(() => {
    let result = [...products];

    if (filters.category && filters.category !== 'all') {
      result = result.filter(p => {
        const productCategory = (p.category || '').toLowerCase().trim().replace(/\s+/g, '_');
        const filterCategory = filters.category.toLowerCase().trim();
        return productCategory === filterCategory;
      });
    }

    // Always apply local text search (no backend search API)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(searchLower) ||
        p.sku?.toLowerCase().includes(searchLower) ||
        p.brand?.toLowerCase().includes(searchLower) ||
        p.species?.toLowerCase().includes(searchLower) ||
        p.colour?.toLowerCase().includes(searchLower) ||
        p.finish?.toLowerCase().includes(searchLower) ||
        p.subcategory?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.isOnSale) {
      result = result.filter(p => p.is_on_sale);
    }

    if (filters.isWaterproof) {
      result = result.filter(p => p.is_waterproof);
    }

    if (filters.isNewArrival) {
      result = result.filter(p => p.is_new_arrival);
    }

    if (filters.isClearance) {
      result = result.filter(p => p.is_clearance);
    }

    if (filters.brand && filters.brand !== 'all') {
      result = result.filter(p => p.brand === filters.brand);
    }

    if (filters.species && filters.species !== 'all') {
      result = result.filter(p => p.species === filters.species);
    }

    if (filters.width && filters.width !== 'all') {
      result = result.filter(p => getProductWidth(p) === filters.width);
    }

    if (filters.thickness && filters.thickness !== 'all') {
      result = result.filter(p => p.thickness === filters.thickness);
    }

    if (filters.finish && filters.finish !== 'all') {
      result = result.filter(p => p.finish === filters.finish);
    }

    if (filters.grade && filters.grade !== 'all') {
      result = result.filter(p => p.grade === filters.grade);
    }

    if (filters.wearLayer && filters.wearLayer !== 'all') {
      result = result.filter(p => p.wear_layer === filters.wearLayer);
    }

    if (filters.acRating && filters.acRating !== 'all') {
      result = result.filter(p => p.ac_rating === filters.acRating);
    }

    result = result.filter(p => {
      const price = p.price_per_sqft || p.sale_price_per_sqft || 0;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    return result;
  }, [products, filters.category, filters.search, filters.isOnSale, filters.isWaterproof, filters.isNewArrival, filters.isClearance, filters.brand, filters.species, filters.width, filters.thickness, filters.finish, filters.grade, filters.wearLayer, filters.acRating, filters.priceRange]);

  // Final sorted products
  const filteredProducts = useMemo(() => {
    let result = [...preFilteredProducts];

    // In search mode with default sort, keep relevance order (order from text match)
    if (isSearchMode && filters.sortBy === 'recommended') return result;

    switch (filters.sortBy) {
      case 'recommended':
        result.sort((a, b) => (b.sort_score_all || 0) - (a.sort_score_all || 0));
        break;
      case 'price_low':
        result.sort((a, b) => (a.price_per_sqft || a.sale_price_per_sqft || 0) - (b.price_per_sqft || b.sale_price_per_sqft || 0));
        break;
      case 'price_high':
        result.sort((a, b) => (b.price_per_sqft || b.sale_price_per_sqft || 0) - (a.price_per_sqft || a.sale_price_per_sqft || 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        break;
      default:
        result.sort((a, b) => a.name?.localeCompare(b.name || ''));
    }

    return result;
  }, [preFilteredProducts, filters.sortBy, isSearchMode]);

  const getCategoryTitle = () => {
    if (isSearchMode) return `Search results for "${urlSearchParam}"`;
    const cat = categories.find(c => c.value === filters.category);
    return cat?.value && cat.value !== 'all' ? cat.label : 'All Products';
  };

  // Save filters to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('products_filters', JSON.stringify(filters));
  }, [filters]);

  // GA4 view_item_list — fire when filtered product list changes (for remarketing audiences)
  useEffect(() => {
    if (!isLoading && filteredProducts.length > 0) {
      const listName = isSearchMode
        ? `Search: ${urlSearchParam}`
        : getCategoryTitle();
      Analytics.trackViewItemList(filteredProducts, listName);
    }
  }, [filteredProducts, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync filters → URL params (makes filter URLs shareable / copy-pasteable)
  // Uses router.replace instead of react-router's setSearchParams
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'all') params.set('category', filters.category);
    if (filters.search) params.set('search', filters.search);
    if (filters.brand && filters.brand !== 'all') params.set('brand', filters.brand);
    if (filters.species && filters.species !== 'all') params.set('species', filters.species);
    if (filters.isOnSale) params.set('sale', 'true');
    if (filters.isWaterproof) params.set('waterproof', 'true');
    if (filters.isNewArrival) params.set('new', 'true');
    if (filters.isClearance) params.set('clearance', 'true');
    if (filters.width && filters.width !== 'all') params.set('width', filters.width);
    if (filters.thickness && filters.thickness !== 'all') params.set('thickness', filters.thickness);
    if (filters.finish && filters.finish !== 'all') params.set('finish', filters.finish);
    if (filters.grade && filters.grade !== 'all') params.set('grade', filters.grade);
    if (filters.wearLayer && filters.wearLayer !== 'all') params.set('wearLayer', filters.wearLayer);
    if (filters.acRating && filters.acRating !== 'all') params.set('acRating', filters.acRating);
    if (filters.sortBy && filters.sortBy !== 'recommended') params.set('sort', filters.sortBy);
    if (filters.priceRange[0] !== 0) params.set('priceMin', String(filters.priceRange[0]));
    if (filters.priceRange[1] !== 50) params.set('priceMax', String(filters.priceRange[1]));

    // Only update URL if params actually changed (prevents render loops)
    const newSearch = params.toString();
    const currentSearch = searchParams.toString();
    if (newSearch !== currentSearch) {
      const newUrl = newSearch ? `${pathname}?${newSearch}` : pathname;
      router.replace(newUrl, { scroll: false });
    }
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeFilterCount = useMemo(() => [
    filters.category !== 'all',
    filters.brand !== 'all',
    filters.species !== 'all',
    filters.width !== 'all',
    filters.thickness !== 'all',
    filters.finish !== 'all',
    filters.grade !== 'all',
    filters.wearLayer !== 'all',
    filters.acRating !== 'all',
    filters.isOnSale,
    filters.isWaterproof,
    filters.isNewArrival,
    filters.isClearance,
    filters.priceRange[0] !== 0 || filters.priceRange[1] !== 50,
  ].filter(Boolean).length, [filters]);

  // Restore scroll position when returning from product detail
  useEffect(() => {
    const savedScroll = sessionStorage.getItem('products_scroll');
    if (savedScroll) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScroll));
        sessionStorage.removeItem('products_scroll');
      }, 100);
    }
  }, []);

  const FilterSidebar = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold text-slate-800 mb-4">Category</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilters({ ...filters, category: cat.value })}
              className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                filters.category === cat.value
                  ? 'bg-amber-100 text-amber-800 font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-slate-800 mb-3">Price Range (per sq.ft)</h3>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">Min</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">C$</span>
              <input
                type="number"
                min={0}
                max={filters.priceRange[1]}
                step={0.5}
                value={filters.priceRange[0]}
                onChange={(e) => setFilters({ ...filters, priceRange: [Math.min(parseFloat(e.target.value) || 0, filters.priceRange[1]), filters.priceRange[1]] })}
                className="w-full pl-7 pr-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
          </div>
          <span className="text-slate-400 mt-5">–</span>
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">Max</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">C$</span>
              <input
                type="number"
                min={filters.priceRange[0]}
                max={50}
                step={0.5}
                value={filters.priceRange[1]}
                onChange={(e) => setFilters({ ...filters, priceRange: [filters.priceRange[0], Math.max(parseFloat(e.target.value) || 0, filters.priceRange[0])] })}
                className="w-full pl-7 pr-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-slate-800 mb-4">Brand</h3>
        <Select
          value={filters.brand}
          onValueChange={(value) => setFilters({ ...filters, brand: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent>
            {brands.map((brand) => (
              <SelectItem key={brand.value} value={brand.value}>
                {brand.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {species.length > 1 && (!filters.category || filters.category === 'all' || HARDWOOD_CATEGORIES.includes(filters.category)) && (
        <div>
          <h3 className="font-semibold text-slate-800 mb-4">Species</h3>
          <Select
            value={filters.species}
            onValueChange={(value) => setFilters({ ...filters, species: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Species" />
            </SelectTrigger>
            <SelectContent>
              {species.map((spec) => (
                <SelectItem key={spec.value} value={spec.value}>
                  {spec.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-slate-800 mb-4">Width</h3>
        <Select
          value={filters.width}
          onValueChange={(value) => setFilters({ ...filters, width: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Widths" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Widths</SelectItem>
            {WIDTH_BUCKETS.map((b) => (
              <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {thicknesses.length > 1 && (
        <div>
          <h3 className="font-semibold text-slate-800 mb-4">Thickness</h3>
          <Select
            value={filters.thickness}
            onValueChange={(value) => setFilters({ ...filters, thickness: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Thicknesses" />
            </SelectTrigger>
            <SelectContent>
              {thicknesses.map((thickness) => (
                <SelectItem key={thickness.value} value={thickness.value}>
                  {thickness.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {finishes.length > 1 && (
        <div>
          <h3 className="font-semibold text-slate-800 mb-4">Finish</h3>
          <Select
            value={filters.finish}
            onValueChange={(value) => setFilters({ ...filters, finish: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Finishes" />
            </SelectTrigger>
            <SelectContent>
              {finishes.map((finish) => (
                <SelectItem key={finish.value} value={finish.value}>
                  {finish.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {grades.length > 1 && (!filters.category || filters.category === 'all' || HARDWOOD_CATEGORIES.includes(filters.category)) && (
        <div>
          <h3 className="font-semibold text-slate-800 mb-4">Grade</h3>
          <Select
            value={filters.grade}
            onValueChange={(value) => setFilters({ ...filters, grade: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Grades" />
            </SelectTrigger>
            <SelectContent>
              {grades.map((grade) => (
                <SelectItem key={grade.value} value={grade.value}>
                  {grade.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {wearLayers.length > 1 && (!filters.category || filters.category === 'all' || filters.category === 'vinyl') && (
        <div>
          <h3 className="font-semibold text-slate-800 mb-4">Wear Layer</h3>
          <Select
            value={filters.wearLayer}
            onValueChange={(value) => setFilters({ ...filters, wearLayer: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Wear Layers" />
            </SelectTrigger>
            <SelectContent>
              {wearLayers.map((wl) => (
                <SelectItem key={wl.value} value={wl.value}>
                  {wl.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {acRatings.length > 1 && (!filters.category || filters.category === 'all' || filters.category === 'laminate') && (
        <div>
          <h3 className="font-semibold text-slate-800 mb-4">AC Rating</h3>
          <Select
            value={filters.acRating}
            onValueChange={(value) => setFilters({ ...filters, acRating: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All AC Ratings" />
            </SelectTrigger>
            <SelectContent>
              {acRatings.map((ac) => (
                <SelectItem key={ac.value} value={ac.value}>
                  {ac.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="font-semibold text-slate-800 mb-4">Features</h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox
            checked={filters.isOnSale}
            onCheckedChange={(checked) => setFilters({ ...filters, isOnSale: checked })}
          />
          <span className="text-slate-600">On Sale</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox
            checked={filters.isWaterproof}
            onCheckedChange={(checked) => setFilters({ ...filters, isWaterproof: checked })}
          />
          <span className="text-slate-600">Waterproof</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox
            checked={filters.isNewArrival}
            onCheckedChange={(checked) => setFilters({ ...filters, isNewArrival: checked })}
          />
          <span className="text-slate-600">New Arrivals</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox
            checked={filters.isClearance}
            onCheckedChange={(checked) => setFilters({ ...filters, isClearance: checked })}
          />
          <span className="text-slate-600">Clearance</span>
        </label>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          const resetFilters = {
            category: 'all',
            search: '',
            priceRange: [0, 50],
            isOnSale: false,
            isWaterproof: false,
            isNewArrival: false,
            isClearance: false,
            brand: 'all',
            species: 'all',
            width: 'all',
            thickness: 'all',
            finish: 'all',
            grade: 'all',
            wearLayer: 'all',
            acRating: 'all',
            sortBy: 'recommended',
          };
          setFilters(resetFilters);
          sessionStorage.removeItem('products_filters');
          router.replace(createPageUrl('Products'), { scroll: false });
        }}
      >
        Clear All Filters
      </Button>
    </div>
  );

    // Hierarchy-based breadcrumbs: Home > Category (if filtered) or Home > All Products
  const breadcrumbItems = useMemo(() => {
    const items = [{ label: 'Home', url: '/' }];
    if (filters.category && filters.category !== 'all') {
      const cat = CATEGORY_PAGES[filters.category];
      items.push({ label: cat ? cat.label : filters.category });
    } else {
      items.push({ label: 'All Products' });
    }
    return items;
  }, [filters.category]);

  return (
    <div className="max-w-7xl mx-auto px-4 pb-8 pt-14">
      <Breadcrumbs items={breadcrumbItems} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">{getCategoryTitle()}</h1>
        <p className="text-slate-600">{filteredProducts.length} products available</p>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-32 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <FilterSidebar />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Shared Product Toolbar */}
          <ProductToolbar
            filters={filters}
            onFilterChange={setFilters}
            onSortChange={(value) => setFilters({ ...filters, sortBy: value })}
            filterSheetOpen={filterSheetOpen}
            onFilterSheetOpenChange={setFilterSheetOpen}
            FilterSidebar={FilterSidebar}
          />

          {/* Active Filters */}
          {(filters.category !== 'all' || filters.search || isSearchMode || filters.isOnSale || filters.isWaterproof || filters.isNewArrival || filters.isClearance || filters.brand !== 'all' || filters.species !== 'all' || filters.width !== 'all' || filters.thickness !== 'all' || filters.finish !== 'all' || filters.grade !== 'all' || filters.wearLayer !== 'all' || filters.acRating !== 'all') && (
            <div className="flex flex-wrap gap-2 mb-6">
              {filters.category !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                  {categories.find(c => c.value === filters.category)?.label}
                  <button onClick={() => setFilters({ ...filters, category: 'all' })}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {(filters.search || isSearchMode) && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                  &ldquo;{filters.search || urlSearchParam}&rdquo;
                  <button onClick={clearSearchMode}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.isOnSale && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                  On Sale
                  <button onClick={() => setFilters({ ...filters, isOnSale: false })}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.isWaterproof && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                  Waterproof
                  <button onClick={() => setFilters({ ...filters, isWaterproof: false })}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.isNewArrival && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                  New Arrivals
                  <button onClick={() => setFilters({ ...filters, isNewArrival: false })}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.isClearance && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                  Clearance
                  <button onClick={() => setFilters({ ...filters, isClearance: false })}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.brand !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                  {filters.brand}
                  <button onClick={() => setFilters({ ...filters, brand: 'all' })}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.species !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                  {filters.species}
                  <button onClick={() => setFilters({ ...filters, species: 'all' })}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.width !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                  {WIDTH_BUCKETS.find(b => b.value === filters.width)?.label}
                  <button onClick={() => setFilters({ ...filters, width: 'all' })}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.thickness !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                  {filters.thickness}
                  <button onClick={() => setFilters({ ...filters, thickness: 'all' })}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.finish !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                  {filters.finish}
                  <button onClick={() => setFilters({ ...filters, finish: 'all' })}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.grade !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                  {filters.grade}
                  <button onClick={() => setFilters({ ...filters, grade: 'all' })}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.wearLayer !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                  {filters.wearLayer} Wear Layer
                  <button onClick={() => setFilters({ ...filters, wearLayer: 'all' })}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.acRating !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                  {filters.acRating}
                  <button onClick={() => setFilters({ ...filters, acRating: 'all' })}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Products Grid */}
          {isLoading ? (
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} isSaved={savedProductIds.has(product.id)} user={currentUser} />
              ))}
            </div>
          )}

          {/* Brand Authority SEO Section */}
          {filters.brand !== 'all' && (
            <div className="mt-16 bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              {filters.brand === 'Vidar' ? (
                <>
                  <h2 className="text-2xl font-bold text-slate-800 mb-4">Why Markham Homeowners Choose Vidar Wide Plank</h2>
                  <p className="text-slate-600 leading-relaxed">Vidar&apos;s UV-cured oil finish and 3mm dry-sawn wear layer offer superior stability for Southern Ontario&apos;s humid summers and dry winters.</p>
                </>
              ) : filters.brand === 'Twelve Oaks' ? (
                <>
                  <h2 className="text-2xl font-bold text-slate-800 mb-4">The Twelve Oaks Durability Standard</h2>
                  <p className="text-slate-600 leading-relaxed">With FloorScore certification and commercial-grade wear layers, Twelve Oaks is the preferred choice for high-traffic GTA homes.</p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-slate-800 mb-4">Premium Flooring in Markham</h2>
                  <p className="text-slate-600 leading-relaxed">Discover our curated selection of {filters.brand} flooring, handpicked for quality and performance in the Greater Toronto Area.</p>
                </>
              )}
            </div>
          )}

          {/* General SEO Content Block (no brand filter) */}
          {filters.brand === 'all' && filters.category === 'all' && (
            <div className="mt-16 bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Premium Flooring in Markham &amp; the GTA</h2>
              <div className="space-y-3 text-slate-600 leading-relaxed">
                <p>
                  BBS Flooring stocks over 794 products across <a href="/solid-hardwood" className="text-amber-600 hover:underline">solid hardwood</a>, <a href="/engineered-hardwood" className="text-amber-600 hover:underline">engineered hardwood</a>, <a href="/vinyl" className="text-amber-600 hover:underline">luxury vinyl plank</a>, <a href="/laminate" className="text-amber-600 hover:underline">laminate</a>, and <a href="/waterproof-flooring" className="text-amber-600 hover:underline">waterproof flooring</a> — all available from our showroom at 6061 Highway 7, Unit B, Markham.
                </p>
                <p>
                  Every product includes transparent per-sqft pricing and a built-in cost calculator so you know your total before you commit. Need help choosing? <a href="/free-measurement" className="text-amber-600 hover:underline">Book a free in-home measurement</a> and our team will recommend the best option for your space, budget, and lifestyle.
                </p>
                <p>
                  We also offer full-service <a href="/installation" className="text-amber-600 hover:underline">professional installation</a>, <a href="/stairs" className="text-amber-600 hover:underline">stair renovation</a>, <a href="/hardwood-refinishing" className="text-amber-600 hover:underline">hardwood refinishing</a>, and <a href="/carpet-removal" className="text-amber-600 hover:underline">carpet removal</a> — one team from selection to completion.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
