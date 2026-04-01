'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function ProductToolbar({ filters, onFilterChange, onSortChange, filterSheetOpen, onFilterSheetOpenChange, FilterSidebar }) {
  const handleSearchChange = (e) => {
    onFilterChange({ ...filters, search: e.target.value });
  };
  const handleSortChange = (value) => {
    onSortChange(value);
  };
  return (
    <div className="sticky top-[128px] z-40 bg-white py-3 border-b border-slate-200 shadow-md mb-6">
      <div className="flex gap-2 sm:gap-4 items-center px-4">
        <div className="relative flex-1 min-w-0">
          <Input type="text" placeholder="Search products..." value={filters.search} onChange={handleSearchChange} className="pl-9 h-9 text-sm" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
        <Select value={filters.sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-28 sm:w-44 h-9 text-sm flex-shrink-0"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="recommended">Recommended</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
          </SelectContent>
        </Select>
        <Sheet open={filterSheetOpen} onOpenChange={onFilterSheetOpenChange}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="outline" size="sm" className="gap-1.5 h-9 flex-shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-auto">
            <h2 className="text-xl font-bold mb-6">Filters</h2>
            {FilterSidebar && <FilterSidebar />}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
