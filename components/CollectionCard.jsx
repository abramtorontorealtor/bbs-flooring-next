'use client';

import React from 'react';
import ProductCard from '@/components/ProductCard';
import CollectionColourStrip from '@/components/CollectionColourStrip';

/**
 * One grid card per brand+collection (hydrated grids). Renders the hero colour
 * via the existing ProductCard (untouched markup) and, when the collection has
 * more than one colour, the CollectionColourStrip beneath it. Groups come from
 * lib/collection-groups.js. SSR twin: CollectionCardStatic.
 */
export default function CollectionCard({ group, index, listName = 'clearance_collections', isSaved, user }) {
  const { hero, count = 1 } = group;
  if (!hero) return null;

  if (count <= 1) {
    return <ProductCard product={hero} index={index} listName={listName} isSaved={isSaved} user={user} />;
  }

  return (
    <div className="h-full flex flex-col">
      <ProductCard product={hero} index={index} listName={listName} isSaved={isSaved} user={user} />
      <CollectionColourStrip group={group} />
    </div>
  );
}
