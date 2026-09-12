'use client';

// ─────────────────────────────────────────────────────────────────────────────
// SupplyFamilyBuyBox — the hero of a supply FAMILY page (S5, Sep 12 2026):
// pack shot + title + variant picker (size / colour / finish) + price +
// availability badge + the existing SupplyBuyBox (qty, add-to-cart, sqft calc)
// for whichever member is selected.
//
// The selected member is mirrored into `?v=<code>` with history.replaceState
// (no navigation, no re-render of the server page) so a shared link opens on
// the right size. Canonical stays the bare family URL — set server-side.
//
// Cart payload is unchanged: SupplyBuyBox posts the MEMBER's key, so the
// server billing resolver (lib/suppliesCatalog.priceSupplyLine) prices the
// exact SKU that was picked. Nothing family-level ever reaches the cart.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Check } from 'lucide-react';
import SupplyBuyBox from '@/components/SupplyBuyBox';
import { stockInfo } from '@/lib/supplyFamilies';
import { Analytics } from '@/components/analytics';

const TONE = {
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  amber: 'bg-amber-50 border-amber-200 text-amber-800',
  slate: 'bg-slate-100 border-slate-200 text-slate-600',
};

export function StockBadge({ tier, className = '' }) {
  const info = stockInfo(tier);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${TONE[info.tone]} ${className}`}>
      {info.label}
    </span>
  );
}

export default function SupplyFamilyBuyBox({ family, initialCode, works = [] }) {
  const members = family.items;
  const start = members.find((m) => m.code === initialCode) || family.primary || members[0];
  const [selected, setSelected] = useState(start);

  // Keep the URL shareable without a navigation.
  useEffect(() => {
    if (typeof window === 'undefined' || !family.isMulti) return;
    const url = new URL(window.location.href);
    if (selected.code === family.primary.code) url.searchParams.delete('v');
    else url.searchParams.set('v', selected.code);
    window.history.replaceState(null, '', url.pathname + (url.search || '') + url.hash);
  }, [selected, family]);

  const pick = (m) => {
    if (m.code === selected.code) return;
    setSelected(m);
    Analytics.trackEvent('supplies_variant_pick', 'accessory', `${family.slug}:${m.code}`);
  };

  const image = selected.image || family.image;
  const showFrom = family.isMulti && family.priceLow != null && family.priceLow !== family.priceHigh;

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={`${family.name}${selected.variantLabel ? ` — ${selected.variantLabel}` : ''}`} className="w-full h-full object-cover" fetchPriority="high" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <Package className="w-16 h-16" />
            <span className="text-xs font-bold uppercase tracking-wide">{selected.code}</span>
          </div>
        )}
      </div>

      <div>
        {family.brand && <div className="text-sm font-semibold text-amber-700 uppercase tracking-wide">{family.brand}</div>}
        <h1 className="mt-1 text-3xl font-bold text-slate-900">{family.name}</h1>
        {!family.isMulti && selected.pack_size && <div className="mt-1 text-sm text-slate-500">{selected.pack_size}</div>}

        {family.blurb && <p className="mt-3 text-slate-600 leading-relaxed">{family.blurb}</p>}

        {family.isMulti && (
          <fieldset className="mt-5">
            <legend className="text-sm font-semibold text-slate-800">
              {family.picker}
              <span className="ml-2 font-normal text-slate-500">{members.length} options</span>
            </legend>
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={family.picker}>
              {members.map((m) => {
                const active = m.code === selected.code;
                const info = stockInfo(m.stockTier);
                return (
                  <button
                    key={m.code}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => pick(m)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      active
                        ? 'border-amber-500 bg-amber-50 text-slate-900 ring-1 ring-amber-400'
                        : 'border-slate-300 text-slate-700 hover:border-amber-400'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-semibold">
                      {active && <Check className="w-3.5 h-3.5 text-amber-600" />}
                      {m.variantLabel || m.pack_size || m.code}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {m.price != null ? `$${m.price.toFixed(2)}` : 'Ask'} · {info.short}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        <div className="mt-5 flex items-baseline gap-2">
          {selected.price != null && <span className="text-3xl font-bold text-slate-900">${selected.price.toFixed(2)}</span>}
          <span className="text-sm text-slate-500">/ {selected.unit}</span>
          {showFrom && (
            <span className="ml-2 text-sm text-slate-500">
              (options from ${family.priceLow.toFixed(2)} to ${family.priceHigh.toFixed(2)})
            </span>
          )}
        </div>
        {family.isMulti && (
          <div className="mt-1 text-sm text-slate-600">
            Selected: <span className="font-medium text-slate-800">{selected.label}</span>
            {selected.pack_size && selected.pack_size !== selected.variantLabel ? ` · ${selected.pack_size}` : ''}
          </div>
        )}

        <div className="mt-3">
          <StockBadge tier={selected.stockTier} />
        </div>

        <div className="mt-6">
          <SupplyBuyBox key={selected.code} item={selected} />
        </div>

        {works.length > 0 && (
          <div className="mt-6">
            <div className="text-sm font-semibold text-slate-800">Works with</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {works.map((w) => (
                <Link key={w.url} href={w.url} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-amber-400 hover:text-amber-700">
                  {w.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
