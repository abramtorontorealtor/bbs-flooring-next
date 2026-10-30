'use client';

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT PLANNER (/planner) — room-by-room flooring planner (Oct 30 2026).
// Rooms → product → sqft (+waste) → boxes → underlay/shoe lines → totals →
// one-tap cart, installation booking with totals prefilled, or print.
//
// Reuses: lib/installKit.js (buildInstallKit / suggestQty / kitLineToCartItem —
// prices come from the same catalog the server bills against), the CartItem
// shape written by ProductDetailClient, /api/products/calculator for the picker.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChevronDown, Plus, Printer, RotateCcw, Ruler, Search, ShoppingCart, Trash2, Wrench } from 'lucide-react';
import { entities } from '@/lib/base44-compat';
import { track } from '@/lib/track';
import { buildInstallKit, suggestQty, kitLineToCartItem } from '@/lib/installKit';

const STORAGE_KEY = 'bbs_project';
const HST = 0.13;
// Only these kit lines belong in a per-room plan (underlay + shoe moulding).
const PLANNER_KIT_KEYS = ['underpad_3_black', 'prosol_wax_paper', 'shoe_d02'];

const WASTE_OPTIONS = [
  { value: 5, label: '5%', desc: 'Simple rectangle' },
  { value: 10, label: '10%', desc: 'Standard' },
  { value: 15, label: '15%', desc: 'Complex / diagonal' },
];

const PRESETS = ['Living room', 'Bedroom', 'Kitchen', 'Hallway', 'Basement', 'Dining room', 'Office', 'Stairs'];

const CATEGORY_CHIPS = [
  { value: 'all', label: 'All' },
  { value: 'engineered_hardwood', label: 'Engineered' },
  { value: 'solid_hardwood', label: 'Solid hardwood' },
  { value: 'vinyl', label: 'Vinyl' },
  { value: 'laminate', label: 'Laminate' },
];

const money = (n) =>
  'C$' + (Number(n) || 0).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

function uid() {
  return 'r_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function newRoom(name = 'Living room', productId = null, extra = {}) {
  const isStairs = name === 'Stairs';
  return {
    id: uid(),
    name,
    kind: isStairs ? 'stairs' : 'room',
    mode: 'dims', // 'dims' | 'direct'
    length: '',
    width: '',
    sqft: '',
    waste: 10,
    productId: isStairs ? null : productId,
    treads: '',
    kitOverride: {}, // { [lineKey]: boolean } — only keys the customer touched
    pickerOpen: !isStairs && !productId,
    ...extra,
  };
}

function getSessionId() {
  if (typeof window === 'undefined') return null;
  let sid = localStorage.getItem('bbs_session_id');
  if (!sid) {
    sid = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('bbs_session_id', sid);
  }
  return sid;
}

function unitPrice(p) {
  const sale = Number(p?.sale_price_per_sqft) || 0;
  const reg = Number(p?.price_per_sqft) || 0;
  return sale > 0 ? sale : reg;
}

function roomRawSqft(room) {
  if (room.kind === 'stairs') return 0;
  if (room.mode === 'dims') {
    const l = parseFloat(room.length);
    const w = parseFloat(room.width);
    return l > 0 && w > 0 ? l * w : 0;
  }
  return parseFloat(room.sqft) > 0 ? parseFloat(room.sqft) : 0;
}

// Kit lines (underlay + shoe only) for one product. Cached per product by the caller.
function plannerKitLines(product) {
  if (!product) return [];
  try {
    return buildInstallKit(product, null).lines.filter((l) => PLANNER_KIT_KEYS.includes(l.key));
  } catch {
    return [];
  }
}

