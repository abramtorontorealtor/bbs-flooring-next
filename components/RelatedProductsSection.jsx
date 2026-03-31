'use client';

import React from 'react';
import ProductCard from './ProductCard';

export default function RelatedProductsSection({ product, relatedProducts }) {
  if (!relatedProducts || relatedProducts.length === 0) return null;
  const displayProducts = relatedProducts.filter(p => p.id !== product.id && p.image_url).slice(0, 4);
  if (displayProducts.length === 0) return null;
  const categoryLabel = product.category?.replace('_', ' ').toUpperCase();
  return (
    <div className="mt-20 pt-12 border-t border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Related {categoryLabel} Products</h2>
      <p className="text-slate-600 mb-8">Explore similar flooring options to find the perfect match for your space. Each option offers different price points, finishes, and durability levels.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {displayProducts.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
