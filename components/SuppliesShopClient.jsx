'use client';

// ─────────────────────────────────────────────────────────────────────────────
// SuppliesShopClient — standalone add-to-cart grid for /flooring-accessories.
//
// S2 (Sep 12 2026, memory/ACCESSORY-ATTACH-PLAN.md): replaces the old
// AccessoriesShopClient (Toucan-only, hardcoded) with a DB-driven grid that
// renders every `retail_approved` row in the `supplies` table — 21 Toucan +
// 29 Prosol as of this build. `sections` is computed SERVER-SIDE from
// lib/suppliesCatalog.getSuppliesCatalog() and passed down as a plain prop, so
// this component never touches Supabase directly (keeps the DB round-trip
// server-side + cached, per CODE-QUALITY.md's server-vs-client split).
//
// Reuses the SAME CartItem POST shape as the PDP AccessoryBox/InstallKit so the
// server billing resolver (lib/suppliesCatalog.priceSupplyLine) prices every
// line correctly. No parent product here (standalone buyer), so parent_* is null.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Plus, ZoomIn, Package, Store } from 'lucide-react';
import { toast } from 'sonner';
import { entities } from '@/lib/base44-compat';
import { Analytics } from '@/components/analytics';
import { SUPPLIES_FULFILMENT_STRIP } from '@/lib/fulfilment';
import { familyUrl, stockInfo } from '@/lib/supplyFamilies';

// S5 (Sep 12 2026): `sections[].items` are now FAMILIES (lib/supplyFamilies
// buildFamilies shape) — one card per family, not per SKU. A single-member
// family keeps the inline qty + Add (its `primary` item is the cart line); a
// multi-member family sends the buyer to the family page to pick a size /
// colour, because a cart line must always be a real SKU.
const TONE = {
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  amber: 'bg-amber-50 border-amber-200 text-amber-800',
  slate: 'bg-slate-100 border-slate-200 text-slate-600',
};
function priceLabel(fam) {
  if (fam.priceLow == null) return null;
  return fam.isMulti && fam.priceLow !== fam.priceHigh ? `from $${fam.priceLow.toFixed(2)}` : `$${fam.priceLow.toFixed(2)}`;
}

const UNIT_PLURAL = { gal: 'gal', pail: 'pails', bag: 'bags', roll: 'rolls', tube: 'tubes', each: 'pieces', kit: 'kits', piece: 'pieces' };

// "1 gal covers ~150 sqft → 500 sqft needs 4 gal" style line, computed live
// from coverage_sqft — never a hand-typed number that can drift from the DB.
const EXAMPLE_SQFT = 500;
function coverageLine(item) {
  if (!item.coverage_sqft) return null;
  const needed = Math.ceil(EXAMPLE_SQFT / item.coverage_sqft);
  const word = needed === 1 ? item.unit : (UNIT_PLURAL[item.unit] || `${item.unit}s`);
  return `1 ${item.unit} covers ~${item.coverage_sqft} sqft \u2192 ${EXAMPLE_SQFT} sqft needs ${needed} ${word}`;
}

// Hub cap (Sep 13): 166 cards made the hub 38k px on mobile. Each section shows
// at most `cap` families + "See all N →" to its category page. The cheapest
// family in the section is ALWAYS in the visible set (Abram: "at least one
// cheapest option for each category") and carries a LOWEST PRICE badge.
// Cheapest = lowest $/sqft when the section has coverage numbers, else lowest
// unit price — computed from live DB fields, never a hand-picked slug.
function unitCost(fam) {
  if (fam.priceLow == null) return null;
  const cov = fam.primary?.coverage_sqft;
  return cov ? fam.priceLow / cov : fam.priceLow;
}
export function cheapestSlug(items) {
  const priced = items.filter((f) => f.priceLow != null);
  if (priced.length < 2) return null;
  const withCov = priced.filter((f) => f.primary?.coverage_sqft);
  // Compare like with like: if most of the section has coverage, rank by $/sqft.
  const useCov = withCov.length >= priced.length / 2;
  const pool = useCov ? withCov : priced;
  let best = null;
  for (const f of pool) {
    const c = useCov ? f.priceLow / f.primary.coverage_sqft : f.priceLow;
    if (best == null || c < best.c) best = { c, slug: f.slug };
  }
  return best ? best.slug : null;
}
export function visibleItems(items, cap, cheapest) {
  if (!cap || items.length <= cap) return items;
  const head = items.slice(0, cap);
  if (cheapest && !head.some((f) => f.slug === cheapest)) {
    const c = items.find((f) => f.slug === cheapest);
    if (c) head[cap - 1] = c;
  }
  return head;
}

