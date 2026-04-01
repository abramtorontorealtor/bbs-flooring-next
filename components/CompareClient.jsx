'use client';

import { useState, useEffect } from 'react';
import ProductComparison from '@/components/ProductComparison';

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
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Compare Products</h1>
      <ProductComparison products={products} onRemove={handleRemove} inline />
    </div>
  );
}
