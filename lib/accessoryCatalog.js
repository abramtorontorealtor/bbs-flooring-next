// ─────────────────────────────────────────────────────────────────────────────
// ACCESSORY CATALOG — single source of truth for accessory + transition pricing.
//
// WHY THIS FILE EXISTS (the money-trust rail):
// The orders/create route re-prices every line SERVER-SIDE from the products
// table (product_id × sqft). Accessories & transition pieces have NO products
// row, so before this catalog they silently re-priced to $0 — customers were
// billed nothing for trim/underpad/transitions. This file is imported by BOTH
// the client component (for display) AND the server route (for trusted billing),
// so the price a customer sees is the price the server charges. Never trust a
// client-sent line_total for these — always re-derive from this catalog.
//
// PRICING RULES (locked by Abram, Aug 13 2026):
//  - Baseboards: sold per full piece. retail = Toucan dealer cost × 1.25.
//  - Quarter round + doorstops (shoe): sold per full piece. retail = $0.65/lft × piece length.
//  - Underpad: sold per full roll. retail = per-sqft rate × roll coverage.
//  - Transitions (already live): flat per piece.
// Everything is a FLAT per-piece / per-roll number. No per-ft math shown to the
// customer, no length toggles, no auto-sqft calc. Sold in full units like boxes.
// ─────────────────────────────────────────────────────────────────────────────

const IMG_BASE = 'https://qxeatxgzhfhccbaxtphq.supabase.co/storage/v1/object/public/flooring-accessories';

// ── Transition pieces (already live; catalog-ized here so the server bills them
//    correctly too — they were also billing $0 before this catalog). ──
export const TRANSITION_CATALOG = {
  t_moulding:   { label: 'T-Moulding',   price: 25, unit: 'piece', size: '8ft' },
  reducer:      { label: 'Reducer',      price: 25, unit: 'piece', size: '8ft' },
  stair_nosing: { label: 'Stair Nosing', price: 30, unit: 'piece', size: '8ft' },
};

// ── Underpad — sold per full roll (retail = coverage sqft × per-sqft rate) ──
export const UNDERPAD_CATALOG = {
  underpad_2_5_white: {
    key: 'underpad_2_5_white', label: '2.5mm White Foam Underpad',
    price: 50.0, unit: 'roll', coverage_sqft: 200,
    image: `${IMG_BASE}/underpad-2-5-white.webp`,
    blurb: 'Standard laminate underlay. 200 sqft roll · IIC 52 / STC 66.',
  },
  underpad_3_black: {
    key: 'underpad_3_black', label: '3mm Black Acoustic Underpad',
    price: 70.0, unit: 'roll', coverage_sqft: 200,
    image: `${IMG_BASE}/underpad-3-black.webp`,
    blurb: 'Quieter — great for condos & upper floors. 200 sqft roll · IIC 72 / STC 73.',
  },
  underpad_5_airflow: {
    key: 'underpad_5_airflow', label: '5mm Airflow Bubble Underpad',
    price: 100.0, unit: 'roll', coverage_sqft: 100,
    image: `${IMG_BASE}/underpad-5-airflow.webp`,
    blurb: 'Moisture air-gap for concrete/basement subfloors. 100 sqft roll · IIC 72 / STC 73.',
  },
};

// ── Quarter round + doorstops (shoe) — sold per full piece.
//    retail = round( $0.65/lft × length_ft, 2 ). ──
export const TRIM_CATALOG = {
  qr_d09: {
    key: 'qr_d09', label: 'Quarter Round', price: 6.50, unit: 'piece',
    length_ft: 10, image: `${IMG_BASE}/quarter-round-D09.png`,
    blurb: '5/8" × 5/8" × 10ft. Finishes the floor-to-baseboard gap.',
  },
  shoe_d01: { key: 'shoe_d01', label: 'Doorstop 1¼" (7ft)',       price: 4.55, unit: 'piece', length_ft: 7,  image: `${IMG_BASE}/doorstop-D01.webp`, blurb: '1/2" × 1¼" × 7ft.' },
  shoe_d02: { key: 'shoe_d02', label: 'Doorstop 1¼" (10ft)',      price: 6.50, unit: 'piece', length_ft: 10, image: `${IMG_BASE}/doorstop-D02.webp`, blurb: '1/2" × 1¼" × 10ft.' },
  shoe_d03: { key: 'shoe_d03', label: 'Doorstop 1¾" (10ft)',      price: 6.50, unit: 'piece', length_ft: 10, image: `${IMG_BASE}/doorstop-D03.webp`, blurb: '1/2" × 1¾" × 10ft.' },
  shoe_d04: { key: 'shoe_d04', label: 'Bevel Doorstop 1⅜" (10ft)',price: 6.50, unit: 'piece', length_ft: 10, image: `${IMG_BASE}/doorstop-D04.webp`, blurb: '3/8" × 1⅜" × 10ft.' },
  shoe_d05: { key: 'shoe_d05', label: 'Bevel Doorstop 1¾" (10ft)',price: 6.50, unit: 'piece', length_ft: 10, image: `${IMG_BASE}/doorstop-D05.webp`, blurb: '3/8" × 1¾" × 10ft.' },
  shoe_d06: { key: 'shoe_d06', label: 'Flat Doorstop 1¼" (10ft)', price: 6.50, unit: 'piece', length_ft: 10, image: `${IMG_BASE}/doorstop-D06.webp`, blurb: '3/8" × 1¼" × 10ft.' },
};

