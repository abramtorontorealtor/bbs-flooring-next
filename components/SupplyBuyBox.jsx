'use client';

// ─────────────────────────────────────────────────────────────────────────────
// SupplyBuyBox — interactive add-to-cart + inline sqft calculator for a single
// supply detail page (S3, Sep 12 2026). Mirrors the exact CartItem payload
// shape used by SuppliesShopClient/InstallKit so the server billing resolver
// (lib/suppliesCatalog.priceSupplyLine) prices every line correctly.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Calculator, Store } from 'lucide-react';
import { toast } from 'sonner';
import { entities } from '@/lib/base44-compat';
import { Analytics } from '@/components/analytics';
import { suggestQty, sizingHint } from '@/lib/installKit';
import { SUPPLIES_FULFILMENT_STRIP } from '@/lib/fulfilment';
import { stockInfo } from '@/lib/supplyFamilies';

// S5: the fulfilment line must not promise "ready next business day" on an
// order-in SKU. showroom/gta keep the shared strip; slower tiers get the
// tier's own window, same free-pickup / $140 delivery terms.
function fulfilmentLine(item) {
  const tier = item.stockTier || 'showroom';
  if (tier === 'showroom' || tier === 'gta') return SUPPLIES_FULFILMENT_STRIP;
  const info = stockInfo(tier);
  return `Free pickup in Markham once it arrives (${info.short.toLowerCase()}) \u00b7 GTA delivery $140`;
}

function getSessionId() {
  let sid = typeof window !== 'undefined' && localStorage.getItem('bbs_session_id');
  if (!sid) {
    sid = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    if (typeof window !== 'undefined') localStorage.setItem('bbs_session_id', sid);
  }
  return sid;
}

export default function SupplyBuyBox({ item }) {
  const [qty, setQty] = useState(1);
  const [calcSqft, setCalcSqft] = useState('');

  const suggested = calcSqft ? suggestQty(item, calcSqft) : 0;
  const hint = calcSqft ? sizingHint(item, calcSqft) : null;

  const addToCart = async (addQty) => {
    const q = Math.max(1, parseInt(addQty, 10) || 1);
    const sid = getSessionId();
    const unitDesc = item.pack_size || (item.coverage_sqft ? `${item.coverage_sqft} sqft ${item.unit}` : `${item.unit}`);
    const data = {
      session_id: sid,
      item_type: 'accessory',
      transition_type: item.key,
      sku: item.key,
      quantity: q,
      transition_quantity: q,
      product_name: `${item.label} (${unitDesc})`,
      parent_product_id: null,
      parent_product_name: null,
      image_url: item.image,
      line_total: Math.round(item.price * q * 100) / 100,
    };
    try {
      await entities.CartItem.create(data);
      toast.success(`Added ${q}\u00d7 ${item.label}`);
      window.dispatchEvent(new Event('cartUpdated'));
      Analytics.trackEvent(
        'supplies_page_add',
        'accessory',
        `${item.category || 'unknown'}:${item.key}x${q}:${(item.price * q).toFixed(2)}`
      );
    } catch (error) {
      toast.error('Failed to add to cart');
      console.error(error);
    }
  };

  return (
    <div className="space-y-5">
      {/* Manual qty + add */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-slate-300">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="h-11 w-11 flex items-center justify-center text-slate-600 hover:bg-slate-50"
            >
              <Minus className="w-4 h-4" />
            </button>
            <Input
              type="number"
              min="1"
              inputMode="numeric"
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="h-11 w-16 border-0 text-center focus-visible:ring-0"
              aria-label={`Quantity of ${item.label}`}
            />
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQty((q) => q + 1)}
              className="h-11 w-11 flex items-center justify-center text-slate-600 hover:bg-slate-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <Button
            type="button"
            onClick={() => addToCart(qty)}
            className="h-11 flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold"
          >
            Add to Cart — ${(item.price * qty).toFixed(2)}
          </Button>
        </div>
        {/* S4: fulfilment strip — free showroom pickup default for supplies-only carts */}
        <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <Store className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{fulfilmentLine(item)}</span>
        </p>
      </div>

      {/* Inline sqft calculator */}
      {(item.coverage_sqft || item.length_ft) && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Calculator className="w-4 h-4 text-amber-600" />
            How much do I need?
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Input
              type="number"
              min="0"
              inputMode="decimal"
              placeholder="Enter your sqft"
              value={calcSqft}
              onChange={(e) => setCalcSqft(e.target.value)}
              className="h-10 w-40 bg-white"
              aria-label="Floor square footage"
            />
            <span className="text-sm text-slate-500">sq ft</span>
          </div>
          {suggested > 0 && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-white border border-slate-200 p-3">
              <div className="text-sm text-slate-700">
                <span className="font-semibold text-slate-900">{suggested} {suggested === 1 ? item.unit : `${item.unit}s`}</span>
                {hint && <span className="text-slate-500"> — {hint}</span>}
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => addToCart(suggested)}
                className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add {suggested}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