function calcRoom(room, product, kitCache) {
  const sqft = roomRawSqft(room);
  const base = { sqft, product, boxes: 0, actualSqft: 0, neededSqft: 0, flooringTotal: 0, kit: [], kitTotal: 0, clamped: false, maxSqft: null, ready: false };
  if (room.kind === 'stairs' || !product || sqft <= 0) return base;
  const perBox = Number(product.sqft_per_box) || 0;
  if (perBox <= 0) return base;

  const neededSqft = sqft * (1 + room.waste / 100);
  let boxes = Math.max(1, Math.ceil(neededSqft / perBox - 1e-9));
  let clamped = false;
  let maxSqft = null;
  const lot = Number(product.lot_boxes_left) || 0;
  if (lot > 0 && boxes > lot) {
    boxes = lot;
    clamped = true;
    maxSqft = Math.floor(lot * perBox);
  }
  const actualSqft = round2(boxes * perBox);
  const price = unitPrice(product);
  const flooringTotal = round2(actualSqft * price);

  let lines = kitCache.get(product.id);
  if (!lines) {
    lines = plannerKitLines(product);
    kitCache.set(product.id, lines);
  }
  const kit = lines.map((line) => {
    const qty = suggestQty(line, sqft);
    const override = room.kitOverride?.[line.key];
    const checked = typeof override === 'boolean' ? override : !!line.checked;
    return { line, qty, checked, total: round2(line.price * qty) };
  });
  const kitTotal = round2(kit.filter((k) => k.checked).reduce((s, k) => s + k.total, 0));

  return { ...base, boxes, actualSqft, neededSqft, flooringTotal, kit, kitTotal, clamped, maxSqft, price, ready: true };
}

