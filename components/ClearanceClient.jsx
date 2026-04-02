'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/lib/routes';
import { entities } from '@/lib/base44-compat';
import ProductCard from '@/components/ProductCard';
import ProductToolbar from '@/components/ProductToolbar';
import StaticFAQ from '@/components/StaticFAQ';
import SpokeLinks from '@/components/SpokeLinks';
import FinancingBanner from '@/components/FinancingBanner';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Loader2, Tag, SlidersHorizontal, X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

const CLEARANCE_FAQS = [
  {
    question: 'Is clearance flooring lower quality?',
    answer:
      'No. Our clearance products are first-quality, brand-new flooring. They\'re discounted because they\'re overstock, discontinued colours, or end-of-lot quantities from premium brands. Same warranty, same quality — just a better price.',
  },
  {
    question: 'Can I get clearance flooring installed?',
    answer:
      'Absolutely. We offer full professional installation for all clearance products. Material + installation bundles give you the best overall price. Call (647) 428-1111 to discuss your project.',
  },
  {
    question: 'How often does clearance inventory change?',
    answer:
      'Weekly. New products are added as we receive overstock shipments and clear seasonal inventory. When it\'s gone, it\'s gone — quantities are limited by definition.',
  },
  {
    question: 'Can I reserve clearance flooring?',
    answer:
      'Yes. We can hold clearance items for up to 48 hours with a deposit. Call (647) 428-1111 or visit our Markham showroom. We do not hold items without payment.',
  },
  {
    question: 'What clearance categories do you carry?',
    answer:
      'Our clearance section includes engineered hardwood (Vidar, Wickham), luxury vinyl plank (SPC), and 12mm laminate. Brands and quantities change weekly — visit in store or call (647) 428-1111 for current stock.',
  },
];

const CLEARANCE_SPOKE_LINKS = [
  {
    route: 'EngineeredHardwood',
    label: 'Engineered Hardwood',
    description: 'Full collection — Vidar, Wickham, wide-plank European oak.',
  },
  {
    route: 'Vinyl',
    label: 'Vinyl & LVP',
    description: '100% waterproof SPC vinyl — kitchens, basements, rentals.',
  },
  {
    route: 'Laminate',
    label: 'Laminate Flooring',
    description: '12mm premium laminate from $1.49/sqft.',
  },
  {
    route: 'FlooringClearanceSale',
    label: 'Clearance Sale Info',
    description: 'Learn about our clearance pricing and what\'s available now.',
  },
  {
    route: 'FlooringInstallationCost',
    label: 'Installation Pricing',
    description: 'Transparent GTA pricing — install from $2.00/sqft.',
  },
  {
    route: 'ContractorFlooring',
    label: 'Contractor Pricing',
    description: 'Trade accounts with volume discounts on all products.',
  },
];

const CATEGORIES = ['All', 'Engineered Hardwood', 'Solid Hardwood', 'Vinyl', 'Laminate'];
const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'name', label: 'Name A–Z' },
];

function getProductPrice(product) {
  return parseFloat(product.member_price || product.public_price || product.price || 0);
}

function getProductBrand(product) {
  return product.brand || '';
}

function isClearance(product) {
  const hasSaleFlag = product.is_on_sale === true;
  const tags = (product.tags || '').toLowerCase();
  const hasClearanceTag = tags.includes('clearance') || tags.includes('sale');
  const hasDiscount =
    product.public_price &&
    product.member_price &&
    parseFloat(product.member_price) < parseFloat(product.public_price) * 0.85;
  return hasSaleFlag || hasClearanceTag || hasDiscount;
}

