'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Package } from 'lucide-react';
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

export default function AccessoryBox({ product, sessionId: initialSessionId, onAccessoryAdded }) {
  const [quantities, setQuantities] = useState({});
  const padMode = underpadMode(product);
  const [showOptionalPad, setShowOptionalPad] = useState(false);

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

  const handleAdd = async (item) => {
    const qty = quantities[item.key] || 0;
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

  const renderItemRow = (item) => (
    <div key={item.key} className="flex items-center gap-3 bg-white rounded-lg p-2.5 border border-slate-100">
      <img src={item.image} alt={item.label} className="w-12 h-12 rounded object-cover bg-slate-50 flex-shrink-0" loading="lazy" />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-slate-800 text-sm leading-tight">{item.label}</div>
        <div className="text-xs text-slate-500 leading-tight mt-0.5">{item.blurb}</div>
        <div className="text-xs font-bold text-amber-700 mt-0.5">C${item.price.toFixed(2)}/{item.unit}</div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Input type="number" min="0" value={quantities[item.key] || ''} onChange={(e) => setQty(item.key, e.target.value)} placeholder="Qty" className="w-14 text-center h-8 text-sm" />
        <Button onClick={() => handleAdd(item)} disabled={(quantities[item.key] || 0) <= 0} size="sm" className="bg-amber-500 hover:bg-amber-600 h-8 w-8 p-0" aria-label={`Add ${item.label}`}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
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
  );
}
