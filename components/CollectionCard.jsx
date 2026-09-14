'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createPageUrl } from '@/lib/routes';
import ProductCard from '@/components/ProductCard';

const MAX_SWATCHES = 4;

/**
 * One grid card per brand+collection. Renders the hero colour via the existing
 * ProductCard (untouched markup) and, when the collection has more than one
 * colour, a compact swatch strip beneath it linking to each colour's PDP.
 * The PDP's CollectionSiblings shows the full colour range — the grid doesn't need to.
 */
export default function CollectionCard({ group, index, listName = 'clearance_collections' }) {
  const { hero, colours = [], count = colours.length, maxDiscountPct = 0, discountsVary = false } = group;
  if (!hero) return null;

  if (count <= 1) {
    return <ProductCard product={hero} index={index} listName={listName} />;
  }

  const swatches = colours.slice(0, MAX_SWATCHES);
  const extra = count - swatches.length;

  return (
    <div className="h-full flex flex-col">
      <ProductCard product={hero} index={index} listName={listName} />
      <div className="mt-1.5 px-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {swatches.map((c) => (
            <Link
              key={c.id || c.slug}
              href={createPageUrl(`ProductDetail?slug=${c.slug || c.sku || c.id}`)}
              title={c.name}
              className="relative w-8 h-8 rounded-md overflow-hidden border border-slate-200 bg-slate-50 hover:ring-2 hover:ring-amber-400 transition"
            >
              {c.image_url ? (
                <Image
                  src={c.image_url}
                  alt={c.name || 'colour'}
                  fill
                  sizes="32px"
                  quality={50}
                  loading="lazy"
                  className="object-cover"
                />
              ) : null}
            </Link>
          ))}
          {extra > 0 && (
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 rounded-md px-1.5 h-8 inline-flex items-center">
              +{extra}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {discountsVary && maxDiscountPct > 0 && (
            <span className="text-[10px] font-bold text-white bg-red-600 rounded px-1.5 py-0.5">
              Up to -{maxDiscountPct}%
            </span>
          )}
          <span className="text-[11px] text-slate-500 whitespace-nowrap">{count} colours</span>
        </div>
      </div>
    </div>
  );
}
