'use client';

import React from 'react';
import CategoryFilterGrid from '@/components/CategoryFilterGrid';

/**
 * VinylClient — interactive product grid island.
 * All SEO content (H1, body text, content boxes, FAQs, spoke links, related categories)
 * is rendered server-side in app/vinyl/page.jsx.
 * This component handles only the interactive product filtering/sorting grid.
 */
export default function VinylClient({ initialProducts, serverGrid, priceStats }) {
  return (
    <CategoryFilterGrid
      category="vinyl"
      sessionKey="vinyl"
      queryKey="products-vinyl"
      initialProducts={initialProducts}
      serverGrid={serverGrid}
    />
  );
}
