// ─────────────────────────────────────────────────────────────────────────────
// SUPPLIES CATALOG — DB-backed loader for the `supplies` table (Supabase).
//
// WHY (S2, Sep 12 2026 — memory/ACCESSORY-ATTACH-PLAN.md "SUPPLIES ARCHITECTURE"):
// lib/accessoryCatalog.js hardcodes prices in JS, which doesn't scale past the
// original 21 Toucan SKUs + 2 hand-added Prosol SKUs. The `supplies` table (S1,
// 50 rows: 21 Toucan + 29 Prosol, all `retail_approved=true` as of Sep 12) is now
// the source of truth for price + catalog metadata. This file is the ONLY place
// that reads that table.
//
// SERVER-ONLY. Do not import from a 'use client' component — fetch server-side
// (page.jsx / API route) and pass the result down as a prop, same pattern as
// every other Supabase server read in this repo (lib/products-server.js).
//
// TRUST MODEL: this module is imported by app/api/orders/create/route.js for
// BILLING. A DB hiccup must never zero out a bill or blank a page — every
// exported read function catches and falls back to the static catalog in
// lib/accessoryCatalog.js (today's live prices), logging a warning so it's
// visible in Vercel logs without taking the site down.
// ─────────────────────────────────────────────────────────────────────────────

import { unstable_cache } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabase';
import {
  UNDERPAD_CATALOG,
  TRIM_CATALOG,
  BASEBOARD_CATALOG,
  TRANSITION_CATALOG,
  SUPPLIES_CATALOG,
  priceAccessoryLine,
} from '@/lib/accessoryCatalog';

const SELECT_COLUMNS =
  'code,supplier,brand,name,description,supplier_desc,category,floor_types,uom,' +
  'pack_size,coverage_sqft,length_ft,retail,upc,image_url,attach_default,sort_order,min_qty';

// Legacy alias: the first 2 Prosol SKUs shipped (Sep 11, commit 5392a04) with
// hand-picked catalog keys that don't match their Prosol/DB `code` — preserve
// those exact keys so already-placed cart/order rows and lib/installKit.js's
// existing SUPPLIES_CATALOG.prosol_eco983 / .prosol_wax_paper references keep
// resolving unchanged. Every OTHER row (all 21 Toucan + the other 27 Prosol
// rows) uses `code` as the key directly — the S1 seed already matches Toucan
// `code` to the existing catalog keys 1:1 (bb_b01, shoe_d02, underpad_3_black,
// t_moulding, ...), so no mapping is needed for those.
const CODE_TO_KEY = {
  'ECO983-15': 'prosol_eco983',
  M30: 'prosol_wax_paper',
};

function normalizeRow(row) {
  const key = CODE_TO_KEY[row.code] || row.code;
  const price = row.retail != null ? Number(row.retail) : null;
  return {
    key,
    code: row.code,
    supplier: row.supplier,
    brand: row.brand || null,
    label: row.name,
    category: row.category,
    floor_types: row.floor_types || [],
    unit: row.uom,
    pack_size: row.pack_size || null,
    coverage_sqft: row.coverage_sqft != null ? Number(row.coverage_sqft) : null,
    length_ft: row.length_ft != null ? Number(row.length_ft) : null,
    price,
    minQty: row.min_qty || 1,
    upc: row.upc || null,
    image: row.image_url || null,
    attach_default: !!row.attach_default,
    blurb: row.description || row.supplier_desc || null,
    sortOrder: row.sort_order ?? 100,
    // Preserve the existing "BEST VALUE" badge on the 3mm black underpad —
    // it isn't a DB column, it's a UI convention from the original catalog.
    recommended: key === 'underpad_3_black',
  };
}

function groupByCategory(items) {
  const byCategory = {};
  for (const item of items) {
    if (!byCategory[item.category]) byCategory[item.category] = [];
    byCategory[item.category].push(item);
  }
  for (const cat of Object.keys(byCategory)) {
    byCategory[cat].sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
  }
  return byCategory;
}

async function fetchFromDb() {
  const supabase = getSupabaseServerClient();
  if (!supabase) throw new Error('supplies: no Supabase client (missing env vars)');
  const { data, error } = await supabase
    .from('supplies')
    .select(SELECT_COLUMNS)
    .eq('active', true)
    .eq('discontinued', false)
    .eq('retail_approved', true)
    .not('retail', 'is', null)
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true });
  if (error) throw new Error(`supplies query failed: ${error.message}`);
  if (!data || data.length === 0) throw new Error('supplies query returned 0 rows');
  return data.map(normalizeRow);
}