// ── Baseboards — sold per full piece. retail = dealer cost × 1.25. ──
export const BASEBOARD_CATALOG = {
  bb_b01: { key: 'bb_b01', label: 'Two-Step Baseboard 7"',  price: 10.00, unit: 'piece', length_ft: 10, image: `${IMG_BASE}/baseboard-B01.png`,  blurb: '5/8" × 7¼" × 10ft.' },
  bb_b02: { key: 'bb_b02', label: 'Two-Step Baseboard 5"',  price: 6.25,  unit: 'piece', length_ft: 10, image: `${IMG_BASE}/baseboard-B02.webp`, blurb: '1/2" × 5¼" × 10ft.' },
  bb_b03: { key: 'bb_b03', label: 'Bevel Step Baseboard 7"',price: 10.00, unit: 'piece', length_ft: 10, image: `${IMG_BASE}/baseboard-B03.webp`, blurb: '5/8" × 7¼" × 10ft.' },
  bb_b04: { key: 'bb_b04', label: 'Bevel Step Baseboard 5"',price: 8.13,  unit: 'piece', length_ft: 10, image: `${IMG_BASE}/baseboard-B04.webp`, blurb: '5/8" × 5¼" × 10ft.' },
  bb_b05: { key: 'bb_b05', label: 'Colonial Baseboard 5"',  price: 6.88,  unit: 'piece', length_ft: 10, image: `${IMG_BASE}/baseboard-B05.webp`, blurb: '1/2" × 5½" × 10ft.' },
  bb_b06: { key: 'bb_b06', label: 'Colonial Baseboard 4"',  price: 6.25,  unit: 'piece', length_ft: 10, image: `${IMG_BASE}/baseboard-B06.webp`, blurb: '1/2" × 4" × 10ft.' },
  bb_b07: { key: 'bb_b07', label: 'Flat Stock Baseboard 5"',price: 8.13,  unit: 'piece', length_ft: 10, image: `${IMG_BASE}/baseboard-B07.webp`, blurb: '5/8" × 5¼" × 10ft.' },
  bb_b08: { key: 'bb_b08', label: 'Flat Stock Baseboard 7"',price: 10.00, unit: 'piece', length_ft: 10, image: `${IMG_BASE}/baseboard-B08.webp`, blurb: '5/8" × 7¼" × 10ft.' },
};

// Flat lookup of every accessory key → { price, unit, label } for the server.
export const ACCESSORY_CATALOG = {
  ...UNDERPAD_CATALOG,
  ...TRIM_CATALOG,
  ...BASEBOARD_CATALOG,
};

// ── Server-side trusted price resolver ──
// Returns the line total for an accessory/transition cart line, priced from this
// catalog × its quantity. Returns null if the line isn't a known accessory/
// transition (caller then falls back to the product×sqft path).
export function priceAccessoryLine(item) {
  if (!item) return null;
  const type = item.item_type;

  // Transition pieces: keyed by transition_type, qty in transition_quantity.
  if (type === 'transition') {
    const t = TRANSITION_CATALOG[item.transition_type];
    if (!t) return null;
    const qty = Math.max(0, parseInt(item.transition_quantity ?? item.quantity ?? 0, 10) || 0);
    return Math.round(t.price * qty * 100) / 100;
  }

  // Accessories: keyed by accessory_key (stored in sku or transition_type),
  // qty in quantity (or transition_quantity as a fallback).
  if (type === 'accessory') {
    const key = item.accessory_key || item.sku || item.transition_type;
    const a = ACCESSORY_CATALOG[key];
    if (!a) return null;
    const qty = Math.max(0, parseInt(item.quantity ?? item.transition_quantity ?? 0, 10) || 0);
    return Math.round(a.price * qty * 100) / 100;
  }

  return null;
}
