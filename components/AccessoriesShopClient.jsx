'use client';

// ─────────────────────────────────────────────────────────────────────────────
// AccessoriesShopClient — standalone add-to-cart grid for /flooring-accessories.
// Reuses the SAME CartItem POST shape as the PDP AccessoryBox so the server
// billing resolver (lib/accessoryCatalog.priceAccessoryLine) prices every line
// correctly. No parent product here (standalone buyer), so parent_* is null.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Plus, ZoomIn } from 'lucide-react';
import { toast } from 'sonner';
import { entities } from '@/lib/base44-compat';
import { UNDERPAD_CATALOG, TRIM_CATALOG, BASEBOARD_CATALOG } from '@/lib/accessoryCatalog';

const SECTIONS = [
  {
    id: 'underlay',
    title: 'Underlay & Moisture Barrier',
    note: 'Sold per full roll. Underlay is mandatory under floating laminate — it soundproofs, cushions, and (on the 3mm black + 5mm airflow) blocks moisture from concrete or below-grade subfloors.',
    items: Object.values(UNDERPAD_CATALOG),
  },
  {
    id: 'quarter-round',
    title: 'Quarter Round & Shoe Moulding',
    note: 'Finishes the floor-to-baseboard gap for a clean edge. Sold per full piece.',
    items: Object.values(TRIM_CATALOG),
  },
  {
    id: 'baseboards',
    title: 'Baseboards',
    note: 'Paint-grade MDF, eight profiles. Sold per full 10ft piece.',
    items: Object.values(BASEBOARD_CATALOG),
  },
];

export default function AccessoriesShopClient() {
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
    const data = {
      session_id: sid,
      item_type: 'accessory',
      transition_type: item.key, // reused column: holds the accessory key
      sku: item.key,
      quantity: qty,
      transition_quantity: qty,
      product_name: `${item.label} (${item.unit === 'roll' ? item.coverage_sqft + ' sqft roll' : item.length_ft + 'ft'})`,
      parent_product_id: null,
      parent_product_name: null,
      image_url: item.image,
      line_total: Math.round(item.price * qty * 100) / 100,
    };
    try {
      await entities.CartItem.create(data);
      toast.success(`Added ${qty}× ${item.label}`);
      setQty(item.key, 0);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      toast.error('Failed to add to cart');
      console.error(error);
    }
  };

  const renderCard = (item) => {
    const qty = quantities[item.key] || 0;
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
          <img src={item.image} alt={item.label} className="w-full h-full object-cover" loading="lazy" />
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
          {item.blurb && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.blurb}</p>}
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
      {SECTIONS.map((section) => (
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
                <img src={zoomItem.image} alt={zoomItem.label} className="w-full h-full object-contain" />
              </div>
              <div className="p-5">
                <div className="font-semibold text-slate-900">{zoomItem.label}</div>
                {zoomItem.blurb && <p className="text-sm text-slate-500 mt-1">{zoomItem.blurb}</p>}
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
