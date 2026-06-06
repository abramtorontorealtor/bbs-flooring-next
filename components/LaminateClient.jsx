'use client';

import React from 'react';
import CategoryFilterGrid from '@/components/CategoryFilterGrid';

/**
 * LaminateClient — interactive product grid island.
 * All SEO content (H1, body text, content boxes, FAQs, spoke links, related categories)
 * is rendered server-side in app/laminate/page.jsx.
 * This component handles only the interactive product filtering/sorting grid.
 */
export default function LaminateClient({ initialProducts, serverGrid, priceStats }) {
  return (
    <CategoryFilterGrid
      category="laminate"
      sessionKey="laminate"
      queryKey="products-laminate"
      initialProducts={initialProducts}
      serverGrid={serverGrid}
    />
  );
}
