'use client';

// ─────────────────────────────────────────────────────────────────────────────
// INSTALL KIT — compact PDP attach block, mounted directly under the buy box.
//
// WHY (Sep 11 2026, S1 — memory/ACCESSORY-ATTACH-PLAN.md):
// The full AccessoryBox (8 baseboard profiles, 6 doorstops, 3 underpad tiers)
// lives ~1000px down the page; most buyers — nearly all on mobile — never see it.
// This block answers "what else do I need?" at the moment of decision with ≤4
// pre-checked items chosen by floor type, sized from the sqft already entered,
// added in ONE tap. Deep choosers get "Browse all accessories" (expands the full
// box below). Abram's brief: attach like reducers/T-mould, don't make the PDP a
// scroll-fest, laminate underpad must be easy.
//
// PRICING: every line is priced from lib/accessoryCatalog.js via lib/installKit.js
// — the same single source of truth the server bills against. Never hardcode a
// price here. Cart payloads mirror AccessoryBox/TransitionPieces exactly.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Minus, Plus, ShoppingCart, Wrench, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { entities } from '@/lib/base44-compat';
import { Analytics } from '@/components/analytics';
import { buildInstallKit, suggestQty, sizingHint, kitLineToCartItem } from '@/lib/installKit';

function getSessionId() {
  if (typeof window === 'undefined') return null;
  let sid = localStorage.getItem('bbs_session_id');
  if (!sid) {
    sid = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('bbs_session_id', sid);
  }
  return sid;
}

export default function InstallKit({ product, floorSqft = null, onBrowseAll, className = '' }) {
  const kit = useMemo(() => buildInstallKit(product), [product]);
  const hasSqft = !!(parseFloat(floorSqft) > 0);

  // checked[key] + qty[key] are seeded from the kit and re-sized whenever the
  // customer changes their sqft in the buy box (only for lines they haven't
  // hand-edited — a typed qty is never clobbered).
  const [checked, setChecked] = useState(() => Object.fromEntries(kit.lines.map((l) => [l.key, l.checked])));
  const [qty, setQty] = useState(() => Object.fromEntries(kit.lines.map((l) => [l.key, 1])));
  const [touched, setTouched] = useState({});
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setQty((prev) => {
      const next = { ...prev };
      kit.lines.forEach((l) => {
        if (touched[l.key]) return;
        next[l.key] = hasSqft ? suggestQty(l, floorSqft) || 1 : 1;
      });
      return next;
    });
  }, [floorSqft, hasSqft, kit, touched]);

  const selected = kit.lines.filter((l) => checked[l.key] && (qty[l.key] || 0) > 0);
  const total = selected.reduce((s, l) => s + l.price * (qty[l.key] || 0), 0);

  const bump = (key, delta) => {
    setTouched((t) => ({ ...t, [key]: true }));
    setQty((q) => ({ ...q, [key]: Math.max(1, (q[key] || 1) + delta) }));
    if (delta > 0) setChecked((c) => ({ ...c, [key]: true }));
  };

  const addKit = async () => {
    if (adding || selected.length === 0) return;
    setAdding(true);
    const sid = getSessionId();
    try {
      await Promise.all(
        selected.map((l) => entities.CartItem.create(kitLineToCartItem(l, qty[l.key], product, sid)))
      );
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success(`Added ${selected.length} install item${selected.length > 1 ? 's' : ''} · C$${total.toFixed(2)}`);
      Analytics.trackEvent(
        'install_kit_add',
        'accessory',
        `${product?.category || 'unknown'}:${selected.map((l) => `${l.key}x${qty[l.key]}`).join(',')}:${total.toFixed(2)}`
      );
      setAdded(true);
      setTimeout(() => setAdded(false), 4000);
    } catch (err) {
      console.error(err);
      toast.error('Could not add the install kit — try again');
    } finally {
      setAdding(false);
    }
  };

  if (kit.lines.length === 0) return null;

  return (
    <div className={`rounded-2xl border-2 border-amber-200 bg-white p-4 ${className}`}>
      <div className="flex items-start gap-2">
        <Wrench className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-sm leading-tight">Install Kit — everything this floor needs</h3>
          <p className="text-xs text-slate-500 mt-0.5 leading-snug">{kit.note}</p>
        </div>
      </div>

      <ul className="mt-3 space-y-1.5">
        {kit.lines.map((line) => {
          const on = !!checked[line.key];
          const q = qty[line.key] || 1;
          const hint = hasSqft ? sizingHint(line, floorSqft) : null;
          return (
            <li
              key={line.key}
              className={`flex items-center gap-2.5 rounded-xl border p-2 transition-colors ${on ? 'border-amber-300 bg-amber-50/60' : 'border-slate-200 bg-white'}`}
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                aria-label={`${on ? 'Remove' : 'Include'} ${line.label}`}
                onClick={() => setChecked((c) => ({ ...c, [line.key]: !on }))}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${on ? 'bg-amber-500 border-amber-500' : 'border-slate-300 bg-white'}`}
              >
                {on && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </button>
              <img src={line.image} alt={line.label} loading="lazy" className="w-10 h-10 rounded-lg object-cover bg-slate-50 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap leading-tight">
                  <span className="text-sm font-semibold text-slate-800">{line.label}</span>
                  {line.tag && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">{line.tag}</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 leading-snug">{line.sub}</div>
                <div className="text-[11px] font-bold text-amber-700 leading-snug">
                  C${line.price.toFixed(2)}/{line.unit}
                  {hint && <span className="font-normal text-slate-400"> · {hint}</span>}
                </div>
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0" aria-label={`${line.label} quantity`}>
                <button type="button" onClick={() => bump(line.key, -1)} disabled={q <= 1} aria-label="Decrease quantity"
                  className="w-7 h-7 rounded-md border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center text-sm font-semibold text-slate-800 tabular-nums">{q}</span>
                <button type="button" onClick={() => bump(line.key, 1)} aria-label="Increase quantity"
                  className="w-7 h-7 rounded-md border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-50">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {!hasSqft && (
        <p className="mt-2 text-[11px] text-slate-500">
          Enter your sqft above and we&apos;ll size the rolls and trim for you.
        </p>
      )}

      <Button
        onClick={addKit}
        disabled={adding || selected.length === 0}
        className={`mt-3 w-full h-11 rounded-xl font-bold text-sm transition-all ${selected.length > 0 ? 'bg-slate-900 hover:bg-slate-800 text-white' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
      >
        {added ? (
          <><Check className="w-4 h-4 mr-2" /> Added to cart</>
        ) : adding ? (
          'Adding…'
        ) : selected.length === 0 ? (
          'Select items to add'
        ) : (
          <><ShoppingCart className="w-4 h-4 mr-2" /> Add install kit · C${total.toFixed(2)}</>
        )}
      </Button>

      <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
        <button type="button" onClick={onBrowseAll} className="inline-flex items-center gap-1 font-semibold text-amber-700 hover:text-amber-800 hover:underline">
          More styles &amp; options <ChevronDown className="w-3 h-3" />
        </button>
        <a href="/flooring-accessories" className="text-slate-500 hover:text-amber-700 hover:underline">
          Underlay guide &amp; all accessories →
        </a>
      </div>
    </div>
  );
}