function FilterSidebarContent({ filters, onChange, brands, maxPriceInStock }) {
  const handleCategoryChange = (cat) => {
    onChange({ ...filters, category: cat });
  };
  const handleBrandToggle = (brand) => {
    const current = filters.brands || [];
    const updated = current.includes(brand)
      ? current.filter((b) => b !== brand)
      : [...current, brand];
    onChange({ ...filters, brands: updated });
  };
  const handlePriceChange = ([min, max]) => {
    onChange({ ...filters, priceMin: min, priceMax: max });
  };

  return (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">
          Category
        </h3>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.category === cat
                  ? 'bg-amber-500 text-white font-semibold'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">
          Price Range
        </h3>
        <div className="px-1">
          <Slider
            min={0}
            max={maxPriceInStock || 20}
            step={0.5}
            value={[filters.priceMin || 0, filters.priceMax || maxPriceInStock || 20]}
            onValueChange={handlePriceChange}
            className="mb-3"
          />
          <div className="flex justify-between text-sm text-slate-600">
            <span>${(filters.priceMin || 0).toFixed(2)}/sqft</span>
            <span>${(filters.priceMax || maxPriceInStock || 20).toFixed(2)}/sqft</span>
          </div>
        </div>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">
            Brand
          </h3>
          <div className="space-y-2">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={(filters.brands || []).includes(brand)}
                  onCheckedChange={() => handleBrandToggle(brand)}
                />
                <span className="text-sm text-slate-700">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClearanceClient() {
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    brands: [],
    priceMin: 0,
    priceMax: 20,
    sortBy: 'recommended',
  });
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch('/api/products/grid?clearance=true');
        if (!res.ok) throw new Error(`Grid API ${res.status}`);
        const data = await res.json();
        setAllProducts(data || []);
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Derive clearance products
  const clearanceProducts = useMemo(
    () => allProducts.filter((p) => isClearance(p)),
    [allProducts]
  );

  // Derive brand list
  const brands = useMemo(() => {
    const set = new Set(clearanceProducts.map((p) => getProductBrand(p)).filter(Boolean));
    return Array.from(set).sort();
  }, [clearanceProducts]);

  // Max price
  const maxPriceInStock = useMemo(() => {
    if (!clearanceProducts.length) return 20;
    return Math.ceil(Math.max(...clearanceProducts.map((p) => getProductPrice(p))));
  }, [clearanceProducts]);

  // Filtered + sorted products
  const displayedProducts = useMemo(() => {
    let results = [...clearanceProducts];

    // Search
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(q) ||
          (p.product_description || '').toLowerCase().includes(q) ||
          (p.brand || '').toLowerCase().includes(q)
      );
    }

    // Category
    if (filters.category && filters.category !== 'All') {
      const catLower = filters.category.toLowerCase();
      results = results.filter(
        (p) => (p.category || '').toLowerCase().includes(catLower)
      );
    }

    // Brands
    if (filters.brands && filters.brands.length > 0) {
      results = results.filter((p) => filters.brands.includes(getProductBrand(p)));
    }

    // Price
    results = results.filter((p) => {
      const price = getProductPrice(p);
      return price >= (filters.priceMin || 0) && price <= (filters.priceMax || 9999);
    });

    // Sort
    switch (filters.sortBy) {
      case 'price_low':
        results.sort((a, b) => getProductPrice(a) - getProductPrice(b));
        break;
      case 'price_high':
        results.sort((a, b) => getProductPrice(b) - getProductPrice(a));
        break;
      case 'newest':
        results.sort(
          (a, b) =>
            new Date(b.created_date || 0).getTime() -
            new Date(a.created_date || 0).getTime()
        );
        break;
      case 'name':
        results.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      default:
        // recommended — keep original order (newest first from API)
        break;
    }

    return results;
  }, [clearanceProducts, filters]);

  const handleFilterChange = (newFilters) => setFilters(newFilters);
  const handleSortChange = (sortBy) => setFilters((prev) => ({ ...prev, sortBy }));

  const activeFilterCount = [
    filters.category !== 'All' ? 1 : 0,
    (filters.brands || []).length,
    filters.priceMin > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Home', url: '/' },
          { label: 'Clearance', url: '/clearance' },
        ]}
      />

      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
          <Tag className="w-3.5 h-3.5" />
          Limited Time Clearance
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
          Flooring Clearance
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl">
          In-stock overruns, discontinued colours, and limited-quantity lots at 30–60% off.
          First-quality products — same warranty, better price. When it's gone, it's gone.
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="text-3xl flex-shrink-0">🏷️</div>
        <div className="flex-1">
          <h2 className="font-bold text-slate-800 mb-1">What Is BBS Clearance Flooring?</h2>
          <p className="text-slate-700 text-sm leading-relaxed">
            These are <strong>brand-new, first-quality products</strong> — not seconds or defects.
            Clearance items are overstock shipments, discontinued lines, or end-of-lot quantities
            from premium brands like Vidar and Wickham. Inventory changes weekly.
          </p>
        </div>
        <div className="flex-shrink-0">
          <a
            href="tel:+16474281111"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-4 py-2 rounded-xl text-sm transition-colors whitespace-nowrap"
          >
            Check Stock: (647) 428-1111
          </a>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-36 bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                </h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() =>
                      setFilters({
                        search: '',
                        category: 'All',
                        brands: [],
                        priceMin: 0,
                        priceMax: maxPriceInStock,
                        sortBy: 'recommended',
                      })
                    }
                    className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>
              <FilterSidebarContent
                filters={filters}
                onChange={handleFilterChange}
                brands={brands}
                maxPriceInStock={maxPriceInStock}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <ProductToolbar
              filters={filters}
              onFilterChange={handleFilterChange}
              onSortChange={handleSortChange}
              filterSheetOpen={filterSheetOpen}
              onFilterSheetOpenChange={setFilterSheetOpen}
              FilterSidebar={() => (
                <FilterSidebarContent
                  filters={filters}
                  onChange={handleFilterChange}
                  brands={brands}
                  maxPriceInStock={maxPriceInStock}
                />
              )}
            />

            {/* Results count */}
            <div className="flex items-center justify-between mb-4 px-1">
              <p className="text-sm text-slate-500">
                {displayedProducts.length} clearance item
                {displayedProducts.length !== 1 ? 's' : ''} available
              </p>
              {filters.category !== 'All' && (
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, category: 'All' }))}
                  className="text-xs text-amber-700 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear category filter
                </button>
              )}
            </div>

            {/* Product Grid */}
            {displayedProducts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">
                  No clearance products match your filters
                </h3>
                <p className="text-slate-500 mb-4">
                  Try adjusting your filters or check back next week — inventory changes often.
                </p>
                <button
                  onClick={() =>
                    setFilters({
                      search: '',
                      category: 'All',
                      brands: [],
                      priceMin: 0,
                      priceMax: maxPriceInStock,
                      sortBy: 'recommended',
                    })
                  }
                  className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-2 rounded-xl text-sm transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <FinancingBanner monthlyFrom={68} />

      <StaticFAQ
        faqItems={CLEARANCE_FAQS}
        title="Clearance Flooring FAQ"
        subtitle="Common questions about our clearance inventory"
      />

      <SpokeLinks
        title="Explore Our Full Flooring Collection"
        links={CLEARANCE_SPOKE_LINKS}
      />
    </div>
  );
}
