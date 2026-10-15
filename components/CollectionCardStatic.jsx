import React from 'react';
import ProductCardStatic from '@/components/ProductCardStatic';
import CollectionColourStrip from '@/components/CollectionColourStrip';

/* ── Static Collection Card (Server Component) ──
 * SSR twin of CollectionCard: hero via ProductCardStatic + the same
 * CollectionColourStrip, so the server grid matches the hydrated grid
 * card-for-card (no CLS, crawlers see the swatch links).
 */
export default function CollectionCardStatic({ group, priority = false }) {
  const { hero, count = 1 } = group;
  if (!hero) return null;

  if (count <= 1) {
    return <ProductCardStatic product={hero} priority={priority} />;
  }

  return (
    <div className="h-full flex flex-col">
      <ProductCardStatic product={hero} priority={priority} />
      <CollectionColourStrip group={group} />
    </div>
  );
}
