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
 * colour, a prominent "N colours" strip beneath it: swatch thumbnails that link
 * to each colour's PDP plus a "See all N colours →" CTA into the hero PDP's
 * CollectionSiblings section. The strip is the click motivator — shoppers must
 * know there is more behind the card.
 */
export default function CollectionCard({ group, index, listName = 'clearance_collections' }) {
  const { hero, colours = [], count = colours.length, maxDiscountPct = 0, discountsVary = false } = group;
  if (!hero) return null;

  if (count <= 1) {
    return <ProductCard product={hero} index={index} listName={listName} />;
  }

  const swatches = colours.slice(0, MAX_SWATCHES);
  const extra = count - swatches.length;
  const heroHref = createPageUrl(`ProductDetail?slug=${hero.slug || hero.sku || hero.id}`);
  const seeAllHref = `${heroHref}#collection-siblings-heading`;

  return (
    <div className="h-full flex flex-col">
      <ProductCard product={hero} index={index} listName={listName} />
      <div className="-mt-1 rounded-b-xl border border-t-0 border-amber-200 bg-amber-50/70 px-2.5 pt-2.5 pb-2">
        <div className="flex items-center justify-between gap-2">
          <Link
            href={seeAllHref}
            className="text-xs font-bold text-slate-900 leading-tight hover:text-amber-700"
          >
            Available in {count} colours
          </Link>
          {discountsVary && maxDiscountPct > 0 && (
            <span className="text-[10px] font-bold text-white bg-red-600 rounded px-1.5 py-0.5 whitespace-nowrap">
              Up to -{maxDiscountPct}%
            </span>
          )}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5">
          {swatches.map((c) => (
            <Link
              key={c.id || c.slug}
              href={createPageUrl(`ProductDetail?slug=${c.slug || c.sku || c.id}`)}
              title={c.name}
              aria-label={c.name}
              className="relative w-9 h-9 rounded-md overflow-hidden border border-white shadow-sm ring-1 ring-slate-200 hover:ring-2 hover:ring-amber-500 transition"
            >
              {c.image_url ? (
                <Image
                  src={c.image_url}
                  alt={c.name || 'colour'}
                  fill
                  sizes="36px"
                  quality={50}
                  loading="lazy"
                  className="object-cover"
                />
              ) : null}
            </Link>
          ))}
          {extra > 0 && (
            <Link
              href={seeAllHref}
              className="w-9 h-9 rounded-md bg-white ring-1 ring-slate-200 text-[11px] font-bold text-slate-700 inline-flex items-center justify-center hover:ring-amber-500 hover:text-amber-700 transition"
              aria-label={`See ${extra} more colours`}
            >
              +{extra}
            </Link>
          )}
          <Link
            href={seeAllHref}
            className="ml-auto text-[11px] font-semibold text-amber-700 hover:text-amber-800 whitespace-nowrap"
          >
            See all {count} →
          </Link>
        </div>
      </div>
    </div>
  );
}
