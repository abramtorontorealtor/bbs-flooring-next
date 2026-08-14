'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus, Package, ZoomIn } from 'lucide-react';
import { toast } from 'sonner';
import { entities } from '@/lib/base44-compat';
import { UNDERPAD_CATALOG, TRIM_CATALOG, BASEBOARD_CATALOG } from '@/lib/accessoryCatalog';

// Ordered groups for display. Trim + baseboards are universal (every category).
// Underpad visibility is decided by needsUnderpad() below — it's never hard-hidden,
// just collapsed behind a toggle when the floor likely doesn't need it.
const GROUPS = [
  { key: 'trim',      title: 'Quarter Round & Shoe', note: 'Finishes the floor-to-wall gap. Sold per full piece.', items: Object.values(TRIM_CATALOG) },
  { key: 'baseboard', title: 'Baseboards',           note: 'Paint-grade MDF. Sold per full piece.',                items: Object.values(BASEBOARD_CATALOG) },
];

const UNDERPAD_ITEMS = Object.values(UNDERPAD_CATALOG);

// ── Underpad recommendation logic (Abram, Aug 13) ──
// Vinyl: virtually all is pre-padded → don't recommend (pad-on-pad is wrong).
// Laminate: needs pad EXCEPT 14mm (thick enough) or any SKU with attached IXPE/
//   underpad already baked into the thickness/spec string.
// Returns 'recommend' (show expanded, floor needs it), 'optional' (collapsed behind
//   a toggle — customer can still add if they know they need it), or 'hidden'.
function underpadMode(product) {
  const category = (product?.category || '').toLowerCase();
  const hay = `${product?.thickness || ''} ${product?.specifications || ''} ${product?.product_details || ''}`.toLowerCase();
  const hasAttachedPad = /ixpe|attached|pre-?attached|underpad|underlay|pad/.test(hay);

  if (category === 'laminate') {
    const is14 = /\b14\s*mm/.test(hay) || /\b14mm/.test((product?.thickness || '').toLowerCase());
    if (is14 || hasAttachedPad) return 'optional'; // 14mm or already-padded → collapsed
    return 'recommend'; // 12mm/12.3mm bare laminate → the real attach
  }
  if (category === 'vinyl') {
    return hasAttachedPad ? 'hidden' : 'optional'; // padded vinyl → hidden; bare vinyl → collapsed
  }
  return 'hidden'; // hardwood etc. → no floating underlay
}

// ── Quantity auto-suggest (Abram Aug 13 · Phase 2 task #3) ──
// Turns the sqft the customer already typed in the buy box into a sensible
// starting quantity so the qty field isn't a blank guess.
//  - Underlay (per roll): exact → ceil(sqft / roll coverage).
//  - Trim/baseboard (per 10ft/7ft stick): rooms aren't square, so estimate the
//    perimeter as ~4.5×√area (a mild buffer over the 4×√area square-room ideal)
//    then ceil(perimeter / stick length). Framed as an estimate, never forced.
function suggestQty(item, floorSqft) {
  const sqft = parseFloat(floorSqft);
  if (!sqft || sqft <= 0) return 0;
  if (item.unit === 'roll') {
    const cov = item.coverage_sqft || 200;
    return Math.max(1, Math.ceil(sqft / cov));
  }
  // per-piece linear trim → estimate perimeter
  const perimeterFt = 4.5 * Math.sqrt(sqft);
  const len = item.length_ft || 10;
  return Math.max(1, Math.ceil(perimeterFt / len));
}

