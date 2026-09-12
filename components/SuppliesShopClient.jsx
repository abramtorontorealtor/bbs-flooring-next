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
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Plus, ZoomIn, Package } from 'lucide-react';
import { toast } from 'sonner';
import { entities } from '@/lib/base44-compat';
import { Analytics } from '@/components/analytics';

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

export default function SuppliesShopClient({ sections }) {
  const [quantities, setQuantities] = useState({});
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

  const renderCard = (item) => {
    const qty = quantities[item.key] || 0;
    const cov = coverageLine(item);
    return (
      <Card
        key={item.key}
        className={`overflow-hidden ${item.recommended ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-200'}`}
      >
        <button
          type="button"
          onClick={() => setZoomItem(item)}
          className="relative block w-full aspect-square bg-slate-50 group focus:outline-none focus:ring-2 focus:ring-amber-400"
          aria-label={`View ${item.label}`}
        >
          {item.image ? (
            <img src={item.image} alt={item.label} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <span className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-400">
              <Package className="w-8 h-8" />
              <span className="text-[10px] font-bold uppercase tracking-wide">{item.unit}</span>
            </span>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/25 transition-colors">
            <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
          {item.recommended && (
            <span className="absolute top-2 left-2 rounded-full bg-emerald-600 text-white text-[10px] font-semibold px-2 py-0.5">
              BEST VALUE
            </span>
          )}
        </button>
        <CardContent className="p-4">
          <div className="font-semibold text-slate-800 text-sm leading-snug">{item.label}</div>
          {item.pack_size && <div className="text-[11px] text-slate-400 mt-0.5">{item.pack_size}</div>}
          {item.blurb && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.blurb}</p>}
          {cov && <p className="text-xs text-amber-700 font-medium mt-1.5 leading-snug">{cov}</p>}
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-lg font-bold text-slate-900">${item.price.toFixed(2)}</span>
            <span className="text-xs text-slate-500">/ {item.unit}</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Input
              type="number"
              min="0"
              inputMode="numeric"
              value={qty || ''}
              placeholder="Qty"
              onChange={(e) => setQty(item.key, Math.max(0, parseInt(e.target.value) || 0))}
              className="h-9 w-20"
              aria-label={`Quantity of ${item.label}`}
            />
            <Button
              type="button"
              onClick={() => handleAdd(item)}
              className="h-9 flex-1 bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-12">
      {sections.filter((s) => s.items.length > 0).map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-slate-900">{section.title}</h2>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">{section.note}</p>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {section.items.map(renderCard)}
          </div>
        </section>
      ))}

      <Dialog open={!!zoomItem} onOpenChange={(o) => !o && setZoomItem(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          {zoomItem && (
            <div>
              <div className="bg-slate-50 aspect-square flex items-center justify-center">
                {zoomItem.image ? (
                  <img src={zoomItem.image} alt={zoomItem.label} className="w-full h-full object-contain" />
                ) : (
                  <Package className="w-16 h-16 text-slate-300" />
                )}
              </div>
              <div className="p-5">
                <div className="font-semibold text-slate-900">{zoomItem.label}</div>
                {zoomItem.blurb && <p className="text-sm text-slate-500 mt-1">{zoomItem.blurb}</p>}
                {coverageLine(zoomItem) && <p className="text-xs text-amber-700 font-medium mt-1.5">{coverageLine(zoomItem)}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900">
                    ${zoomItem.price.toFixed(2)} <span className="text-xs font-normal text-slate-500">/ {zoomItem.unit}</span>
                  </span>
                  <Button
                    type="button"
                    onClick={() => { handleAdd(zoomItem, quantities[zoomItem.key] || 1); setZoomItem(null); }}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