export default function SuppliesShopClient({ sections, cap = null }) {
  const [quantities, setQuantities] = useState({});
  const [expanded, setExpanded] = useState({});
  const [zoomItem, setZoomItem] = useState(null);

  const getSessionId = () => {
    let sid = typeof window !== 'undefined' && localStorage.getItem('bbs_session_id');
    if (!sid) {
      sid = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      if (typeof window !== 'undefined') localStorage.setItem('bbs_session_id', sid);
    }
    return sid;
  };

  const setQty = (key, val) => setQuantities((prev) => ({ ...prev, [key]: val }));

  const handleAdd = async (item, qtyOverride = null) => {
    const qty = qtyOverride != null ? qtyOverride : (quantities[item.key] || 0);
    if (qty <= 0) { toast.error('Please enter a quantity greater than 0'); return; }
    const sid = getSessionId();
    const unitDesc = item.pack_size || (item.coverage_sqft ? `${item.coverage_sqft} sqft ${item.unit}` : `${item.unit}`);
    const data = {
      session_id: sid,
      item_type: 'accessory',
      transition_type: item.key, // reused column: holds the accessory/supply key
      sku: item.key,
      quantity: qty,
      transition_quantity: qty,
      product_name: `${item.label} (${unitDesc})`,
      parent_product_id: null,
      parent_product_name: null,
      image_url: item.image,
      line_total: Math.round(item.price * qty * 100) / 100,
    };
    try {
      await entities.CartItem.create(data);
      toast.success(`Added ${qty}\u00d7 ${item.label}`);
      setQty(item.key, 0);
      window.dispatchEvent(new Event('cartUpdated'));
      // GA4 — mirrors the install_kit_add event shape (Sep 11 S1), tagged
      // separately so hub-page attach can be measured on its own (deliverable
      // #6, S2 spec).
      Analytics.trackEvent(
        'supplies_page_add',
        'accessory',
        `${item.category || 'unknown'}:${item.key}x${qty}:${(item.price * qty).toFixed(2)}`
      );
    } catch (error) {
      toast.error('Failed to add to cart');
      console.error(error);
    }
  };

  const renderCard = (fam, cheapest) => {
    const item = fam.primary;
    const qty = quantities[item.key] || 0;
    const cov = fam.isMulti ? null : coverageLine(item);
    const tier = stockInfo(fam.bestTier);
    const href = familyUrl(fam);
    const isCheapest = !!cheapest && fam.slug === cheapest;
    const perSqft = unitCost(fam);
    return (
      <Card
        key={fam.slug}
        className={`overflow-hidden flex flex-col ${fam.recommended ? 'border-emerald-300 ring-1 ring-emerald-200' : isCheapest ? 'border-sky-300 ring-1 ring-sky-200' : 'border-slate-200'}`}
      >
        <button
          type="button"
          onClick={() => setZoomItem(fam)}
          className="relative block w-full aspect-square bg-slate-50 group focus:outline-none focus:ring-2 focus:ring-amber-400"
          aria-label={`View ${fam.name}`}
        >
          {fam.image ? (
            <img src={fam.image} alt={fam.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <span className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-400">
              <Package className="w-8 h-8" />
              <span className="text-[10px] font-bold uppercase tracking-wide">{item.unit}</span>
            </span>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/25 transition-colors">
            <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
          {fam.recommended && (
            <span className="absolute top-2 left-2 rounded-full bg-emerald-600 text-white text-[10px] font-semibold px-2 py-0.5">
              BEST VALUE
            </span>
          )}
          {isCheapest && (
            <span className={`absolute ${fam.recommended ? 'bottom-2' : 'top-2'} left-2 rounded-full bg-sky-700 text-white text-[10px] font-semibold px-2 py-0.5`}>
              LOWEST PRICE
            </span>
          )}
          {fam.isMulti && (
            <span className="absolute top-2 right-2 rounded-full bg-white/90 border border-slate-200 text-slate-700 text-[10px] font-semibold px-2 py-0.5">
              {fam.optionCount} options
            </span>
          )}
        </button>
        <CardContent className="p-4 flex flex-col flex-1">
          {fam.brand && !fam.name.startsWith(fam.brand) && (
            <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">{fam.brand}</div>
          )}
          <Link href={href} className="font-semibold text-slate-800 text-sm leading-snug hover:text-amber-700 hover:underline">
            {fam.name}
          </Link>
          {!fam.isMulti && item.pack_size && <div className="text-[11px] text-slate-400 mt-0.5">{item.pack_size}</div>}
          {fam.blurb && <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-3">{fam.blurb}</p>}
          {cov && <p className="text-xs text-amber-700 font-medium mt-1.5 leading-snug">{cov}</p>}
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-lg font-bold text-slate-900">{priceLabel(fam)}</span>
            {!fam.isMulti && <span className="text-xs text-slate-500">/ {item.unit}</span>}
            {isCheapest && item.coverage_sqft && perSqft != null && (
              <span className="ml-auto text-[11px] font-semibold text-sky-700">${perSqft.toFixed(2)}/sqft</span>
            )}
          </div>
          <span className={`mt-2 inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${TONE[tier.tone]}`}>
            {tier.short}
          </span>
          <div className="mt-auto pt-3">
            {fam.isMulti ? (
              <Button asChild className="h-9 w-full bg-amber-600 hover:bg-amber-700 text-white">
                <Link href={href}>Choose {fam.picker.toLowerCase()}</Link>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={qty || ''}
                  placeholder="Qty"
                  onChange={(e) => setQty(item.key, Math.max(0, parseInt(e.target.value) || 0))}
                  className="h-9 w-20"
                  aria-label={`Quantity of ${fam.name}`}
                />
                <Button
                  type="button"
                  onClick={() => handleAdd(item)}
                  className="h-9 flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-12">
      {/* S4: fulfilment strip shared by the hub and every category page */}
      <p className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5 text-sm text-slate-700">
        <Store className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span>{SUPPLIES_FULFILMENT_STRIP}</span>
      </p>
      {sections.filter((s) => s.items.length > 0).map((section) => {
        const cheapest = cheapestSlug(section.items);
        const isExpanded = !!expanded[section.id];
        const shown = isExpanded ? section.items : visibleItems(section.items, cap, cheapest);
        const hidden = section.items.length - shown.length;
        return (
          <section key={section.id} id={section.id} className="scroll-mt-24">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 className="text-2xl font-bold text-slate-900">{section.title}</h2>
              {section.seeAllHref && hidden > 0 && (
                <Link href={section.seeAllHref} className="text-sm font-semibold text-amber-700 hover:underline">
                  See all {section.items.length} →
                </Link>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-600 max-w-2xl">{section.note}</p>
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {shown.map((fam) => renderCard(fam, cheapest))}
            </div>
            {hidden > 0 && (
              <div className="mt-5 flex justify-center">
                {section.seeAllHref ? (
                  <Button asChild variant="outline" className="h-10 px-6 border-slate-300 text-slate-800">
                    <Link href={section.seeAllHref}>See all {section.items.length} {section.title.toLowerCase()} →</Link>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 px-6 border-slate-300 text-slate-800"
                    onClick={() => setExpanded((e) => ({ ...e, [section.id]: true }))}
                  >
                    Show all {section.items.length}
                  </Button>
                )}
              </div>
            )}
          </section>
        );
      })}

      <Dialog open={!!zoomItem} onOpenChange={(o) => !o && setZoomItem(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          {zoomItem && (
            <div>
              <div className="bg-slate-50 aspect-square flex items-center justify-center">
                {zoomItem.image ? (
                  <img src={zoomItem.image} alt={zoomItem.name} className="w-full h-full object-contain" />
                ) : (
                  <Package className="w-16 h-16 text-slate-300" />
                )}
              </div>
              <div className="p-5">
                <div className="font-semibold text-slate-900">{zoomItem.name}</div>
                {zoomItem.blurb && <p className="text-sm text-slate-500 mt-1">{zoomItem.blurb}</p>}
                {!zoomItem.isMulti && coverageLine(zoomItem.primary) && <p className="text-xs text-amber-700 font-medium mt-1.5">{coverageLine(zoomItem.primary)}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900">
                    {priceLabel(zoomItem)} {!zoomItem.isMulti && <span className="text-xs font-normal text-slate-500">/ {zoomItem.primary.unit}</span>}
                  </span>
                  {zoomItem.isMulti ? (
                    <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white">
                      <Link href={familyUrl(zoomItem)}>Choose {zoomItem.picker.toLowerCase()}</Link>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => { handleAdd(zoomItem.primary, quantities[zoomItem.primary.key] || 1); setZoomItem(null); }}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add to Cart
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