export default function AccessoryBox({ product, sessionId: initialSessionId, onAccessoryAdded, floorSqft = null }) {
  const [quantities, setQuantities] = useState({});
  const padMode = underpadMode(product);
  const [showOptionalPad, setShowOptionalPad] = useState(false);
  // Lightbox: profiles matter (8 baseboard shapes, 6 doorstop profiles) — let the
  // customer tap the thumbnail to see the actual profile they're committing to.
  const [zoomItem, setZoomItem] = useState(null);

  const getSessionId = () => {
    let sid = initialSessionId || (typeof window !== 'undefined' && localStorage.getItem('bbs_session_id'));
    if (!sid) {
      sid = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      if (typeof window !== 'undefined') localStorage.setItem('bbs_session_id', sid);
    }
    return sid;
  };

  const setQty = (key, value) => {
    const qty = Math.max(0, parseInt(value) || 0);
    setQuantities(prev => ({ ...prev, [key]: qty }));
  };

  const handleAdd = async (item, qtyOverride = null) => {
    // qtyOverride lets the lightbox 'Add to Cart' pass an explicit qty without
    // waiting on the async setQty state update (stale-read guard).
    const qty = qtyOverride != null ? qtyOverride : (quantities[item.key] || 0);
    if (qty <= 0) { toast.error('Please enter a quantity greater than 0'); return; }
    const sid = getSessionId();
    const unitWord = item.unit === 'roll' ? 'Roll' : 'Piece';
    const data = {
      session_id: sid,
      item_type: 'accessory',
      // accessory_key isn't a real column — persist the key in sku so both the
      // cart render and the server billing resolver can find it in the catalog.
      transition_type: item.key,   // reused column: holds the accessory key
      sku: item.key,
      quantity: qty,
      transition_quantity: qty,    // mirror so cart qty stepper (shared shape) works
      product_name: `${item.label} (${item.unit === 'roll' ? item.coverage_sqft + ' sqft roll' : item.length_ft + 'ft'})`,
      parent_product_id: product.product_id || product.id,
      parent_product_name: product.product_name || product.name,
      image_url: item.image,
      line_total: Math.round(item.price * qty * 100) / 100,
    };
    try {
      await entities.CartItem.create(data);
      toast.success(`Added ${qty}× ${item.label}`);
      setQuantities(prev => ({ ...prev, [item.key]: 0 }));
      window.dispatchEvent(new Event('cartUpdated'));
      if (onAccessoryAdded) onAccessoryAdded();
    } catch (error) {
      toast.error('Failed to add accessory');
      console.error(error);
    }
  };

  const renderItemRow = (item) => {
    const suggested = suggestQty(item, floorSqft);
    const effectiveQty = (quantities[item.key] != null && quantities[item.key] > 0)
      ? quantities[item.key]
      : 0;
    return (
    <div key={item.key} className={`flex items-center gap-3 rounded-lg p-2.5 border ${item.recommended ? 'bg-emerald-50/60 border-emerald-300' : 'bg-white border-slate-100'}`}>
      <button
        type="button"
        onClick={() => setZoomItem(item)}
        className="relative w-12 h-12 rounded overflow-hidden bg-slate-50 flex-shrink-0 group focus:outline-none focus:ring-2 focus:ring-amber-400"
        aria-label={`View ${item.label} profile`}
      >
        <img src={item.image} alt={item.label} className="w-12 h-12 object-cover" loading="lazy" />
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
          <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </span>
      </button>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-slate-800 text-sm leading-tight flex items-center gap-1.5 flex-wrap">
          {item.label}
          {item.recommended && <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">BEST VALUE</span>}
        </div>
        <div className="text-xs text-slate-500 leading-tight mt-0.5">{item.blurb}</div>
        <div className="text-xs font-bold text-amber-700 mt-0.5">C${item.price.toFixed(2)}/{item.unit}</div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <Input type="number" min="0" value={quantities[item.key] ?? ''} onChange={(e) => setQty(item.key, e.target.value)} placeholder={suggested > 0 ? String(suggested) : 'Qty'} className="w-14 text-center h-8 text-sm" />
          <Button onClick={() => handleAdd(item)} disabled={effectiveQty <= 0} size="sm" className="bg-amber-500 hover:bg-amber-600 h-8 w-8 p-0" aria-label={`Add ${item.label}`}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {suggested > 0 && (quantities[item.key] == null || quantities[item.key] === 0) && (
          <button
            type="button"
            onClick={() => setQty(item.key, suggested)}
            className="text-[10px] font-semibold text-amber-700 hover:text-amber-800 hover:underline leading-none whitespace-nowrap"
          >
            {item.unit === 'roll'
              ? `Use ${suggested} for your ${floorSqft} sqft →`
              : `~${suggested} for your perimeter →`}
          </button>
        )}
      </div>
    </div>
    );
  };

  return (
   <>
    <Card className="border-2 border-amber-200 bg-amber-50/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="w-5 h-5 text-amber-600" />
          Finish the Job — Add Accessories
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          Underlay, quarter round, and baseboards to complete your install. Priced per full piece or roll.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ── Underlay — recommended (expanded) vs optional (collapsed toggle) ── */}
        {padMode === 'recommend' && (
          <div>
            <div className="mb-2">
              <h4 className="text-sm font-bold text-slate-800">Underlay <span className="text-xs font-semibold text-emerald-600">· Recommended for this floor</span></h4>
              <p className="text-xs text-slate-500">This floating floor needs underlay. Sold per full roll — pick one tier.</p>
            </div>
            <div className="space-y-2">{UNDERPAD_ITEMS.map(renderItemRow)}</div>
          </div>
        )}
        {padMode === 'optional' && (
          <div>
            {!showOptionalPad ? (
              <button type="button" onClick={() => setShowOptionalPad(true)} className="text-sm font-semibold text-amber-700 hover:text-amber-800 underline">
                + Need underlay? This floor usually has pad attached — add a roll anyway
              </button>
            ) : (
              <div>
                <div className="mb-2">
                  <h4 className="text-sm font-bold text-slate-800">Underlay</h4>
                  <p className="text-xs text-slate-500">Most of these floors are pre-padded, so underlay usually isn&apos;t needed. Add a roll only if your subfloor calls for it.</p>
                </div>
                <div className="space-y-2">{UNDERPAD_ITEMS.map(renderItemRow)}</div>
              </div>
            )}
          </div>
        )}

        {GROUPS.map(group => (
          <div key={group.key}>
            <div className="mb-2">
              <h4 className="text-sm font-bold text-slate-800">{group.title}</h4>
              <p className="text-xs text-slate-500">{group.note}</p>
            </div>
            <div className="space-y-2">{group.items.map(renderItemRow)}</div>
          </div>
        ))}
      </CardContent>
    </Card>

    {/* Profile lightbox — tap any accessory thumbnail to see the actual profile. */}
    <Dialog open={!!zoomItem} onOpenChange={(o) => !o && setZoomItem(null)}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {zoomItem && (
          <div>
            <div className="bg-slate-50 flex items-center justify-center p-4">
              <img
                src={zoomItem.image}
                alt={zoomItem.label}
                className="max-h-[60vh] w-auto object-contain rounded"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-slate-900">{zoomItem.label}</h4>
                {zoomItem.recommended && <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">BEST VALUE</span>}
              </div>
              {zoomItem.blurb && <p className="text-sm text-slate-600 mt-1">{zoomItem.blurb}</p>}
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm font-bold text-amber-700">C${zoomItem.price.toFixed(2)}/{zoomItem.unit}</span>
                <Button
                  onClick={() => { const q = Math.max(1, quantities[zoomItem.key] || suggestQty(zoomItem, floorSqft) || 1); handleAdd(zoomItem, q); setZoomItem(null); }}
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add to Cart
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
   </>
  );
}
