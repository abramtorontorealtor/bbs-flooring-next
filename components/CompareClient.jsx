'use client';

import { useState, useEffect } from 'react';
import ProductComparison from '@/components/ProductComparison';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getStaticBreadcrumbs } from '@/lib/breadcrumbs';

export default function CompareClient() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bbs_compare');
      if (stored) setProducts(JSON.parse(stored));
    } catch {
      // silently ignore parse errors
    }
  }, []);

  const handleRemove = (id) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    try {
      localStorage.setItem('bbs_compare', JSON.stringify(updated));
    } catch {}
  };

  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h1 className="text-2xl font-bold text-slate-800 mb-4">No Products to Compare</h1>
        <p className="text-slate-600 mb-8">Add products to compare from any product page.</p>
        <a
          href="/products"
          className="inline-block bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors"
        >
          Browse Products
        </a>
        <div className="mt-10">
          <p className="text-slate-500 text-sm mb-4">Browse popular categories:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="/vinyl" className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:border-amber-500 hover:text-amber-600 transition-colors text-sm">Vinyl Flooring</a>
            <a href="/solid-hardwood" className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:border-amber-500 hover:text-amber-600 transition-colors text-sm">Solid Hardwood</a>
            <a href="/engineered-hardwood" className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:border-amber-500 hover:text-amber-600 transition-colors text-sm">Engineered Hardwood</a>
            <a href="/laminate" className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:border-amber-500 hover:text-amber-600 transition-colors text-sm">Laminate</a>
            <a href="/products" className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:border-amber-500 hover:text-amber-600 transition-colors text-sm">All Products</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs items={getStaticBreadcrumbs('/compare')} />
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Compare Products</h1>
      <ProductComparison products={products} onRemove={handleRemove} inline />
    </div>
  );
}