// ── Static fallback — reshapes today's hardcoded catalog into the same item
// shape, so every consumer (page render, install kit, billing) can treat DB
// and fallback data identically. Only ever used when the DB call throws. ──
function buildFallbackItems() {
  const items = [];
  const push = (obj, category, supplier, extra = {}) => {
    for (const [key, v] of Object.entries(obj)) {
      items.push({
        key,
        code: key,
        supplier,
        brand: null,
        label: v.label,
        category,
        floor_types: [],
        unit: v.unit,
        pack_size: v.pack_size || null,
        coverage_sqft: v.coverage_sqft || null,
        length_ft: v.length_ft || null,
        price: v.price,
        minQty: 1,
        upc: null,
        image: v.image || null,
        attach_default: false,
        blurb: v.blurb || null,
        sortOrder: 100,
        recommended: !!v.recommended,
        ...extra,
      });
    }
  };
  push(UNDERPAD_CATALOG, 'underlay', 'toucan');
  push(TRIM_CATALOG, 'trim', 'toucan');
  push(BASEBOARD_CATALOG, 'baseboard', 'toucan');
  // TRANSITION_CATALOG entries don't carry `label`/`image` the same way —
  // they use `size` instead of pack_size/length_ft. Normalize inline.
  for (const [key, t] of Object.entries(TRANSITION_CATALOG)) {
    items.push({
      key, code: key, supplier: 'toucan', brand: null, label: t.label,
      category: 'transition', floor_types: ['laminate', 'vinyl'], unit: t.unit,
      pack_size: t.size, coverage_sqft: null, length_ft: null, price: t.price,
      minQty: 1, upc: null, image: null, attach_default: key === 't_moulding',
      blurb: null, sortOrder: 100, recommended: false,
    });
  }
  push(SUPPLIES_CATALOG, 'adhesive', 'prosol'); // approximate category; fallback-only path
  return items;
}

let warnedFallback = false;
async function loadSuppliesUncached() {
  try {
    const items = await fetchFromDb();
    return { items, byKey: Object.fromEntries(items.map((i) => [i.key, i])), byCategory: groupByCategory(items), source: 'db' };
  } catch (err) {
    if (!warnedFallback) {
      console.warn('[suppliesCatalog] DB load failed, using static fallback catalog:', err?.message || err);
      warnedFallback = true;
    }
    const items = buildFallbackItems();
    return { items, byKey: Object.fromEntries(items.map((i) => [i.key, i])), byCategory: groupByCategory(items), source: 'fallback' };
  }
}

// Cached ~10 min per Next.js data cache. Falls back to an uncached fresh call
// if unstable_cache itself throws (e.g. called outside a request context).
const cachedLoad = unstable_cache(loadSuppliesUncached, ['supplies-catalog-v1'], {
  revalidate: 600,
  tags: ['supplies'],
});

export async function getSuppliesCatalog() {
  try {
    return await cachedLoad();
  } catch (err) {
    console.warn('[suppliesCatalog] unstable_cache failed, loading uncached:', err?.message || err);
    return loadSuppliesUncached();
  }
}

// ── Server-trusted price resolver (billing) ──
// Tries the legacy synchronous resolver FIRST (unchanged behavior for the 21
// Toucan keys, transitions, and the 2 legacy Prosol keys — zero risk to
// existing orders/cart payloads already in flight). Falls through to the live
// DB catalog for every other Prosol SKU. Returns null if truly unknown (the
// caller then falls back to the product×sqft path, same as before).
export async function priceSupplyLine(item, catalog) {
  const legacy = priceAccessoryLine(item);
  if (legacy != null) return legacy;
  if (!item) return null;

  const type = item.item_type;
  if (type !== 'accessory' && !(!type && !item.product_id && typeof item.sku === 'string')) return null;

  const key = item.accessory_key || item.sku || item.transition_type;
  if (!key) return null;
  const cat = catalog || (await getSuppliesCatalog());
  const supply = cat.byKey[key];
  if (!supply || supply.price == null) return null;

  let qty = Math.max(0, parseInt(item.quantity ?? item.transition_quantity ?? 0, 10) || 0);
  if (!qty && item.line_total > 0) qty = Math.max(1, Math.round(item.line_total / supply.price));
  if (!qty) return null;
  return Math.round(supply.price * qty * 100) / 100;
}
