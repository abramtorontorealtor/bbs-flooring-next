'use client';

import React from 'react';
import CategoryFilterGrid from '@/components/CategoryFilterGrid';

/**
 * SolidHardwoodClient — interactive product grid island.
 * All SEO content (H1, body text, content boxes, FAQs, spoke links, related categories)
 * is rendered server-side in app/solid-hardwood/page.jsx.
 * This component handles only the interactive product filtering/sorting grid.
 */
export default function SolidHardwoodClient({ initialProducts, serverGrid, priceStats }) {
  return (
    <CategoryFilterGrid
      category="solid_hardwood"
      sessionKey="solid-hardwood"
      queryKey="products-solid-hardwood"
      initialProducts={initialProducts}
      serverGrid={serverGrid}
    />
  );
}