// ── Product picker ──────────────────────────────────────────────────────────
function ProductPicker({ products, loading, error, onPick }) {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');

  const results = useMemo(() => {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    return products.filter((p) => {
      if (cat !== 'all' && p.category !== cat) return false;
      if (!tokens.length) return true;
      const hay = `${p.name} ${p.brand || ''} ${p.sku || ''} ${p.subcategory || ''}`.toLowerCase();
      return tokens.every((t) => hay.includes(t));
    });
  }, [products, query, cat]);

  const shown = results.slice(0, 40);

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, brand or SKU"
          aria-label="Search flooring products"
          className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-base focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
      </div>
      <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
        {CATEGORY_CHIPS.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCat(c.value)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              cat === c.value ? 'border-amber-500 bg-amber-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-2 max-h-80 overflow-y-auto rounded-lg bg-white">
        {loading && <p className="p-4 text-sm text-slate-500">Loading products…</p>}
        {error && <p className="p-4 text-sm text-red-600">Couldn&apos;t load products. Please refresh and try again.</p>}
        {!loading && !error && shown.length === 0 && <p className="p-4 text-sm text-slate-500">No products match. Try a different search.</p>}
        <ul className="divide-y divide-slate-100">
          {shown.map((p) => {
            const price = unitPrice(p);
            const onSale = Number(p.sale_price_per_sqft) > 0 && Number(p.sale_price_per_sqft) < Number(p.price_per_sqft);
            const lot = Number(p.lot_boxes_left) || 0;
            return (
              <li key={p.id}>
                <button type="button" onClick={() => onPick(p)} className="flex w-full items-center gap-3 p-2.5 text-left hover:bg-amber-50">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image_url ? p.image_url.split('?')[0] : '/images/product-placeholder.svg'} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{p.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      {p.brand ? `${p.brand} · ` : ''}
                      {Number(p.sqft_per_box)} sqft/box
                    </p>
                    {lot > 0 && <p className="text-[11px] font-semibold text-red-600">Only {lot} {lot === 1 ? 'box' : 'boxes'} left</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-sm font-bold ${onSale ? 'text-red-600' : 'text-slate-900'}`}>{money(price)}</p>
                    <p className="text-[11px] text-slate-500">/sqft{onSale ? ' · sale' : ''}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
        {results.length > shown.length && (
          <p className="border-t border-slate-100 p-2.5 text-center text-xs text-slate-500">Showing first {shown.length} of {results.length} — type to narrow</p>
        )}
      </div>
    </div>
  );
}

// ── One room ────────────────────────────────────────────────────────────────
function RoomCard({ room, calc, index, canRemove, products, productsLoading, productsError, onChange, onRemove, onPick }) {
  const product = calc.product;
  const isStairs = room.kind === 'stairs';

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-label={`Room ${index + 1}`}>
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800">{index + 1}</span>
        <input
          type="text"
          value={room.name}
          onChange={(e) => onChange({ name: e.target.value })}
          aria-label="Room name"
          maxLength={40}
          className="min-w-0 flex-1 rounded-lg border border-transparent px-2 py-1 text-lg font-bold text-slate-900 hover:border-slate-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
        {canRemove && (
          <button type="button" onClick={onRemove} aria-label={`Remove ${room.name}`} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 print:hidden">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {isStairs ? (
        <div className="mt-3">
          <label htmlFor={`treads-${room.id}`} className="mb-1.5 block text-sm font-bold text-slate-900">How many stair treads?</label>
          <input
            id={`treads-${room.id}`}
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            placeholder="e.g. 13"
            value={room.treads}
            onChange={(e) => onChange({ treads: e.target.value })}
            className="h-12 w-40 rounded-xl border-2 border-amber-500 bg-white px-4 text-xl font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-amber-200"
          />
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Stairs are quoted after a free measurement. We&apos;ll include your tread count when you book installation.
          </p>
        </div>
      ) : (
        <>
          {/* Size */}
          <div className="mt-3">
            {room.mode === 'dims' ? (
              <div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-sm font-bold text-slate-900">Room size</label>
                  <button type="button" onClick={() => onChange({ mode: 'direct' })} className="text-xs font-semibold text-amber-700 hover:underline">I know my sq ft →</button>
                </div>
                <div className="mt-1.5 flex items-end gap-3">
                  <div className="min-w-0 flex-1">
                    <label className="mb-1 block text-xs text-slate-500" htmlFor={`len-${room.id}`}>Length (ft)</label>
                    <input id={`len-${room.id}`} type="number" inputMode="decimal" min="1" step="0.5" placeholder="e.g. 20" value={room.length}
                      onChange={(e) => onChange({ length: e.target.value })}
                      className="h-12 w-full rounded-xl border-2 border-amber-300 bg-white px-3 text-base font-semibold focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400" />
                  </div>
                  <span className="pb-3 text-lg font-bold text-slate-400">×</span>
                  <div className="min-w-0 flex-1">
                    <label className="mb-1 block text-xs text-slate-500" htmlFor={`wid-${room.id}`}>Width (ft)</label>
                    <input id={`wid-${room.id}`} type="number" inputMode="decimal" min="1" step="0.5" placeholder="e.g. 15" value={room.width}
                      onChange={(e) => onChange({ width: e.target.value })}
                      className="h-12 w-full rounded-xl border-2 border-amber-300 bg-white px-3 text-base font-semibold focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400" />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor={`sqft-${room.id}`} className="mb-1.5 block text-sm font-bold text-slate-900">How many sq ft is this room?</label>
                <div className="relative">
                  <input id={`sqft-${room.id}`} type="number" inputMode="decimal" min="1" step="1" placeholder="e.g. 250" value={room.sqft}
                    onChange={(e) => onChange({ sqft: e.target.value })}
                    className="h-14 w-full rounded-xl border-2 border-amber-500 bg-white pl-4 pr-16 text-2xl font-bold text-slate-900 placeholder:font-semibold placeholder:text-slate-300 shadow-sm focus:border-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-200" />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold uppercase tracking-wide text-amber-700">sq ft</span>
                </div>
                <button type="button" onClick={() => onChange({ mode: 'dims' })} className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-amber-700 hover:underline">
                  <Ruler className="h-3.5 w-3.5" /> Not sure? Enter room length × width
                </button>
              </div>
            )}
          </div>

          {/* Waste */}
          <div className="mt-3">
            <span className="mb-1.5 block text-xs text-slate-500">Waste allowance</span>
            <div className="flex gap-2" role="group" aria-label="Waste allowance">
              {WASTE_OPTIONS.map((opt) => (
                <button key={opt.value} type="button" onClick={() => onChange({ waste: opt.value })} aria-pressed={room.waste === opt.value} title={opt.desc}
                  className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition-all ${room.waste === opt.value ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>
                  {opt.label}
                  <span className="block text-[10px] font-normal opacity-80">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Product */}
          <div className="mt-4">
            <span className="mb-1.5 block text-sm font-bold text-slate-900">Flooring</span>
            {product && !room.pickerOpen ? (
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.image_url ? product.image_url.split('?')[0] : '/images/product-placeholder.svg'} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{product.name}</p>
                  <p className="truncate text-xs text-slate-500">{product.brand ? `${product.brand} · ` : ''}{money(unitPrice(product))}/sqft · {Number(product.sqft_per_box)} sqft/box</p>
                </div>
                <button type="button" onClick={() => onChange({ pickerOpen: true })} className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-amber-400 print:hidden">Change</button>
              </div>
            ) : (
              <button type="button" onClick={() => onChange({ pickerOpen: !room.pickerOpen })} className="flex w-full items-center justify-between rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                {room.pickerOpen ? 'Choose a floor for this room' : 'Pick a floor'}
                <ChevronDown className={`h-4 w-4 transition-transform ${room.pickerOpen ? 'rotate-180' : ''}`} />
              </button>
            )}
            {room.pickerOpen && <ProductPicker products={products} loading={productsLoading} error={productsError} onPick={onPick} />}
          </div>

          {/* Result */}
          {calc.ready && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-600">Room area</span><span className="font-medium text-slate-800">{calc.sqft.toFixed(0)} sqft</span></div>
              <div className="mt-1 flex justify-between"><span className="text-slate-600">+ {room.waste}% waste</span><span className="font-medium text-slate-800">{calc.neededSqft.toFixed(0)} sqft</span></div>
              <div className="mt-1 flex justify-between"><span className="text-slate-600">Boxes ({Number(product.sqft_per_box)} sqft each)</span><span className="font-bold text-amber-700">{calc.boxes} {calc.boxes === 1 ? 'box' : 'boxes'} · {calc.actualSqft.toFixed(1)} sqft</span></div>
              <div className="mt-1 flex justify-between border-t border-slate-200 pt-1.5"><span className="font-semibold text-slate-700">Flooring</span><span className="font-bold text-slate-900">{money(calc.flooringTotal)}</span></div>
              {calc.clamped && (
                <p className="mt-2 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700">
                  Only {Number(product.lot_boxes_left)} {Number(product.lot_boxes_left) === 1 ? 'box' : 'boxes'} left — covers up to {calc.maxSqft} sqft. Ask us about a second product for the rest.
                </p>
              )}
              {!calc.clamped && Number(product.lot_boxes_left) > 0 && (
                <p className="mt-2 text-xs font-semibold text-red-600">Only {Number(product.lot_boxes_left)} boxes left of this lot.</p>
              )}
            </div>
          )}

          {/* Underlay + shoe */}
          {calc.ready && calc.kit.length > 0 && (
            <div className="mt-3">
              <span className="mb-1.5 block text-sm font-bold text-slate-900">Underlay &amp; trim</span>
              <ul className="space-y-1.5">
                {calc.kit.map(({ line, qty, checked, total }) => (
                  <li key={line.key}>
                    <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-2.5 transition-colors ${checked ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => onChange({ kitOverride: { ...room.kitOverride, [line.key]: e.target.checked } })}
                        className="mt-0.5 h-5 w-5 shrink-0 accent-amber-600"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-800">
                          {line.label}
                          {line.tag === 'REQUIRED' && <span className="ml-1.5 rounded bg-amber-600 px-1.5 py-0.5 align-middle text-[10px] font-bold text-white">REQUIRED</span>}
                        </span>
                        <span className="block text-xs text-slate-500">{qty} × {money(line.price)}{line.pack_size ? ` (${line.pack_size})` : ''}</span>
                      </span>
                      <span className="shrink-0 text-sm font-bold text-slate-900">{money(total)}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}

// ── Totals ──────────────────────────────────────────────────────────────────
function TotalsPanel({ totals, onAddAll, adding, installHref, onInstall, onPrint, onReset }) {
  const hasAny = totals.readyRooms > 0;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-lg font-bold text-slate-900">Your project</h2>
      <dl className="mt-3 space-y-1.5 text-sm">
        <div className="flex justify-between"><dt className="text-slate-600">Rooms</dt><dd className="font-medium text-slate-800">{totals.roomCount}{totals.stairsCount ? ` (${totals.treads ? `${totals.treads} stair treads` : 'stairs'})` : ''}</dd></div>
        <div className="flex justify-between"><dt className="text-slate-600">Total sqft</dt><dd className="font-medium text-slate-800">{Math.round(totals.sqft)} sqft</dd></div>
        <div className="flex justify-between"><dt className="text-slate-600">Boxes</dt><dd className="font-medium text-slate-800">{totals.boxes}</dd></div>
        <div className="flex justify-between"><dt className="text-slate-600">Flooring</dt><dd className="font-medium text-slate-800">{money(totals.flooring)}</dd></div>
        <div className="flex justify-between"><dt className="text-slate-600">Underlay &amp; trim</dt><dd className="font-medium text-slate-800">{money(totals.kit)}</dd></div>
        <div className="flex justify-between border-t border-slate-200 pt-1.5"><dt className="text-slate-600">Subtotal</dt><dd className="font-medium text-slate-800">{money(totals.subtotal)}</dd></div>
        <div className="flex justify-between"><dt className="text-slate-600">HST (13%)</dt><dd className="font-medium text-slate-800">{money(totals.hst)}</dd></div>
        <div className="flex justify-between border-t border-slate-200 pt-2 text-base"><dt className="font-bold text-slate-900">Total</dt><dd className="font-bold text-amber-700">{money(totals.total)}</dd></div>
      </dl>
      <p className="mt-2 text-xs text-slate-500">Delivery or free Markham pickup — set at checkout.</p>

      <div className="mt-4 space-y-2 print:hidden">
        <button type="button" onClick={onAddAll} disabled={adding || !hasAny}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-600 text-base font-bold text-white shadow-sm transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50">
          <ShoppingCart className="h-5 w-5" /> {adding ? 'Adding…' : 'Add everything to cart'}
        </button>
        <Link href={installHref} onClick={onInstall}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-amber-600 bg-white text-base font-bold text-amber-700 transition-colors hover:bg-amber-50">
          <Wrench className="h-5 w-5" /> Get it installed
        </Link>
        <div className="flex gap-2">
          <button type="button" onClick={onPrint} className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Printer className="h-4 w-4" /> Print / save
          </button>
          <button type="button" onClick={onReset} className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <RotateCcw className="h-4 w-4" /> Start over
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page client ─────────────────────────────────────────────────────────────
export default function PlannerClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rooms, setRooms] = useState(() => [newRoom('Living room')]);
  const [hydrated, setHydrated] = useState(false);
  const [adding, setAdding] = useState(false);
  const urlAppliedRef = useRef(false);

  const { data: rawProducts = [], isLoading, error } = useQuery({
    queryKey: ['calculator-products'],
    queryFn: async () => {
      const res = await fetch('/api/products/calculator');
      if (!res.ok) throw new Error(`Products API ${res.status}`);
      return await res.json();
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: 1000,
  });

  // Pickable products: in stock, a real SKU (not a parent shell), has a box size + price.
  const products = useMemo(
    () =>
      (Array.isArray(rawProducts) ? rawProducts : []).filter(
        (p) => p.in_stock !== false && !p.is_parent_product && Number(p.sqft_per_box) > 0 && unitPrice(p) > 0,
      ),
    [rawProducts],
  );
  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  // Restore saved project once.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && Array.isArray(saved.rooms) && saved.rooms.length > 0) {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time localStorage restore (must run client-side after hydration)
          setRooms(saved.rooms.map((r) => ({ ...newRoom(r.name || 'Room'), ...r, id: r.id || uid(), kitOverride: r.kitOverride || {}, pickerOpen: !r.productId && r.kind !== 'stairs' })));
        }
      }
    } catch {
      /* corrupt storage — start fresh */
    }
    setHydrated(true);
    track('planner_view');
  }, []);

  // Honour ?product=<slug>&sqft= once products have loaded.
  useEffect(() => {
    if (!hydrated || urlAppliedRef.current) return;
    const slug = searchParams.get('product');
    const sqftParam = parseFloat(searchParams.get('sqft'));
    if (!slug && !(sqftParam > 0)) {
      urlAppliedRef.current = true;
      return;
    }
    if (slug && products.length === 0) return; // wait for the product list
    urlAppliedRef.current = true;
    const match = slug ? products.find((p) => p.slug === slug) : null;
    const patch = {};
    if (match) {
      patch.productId = match.id;
      patch.pickerOpen = false;
    }
    if (sqftParam > 0) {
      patch.mode = 'direct';
      patch.sqft = String(Math.round(sqftParam));
    }
    if (!Object.keys(patch).length) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time URL param application once products have loaded
    setRooms((prev) => {
      const first = prev[0];
      const firstIsBlank = first && first.kind === 'room' && !first.productId && !(roomRawSqft(first) > 0);
      if (firstIsBlank) return [{ ...first, ...patch }, ...prev.slice(1)];
      return [...prev, newRoom('Room ' + (prev.length + 1), match ? match.id : null, patch)];
    });
  }, [hydrated, products, searchParams]);

  // Auto-save.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, ts: Date.now(), rooms }));
    } catch {
      /* quota / private mode — ignore */
    }
  }, [rooms, hydrated]);

  const calcs = useMemo(() => {
    const cache = new Map();
    return rooms.map((r) => calcRoom(r, r.productId ? productById.get(r.productId) : null, cache));
  }, [rooms, productById]);

  const totals = useMemo(() => {
    let sqft = 0, boxes = 0, flooring = 0, kit = 0, readyRooms = 0, treads = 0, stairsCount = 0;
    calcs.forEach((c, i) => {
      if (rooms[i].kind === 'stairs') {
        stairsCount += 1;
        treads += parseInt(rooms[i].treads, 10) || 0;
        return;
      }
      if (!c.ready) return;
      readyRooms += 1;
      sqft += c.sqft;
      boxes += c.boxes;
      flooring += c.flooringTotal;
      kit += c.kitTotal;
    });
    flooring = round2(flooring);
    kit = round2(kit);
    const subtotal = round2(flooring + kit);
    const hst = round2(subtotal * HST);
    return { roomCount: rooms.length, stairsCount, treads, sqft, boxes, flooring, kit, subtotal, hst, total: round2(subtotal + hst), readyRooms };
  }, [calcs, rooms]);

  // /quote-booking?product=…&sqft=…&estimate=…
  const installHref = useMemo(() => {
    const names = [];
    calcs.forEach((c) => {
      if (c.ready && c.product && !names.includes(c.product.name)) names.push(c.product.name);
    });
    let productStr = names.slice(0, 3).join(', ');
    if (names.length > 3) productStr += ` + ${names.length - 3} more`;
    if (totals.stairsCount > 0) {
      const stairs = totals.treads > 0 ? `stairs (${totals.treads} treads)` : 'stairs';
      productStr = productStr ? `${productStr}; ${stairs}` : stairs;
    }
    const params = new URLSearchParams();
    if (productStr) params.set('product', productStr);
    if (totals.sqft > 0) params.set('sqft', String(Math.round(totals.sqft)));
    if (totals.subtotal > 0) params.set('estimate', String(Math.round(totals.subtotal)));
    const qs = params.toString();
    return '/quote-booking' + (qs ? `?${qs}` : '');
  }, [calcs, totals]);

  const updateRoom = useCallback((id, patch) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const addRoom = useCallback((preset) => {
    setRooms((prev) => {
      const lastWithProduct = [...prev].reverse().find((r) => r.kind === 'room' && r.productId);
      const name = preset || `Room ${prev.length + 1}`;
      return [...prev, newRoom(name, lastWithProduct ? lastWithProduct.productId : null)];
    });
    track('planner_room_add', { meta: { preset: preset || 'custom' } });
  }, []);

  const removeRoom = useCallback((id) => {
    setRooms((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  }, []);

  const pickProduct = useCallback((id, product) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, productId: product.id, pickerOpen: false, kitOverride: {} } : r)));
  }, []);

  const reset = useCallback(() => {
    if (!window.confirm('Clear all rooms and start over?')) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setRooms([newRoom('Living room')]);
  }, []);

  const addAllToCart = useCallback(async () => {
    const ready = [];
    let incomplete = 0;
    rooms.forEach((r, i) => {
      if (r.kind === 'stairs') return;
      if (calcs[i].ready) ready.push({ room: r, calc: calcs[i] });
      else incomplete += 1;
    });
    if (ready.length === 0) {
      toast.error('Pick a floor and enter a size for at least one room first.');
      return;
    }
    if (incomplete > 0) {
      toast.error(`${incomplete} ${incomplete === 1 ? 'room still needs' : 'rooms still need'} a floor and size — finish or remove ${incomplete === 1 ? 'it' : 'them'}.`);
      return;
    }
    setAdding(true);
    try {
      const sessionId = getSessionId();
      const items = [];
      // Flooring: one CartItem per room (same shape ProductDetailClient writes).
      ready.forEach(({ room, calc }) => {
        const p = calc.product;
        items.push(
          entities.CartItem.create({
            session_id: sessionId,
            product_id: p.id,
            product_name: p.name,
            sku: p.sku,
            sqft_needed: round2(calc.neededSqft),
            sqft_per_box: Number(p.sqft_per_box),
            boxes_required: calc.boxes,
            actual_sqft: calc.actualSqft,
            price_per_sqft: calc.price,
            line_total: calc.flooringTotal,
            image_url: p.image_url,
          }),
        );
      });
      // Kit lines: merge identical (product + key) across rooms so the cart stays tidy.
      const merged = new Map();
      ready.forEach(({ calc }) => {
        calc.kit.filter((k) => k.checked).forEach((k) => {
          const mk = `${calc.product.id}|${k.line.key}`;
          const cur = merged.get(mk);
          if (cur) cur.qty += k.qty;
          else merged.set(mk, { line: k.line, qty: k.qty, product: calc.product });
        });
      });
      merged.forEach(({ line, qty, product }) => {
        items.push(entities.CartItem.create(kitLineToCartItem(line, qty, { id: product.id, name: product.name, sku: product.sku }, sessionId)));
      });
      await Promise.all(items);
      window.dispatchEvent(new Event('cartUpdated'));
      track('planner_add_all', { meta: { rooms: ready.length, sqft: Math.round(totals.sqft), total: totals.total } });
      toast.success(`Added ${ready.length} ${ready.length === 1 ? 'room' : 'rooms'} to your cart`);
      router.push('/cart');
    } catch (err) {
      console.error('[planner] add all failed', err);
      toast.error('Something went wrong adding to cart. Please try again.');
      setAdding(false);
    }
  }, [rooms, calcs, totals, router]);

  const onInstall = useCallback(() => {
    track('planner_install_cta', { meta: { rooms: totals.roomCount, sqft: Math.round(totals.sqft), estimate: Math.round(totals.subtotal) } });
  }, [totals]);

  const onPrint = useCallback(() => window.print(), []);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 lg:pb-12">
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {rooms.map((room, i) => (
            <RoomCard
              key={room.id}
              room={room}
              calc={calcs[i]}
              index={i}
              canRemove={rooms.length > 1}
              products={products}
              productsLoading={isLoading}
              productsError={!!error}
              onChange={(patch) => updateRoom(room.id, patch)}
              onRemove={() => removeRoom(room.id)}
              onPick={(p) => pickProduct(room.id, p)}
            />
          ))}

          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 print:hidden">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-900"><Plus className="h-4 w-4 text-amber-600" /> Add another room</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((name) => (
                <button key={name} type="button" onClick={() => addRoom(name)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-amber-400 hover:bg-amber-50">
                  {name}
                </button>
              ))}
              <button type="button" onClick={() => addRoom(null)}
                className="rounded-full border border-amber-300 bg-amber-50 px-3.5 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100">
                Custom room
              </button>
            </div>
          </div>
        </div>

        {/* Desktop: sticky totals */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <TotalsPanel totals={totals} onAddAll={addAllToCart} adding={adding} installHref={installHref} onInstall={onInstall} onPrint={onPrint} onReset={reset} />
          </div>
        </aside>
      </div>

      {/* Mobile: totals inline (for print + review) + sticky bottom bar */}
      <div className="mt-6 lg:hidden">
        <TotalsPanel totals={totals} onAddAll={addAllToCart} adding={adding} installHref={installHref} onInstall={onInstall} onPrint={onPrint} onReset={reset} />
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden print:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-slate-500">{totals.readyRooms} {totals.readyRooms === 1 ? 'room' : 'rooms'} · {Math.round(totals.sqft)} sqft · incl. HST</p>
            <p className="text-lg font-bold leading-tight text-amber-700">{money(totals.total)}</p>
          </div>
          <button type="button" onClick={addAllToCart} disabled={adding || totals.readyRooms === 0}
            className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 text-sm font-bold text-white shadow-sm hover:bg-amber-700 disabled:opacity-50">
            <ShoppingCart className="h-4 w-4" /> {adding ? 'Adding…' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
