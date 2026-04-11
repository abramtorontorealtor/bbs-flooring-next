'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, Grid3X3, LayoutList, X } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price_low', label: 'Price ↑' },
  { value: 'price_high', label: 'Price ↓' },
  { value: 'newest', label: 'Newest' },
  { value: 'name', label: 'A-Z' },
];

export default function ProductToolbar({
  filters,
  onFilterChange,
  onSortChange,
  filterSheetOpen,
  onFilterSheetOpenChange,
  FilterSidebar,
  activeFilterCount = 0,
  resultCount = 0,
  viewMode = 'grid',
  onViewModeChange,
}) {
  const handleSearchChange = (e) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const clearSearch = () => {
    onFilterChange({ ...filters, search: '' });
  };

  return (
    <div className="sticky top-[140px] z-40 bg-white/95 backdrop-blur-md py-2.5 border-b border-slate-200 mb-4">
      {/* Row 1: Search + View toggle + Filter button (mobile) */}
      <div className="flex gap-2 items-center px-1">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Input
            type="text"
            placeholder="Search products…"
            value={filters.search}
            onChange={handleSearchChange}
            className="pl-8 pr-8 h-9 text-sm rounded-lg border-slate-200 focus:border-amber-400 focus:ring-amber-400/20"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          {filters.search && (
            <button
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View toggle — desktop only */}
        {onViewModeChange && (
          <div className="hidden sm:flex items-center border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
              aria-label="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
              aria-label="List view"
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Result count — desktop */}
        <span className="hidden md:block text-xs text-slate-500 whitespace-nowrap tabular-nums">{resultCount} products</span>

        {/* Filter button — mobile */}
        <Sheet open={filterSheetOpen} onOpenChange={onFilterSheetOpenChange}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="outline" size="sm" className="gap-1.5 h-9 flex-shrink-0 relative">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px]">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[320px] sm:w-[360px] overflow-auto p-0">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Filters</h2>
              <span className="text-xs text-slate-500 tabular-nums">{resultCount} results</span>
            </div>
            <div className="px-5 py-4">
              {FilterSidebar && <FilterSidebar />}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Row 2: Sort chips — inline, scrollable */}
      <div className="flex gap-1.5 items-center mt-2 px-1 overflow-x-auto scrollbar-none">
        <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap mr-0.5">Sort:</span>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSortChange(opt.value)}
            className={`whitespace-nowrap text-xs px-2.5 py-1 rounded-full transition-all duration-150 font-medium ${
              filters.sortBy === opt.value
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {opt.label}
          </button>
        ))}

        {/* Mobile result count */}
        <span className="md:hidden text-[11px] text-slate-400 ml-auto whitespace-nowrap tabular-nums">{resultCount}</span>
      </div>
    </div>
  );
}
