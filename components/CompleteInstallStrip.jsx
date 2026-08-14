'use client';

// ─────────────────────────────────────────────────────────────────────────────
// "Complete your install" strip — the highest-intent attach-sell moment.
//
// WHY THIS EXISTS (the money play):
// The full AccessoryBox lives ~1000px down each PDP (below desc/specs/related), so
// most buyers — especially on mobile — never scroll to it. But by the time they're
// in the CART with a floor committed, their guard is down for the "what else do I
// need?" question. This compact strip sits ABOVE the Proceed-to-Checkout button and
// surfaces the top 2-3 relevant accessories for the floors already in the cart, each
// one-tap addable. Conversion on EXISTING traffic = the fastest money (see
// memory/ACCESSORY-ATTACH-PLAN.md Phase 2 task #1).
//
// PRICING: every item is priced from lib/accessoryCatalog.js — the same single
// source of truth the server bills against. Never hardcode a price here.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo, useState } from 'react';
import { entities } from '@/lib/base44-compat';
import { Button } from '@/components/ui/button';
import { Plus, Check, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import {
  UNDERPAD_CATALOG,
  TRIM_CATALOG,
  BASEBOARD_CATALOG,
  TRANSITION_CATALOG,
} from '@/lib/accessoryCatalog';

const IMG_BASE = 'https://qxeatxgzhfhccbaxtphq.supabase.co/storage/v1/object/public/flooring-accessories';

// ── Detect the dominant floor category already in the cart. ──
// We only key off product-line names because that's what the cart rows carry.
// vinyl/laminate get the trim+transition attach; if there's a bare laminate we
// lead with underlay (its #1 mandatory companion + top margin lever).
function detectFloor(productItems) {
  const names = productItems.map((i) => (i.product_name || '').toLowerCase());
  const hasLaminate = names.some((n) => n.includes('laminate'));
  const hasVinyl = names.some((n) => n.includes('vinyl'));
  // Rough "needs underlay" read: any laminate that doesn't self-describe as
  // pre-padded / 14mm. We can only see the name here, so this is a soft lead —
  // the full gating logic lives on the PDP AccessoryBox. Erring toward showing
  // underlay for laminate is correct (12mm/12.3mm bare is the common case).
  const laminateNeedsPad = productItems.some((i) => {
    const n = (i.product_name || '').toLowerCase();
    if (!n.includes('laminate')) return false;
    return !/14\s*mm|14mm|ixpe|attached|pre-?attached|underpad|underlay/.test(n);
  });
  return { hasLaminate, hasVinyl, laminateNeedsPad };
}

// Build the ordered pick list (top 3) for the cart's floor mix.
function buildPicks({ hasLaminate, hasVinyl, laminateNeedsPad }) {
  const picks = [];
  const qr = TRIM_CATALOG.qr_d09;
  const bb = BASEBOARD_CATALOG.bb_b05; // Colonial 5" — the most common residential profile
  const tmould = TRANSITION_CATALOG.t_moulding;
  const pad = UNDERPAD_CATALOG.underpad_3_black; // BEST VALUE default

  // Laminate: underlay is the headline (mandatory on bare floating floors).
  if (hasLaminate && laminateNeedsPad) {
    picks.push({
      kind: 'accessory', key: pad.key, label: pad.label, price: pad.price, unit: pad.unit,
      image: pad.image, sub: '3mm acoustic · moisture barrier', tag: 'MOST NEED THIS',
      coverage_sqft: pad.coverage_sqft, length_ft: null,
    });
  }
  // Quarter round — universal finish piece, everyone needs it at the wall gap.
  picks.push({
    kind: 'accessory', key: qr.key, label: qr.label, price: qr.price, unit: qr.unit,
    image: qr.image, sub: '10ft · finishes floor-to-wall gap', tag: null, length_ft: qr.length_ft,
  });
  // Transition (T-moulding) — needed at doorways / room-to-room on floating floors.
  if (hasVinyl || hasLaminate) {
    picks.push({
      kind: 'transition', key: 't_moulding', label: tmould.label, price: tmould.price, unit: tmould.unit,
      image: `${IMG_BASE}/t-moulding.webp`, sub: '8ft · doorways & room transitions', tag: null,
    });
  }
  // Baseboard rounds it out if we still have room in the top-3.
  if (picks.length < 3) {
    picks.push({
      kind: 'accessory', key: bb.key, label: bb.label, price: bb.price, unit: bb.unit,
      image: bb.image, sub: '10ft · paint-grade MDF', tag: null, length_ft: bb.length_ft,
    });
  }
  return picks.slice(0, 3);
}

export default function CompleteInstallStrip({ cartItems, sessionId, productItems, onAdded }) {
  const [addingKey, setAddingKey] = useState(null);

  const floor = useMemo(() => detectFloor(productItems), [productItems]);

  // Keys already in cart (so we don't nag for what they've added). Accessories
  // persist their key in sku/transition_type; transitions in transition_type.
  const inCartKeys = useMemo(() => {
    const s = new Set();
    cartItems.forEach((i) => {
      if (i.item_type === 'accessory') s.add(i.sku || i.transition_type);
      if (i.item_type === 'transition') s.add(i.transition_type);
    });
    return s;
  }, [cartItems]);

  const picks = useMemo(() => {
    if (!floor.hasVinyl && !floor.hasLaminate) return [];
    return buildPicks(floor).filter((p) => !inCartKeys.has(p.key));
  }, [floor, inCartKeys]);

  if (picks.length === 0) return null;

  // Parent context for the cart line (first vinyl/laminate product in cart).
  const parent = productItems.find((i) => {
    const n = (i.product_name || '').toLowerCase();
    return n.includes('vinyl') || n.includes('laminate');
  }) || productItems[0] || {};

  const addPick = async (pick) => {
    if (addingKey) return;
    setAddingKey(pick.key);
    const sub = pick.unit === 'roll'
      ? `${pick.coverage_sqft} sqft roll`
      : `${pick.length_ft || 8}ft`;
    const data = {
      session_id: sessionId,
      item_type: pick.kind, // 'accessory' | 'transition'
      transition_type: pick.key,
      sku: pick.key,
      quantity: 1,
      transition_quantity: 1,
      product_name: pick.kind === 'transition'
        ? `${pick.label} (8ft)`
        : `${pick.label} (${sub})`,
      parent_product_id: parent.product_id || parent.id || null,
      parent_product_name: parent.product_name || parent.name || null,
      image_url: pick.image,
      line_total: Math.round(pick.price * 1 * 100) / 100,
    };
    try {
      await entities.CartItem.create(data);
      toast.success(`Added ${pick.label}`);
      window.dispatchEvent(new Event('cartUpdated'));
      if (onAdded) onAdded();
    } catch (err) {
      toast.error('Could not add — try again');
      console.error(err);
    } finally {
      setAddingKey(null);
    }
  };

  return (
    <div className="mb-4 rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-4">
      <div className="flex items-center gap-2 mb-1">
        <Wrench className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <h3 className="font-bold text-slate-800 text-sm">Complete your install</h3>
      </div>
      <p className="text-xs text-slate-500 mb-3">
        Most floors like yours also need these. Add them now so nothing holds up install day.
      </p>
      <div className="space-y-2">
        {picks.map((pick) => {
          const busy = addingKey === pick.key;
          return (
            <div
              key={pick.key}
              className="flex items-center gap-3 rounded-xl bg-white border border-slate-100 p-2.5"
            >
              <img
                src={pick.image}
                alt={pick.label}
                className="w-11 h-11 rounded-lg object-cover bg-slate-50 flex-shrink-0"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap leading-tight">
                  <span className="font-semibold text-slate-800 text-sm">{pick.label}</span>
                  {pick.tag && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                      {pick.tag}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 leading-tight">{pick.sub}</div>
                <div className="text-xs font-bold text-amber-700">C${pick.price.toFixed(2)}/{pick.unit}</div>
              </div>
              <Button
                onClick={() => addPick(pick)}
                disabled={busy}
                size="sm"
                variant="outline"
                className="flex-shrink-0 h-8 border-amber-400 text-amber-700 hover:bg-amber-100 hover:text-amber-800 font-semibold px-3"
              >
                {busy ? <Check className="w-4 h-4" /> : <><Plus className="w-3.5 h-3.5 mr-1" /> Add</>}
              </Button>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-400 mt-2.5">
        Scroll down to the accessories section for underlay tiers, all baseboard styles & more.
      </p>
    </div>
  );
}
