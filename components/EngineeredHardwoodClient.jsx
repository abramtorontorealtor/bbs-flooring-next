'use client';

import React from 'react';
import CategoryFilterGrid from '@/components/CategoryFilterGrid';

/**
 * EngineeredHardwoodClient — interactive product grid island.
 * All SEO content (H1, body text, content boxes, FAQs, spoke links, related categories)
 * is rendered server-side in app/engineered-hardwood/page.jsx.
 * This component handles only the interactive product filtering/sorting grid.
 */
export default function EngineeredHardwoodClient({ initialProducts, serverGrid, priceStats }) {
  return (
    <CategoryFilterGrid
      category="engineered_hardwood"
      sessionKey="engineered-hardwood"
      queryKey="products-engineered-hardwood"
      initialProducts={initialProducts}
      serverGrid={serverGrid}
    />
  );
}
