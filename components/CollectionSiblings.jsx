'use client';

/**
 * CollectionSiblings — "other colours in this collection" swatch strip.
 *
 * Renders on standalone colour PDPs (one indexed page per colour) so a shopper
 * who lands on one colour can hop to the other 6–20 colours of the same
 * brand + collection without back/scroll/click. Every swatch is a REAL
 * <Link> (crawlable, SSR) — never a JS swap or query param — so the strip also
 * acts as a dense internal-link cluster for the collection query
 * ("aquaplus vinyl flooring", "falcon 7mm vinyl") that today splits across
 * 8–16 sibling pages. See memory/COLLECTION-SIBLINGS-PLAN.md (Phase 2).
 *
 * Renders nothing when siblings.length < 2 (self is included in siblings).
 * Parent/variant products (Vidar, Impressive) never receive siblings — they
 * have VariantSelector — the server query already excludes them.
 */

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Analytics } from '@/components/analytics';
import { BRAND_PAGES } from '@/lib/breadcrumbs';

const PLACEHOLDER = '/images/product-placeholder.svg';
// Desktop: 2 rows × 8 columns before collapsing behind "+N more"
const DESKTOP_VISIBLE = 16;
// First N swatches load eagerly (above the fold on desktop); the rest lazy.
const EAGER_COUNT = 6;

const cleanUrl = (url) => (url ? url.split('?')[0] : PLACEHOLDER);

function swatchLabel(p) {
  // Prefer the DB colour field; fall back to the product name.
  return p.colour || p.name;
}

export default function CollectionSiblings({ siblings = [], current, hidePrice = false }) {
  const [expanded, setExpanded] = useState(false);

  if (!current || !Array.isArray(siblings) || siblings.length < 2) return null;

  const collection = current.collection;
  const brand = current.brand;
  const total = siblings.length;
  const brandPage = BRAND_PAGES[brand];
  const hiddenCount = Math.max(0, total - DESKTOP_VISIBLE);
  const inStockCount = siblings.filter((p) => p.in_stock !== false).length;

  const handleClick = (to) => {
    try {
      Analytics.trackEvent('sibling_swatch_click', 'collection', `${collection}: ${current.slug} -> ${to.slug}`);
    } catch { /* analytics must never break navigation */ }
  };

  const renderSwatch = (p, idx, extraClass = '') => {
    const isCurrent = p.id === current.id;
    const oos = p.in_stock === false;
    const onSale = !hidePrice && p.sale_price_per_sqft && p.price_per_sqft && Number(p.sale_price_per_sqft) < Number(p.price_per_sqft);
    const label = swatchLabel(p);
    const Wrapper = isCurrent ? 'div' : Link;
    const wrapperProps = isCurrent
      ? { 'aria-current': 'page' }
      : { href: `/products/${p.slug}`, prefetch: false, onClick: () => handleClick(p), title: `${label} — ${brand} ${collection}` };

    return (
      <Wrapper
        key={p.id}
        {...wrapperProps}
        className={`group flex-none w-[72px] sm:w-auto snap-start text-center ${extraClass}`}
      >
        <div
          className={`relative aspect-square rounded-lg overflow-hidden bg-slate-100 border-2 transition-all
            ${isCurrent ? 'border-amber-500 ring-2 ring-amber-200 ring-offset-1' : 'border-slate-200 group-hover:border-slate-400 group-hover:shadow-md'}
            ${oos ? 'opacity-45' : ''}`}
        >
          <Image
            src={cleanUrl(p.image_url)}
            alt={p.image_alt_text || `${label} — ${brand} ${collection}`}
            fill
            sizes="(max-width: 640px) 72px, 96px"
            quality={60}
            loading={idx < EAGER_COUNT ? 'eager' : 'lazy'}
            className="object-cover"
          />
          {onSale && !oos && (
            <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-bold px-1 py-px rounded leading-tight">SALE</span>
          )}
          {oos && (
            <span className="absolute inset-x-0 bottom-0 bg-slate-800/80 text-white text-[9px] font-semibold py-px leading-tight">Sold out</span>
          )}
        </div>
        <span
          className={`mt-1 block text-[11px] leading-tight truncate ${isCurrent ? 'font-semibold text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}
        >
          {label}
        </span>
      </Wrapper>
    );
  };

  return (
    <section aria-labelledby="collection-siblings-heading" className="mb-6">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <h2 id="collection-siblings-heading" className="text-sm font-semibold text-slate-800">
          {collection && collection !== brand ? (
            <>
              <span className="text-slate-500 font-medium">{brand}</span> {collection}
            </>
          ) : (
            brand
          )}
          <span className="text-slate-400 font-normal"> · {total} colours{inStockCount < total ? ` (${inStockCount} in stock)` : ''}</span>
        </h2>
        {brandPage && (
          <Link
            href={brandPage.url}
            className="text-xs font-medium text-amber-700 hover:text-amber-800 whitespace-nowrap"
          >
            View all {brandPage.label.replace(/ Flooring$/, '')} →
          </Link>
        )}
      </div>

      {/* Mobile: horizontal snap strip (~4.5 visible). Desktop: wrapping grid,
          max 2 rows then "+N more". */}
      <div
        className="flex sm:grid gap-2 sm:gap-3 overflow-x-auto sm:overflow-visible snap-x snap-mandatory sm:snap-none pb-1 -mx-1 px-1
                   sm:grid-cols-6 md:grid-cols-8 [scrollbar-width:thin]"
      >
        {siblings.map((p, idx) =>
          renderSwatch(p, idx, idx >= DESKTOP_VISIBLE && !expanded ? 'sm:hidden' : '')
        )}
      </div>

      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="hidden sm:inline-flex items-center gap-1 mt-2 text-xs font-medium text-slate-600 hover:text-slate-900"
          aria-expanded={expanded}
        >
          {expanded ? (
            <><ChevronUp className="w-3.5 h-3.5" /> Show fewer</>
          ) : (
            <><ChevronDown className="w-3.5 h-3.5" /> +{hiddenCount} more colours</>
          )}
        </button>
      )}
    </section>
  );
}
