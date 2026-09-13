// ─────────────────────────────────────────────────────────────────────────────
// SUPPLY FAMILIES — variant grouping for the `supplies` catalogue (S5, Sep 12 2026).
//
// WHY: one product page per FAMILY (Henry 630 = 1 gal + 4 gal, Fittes Lite vent
// = 8 size/colour combos), not one thin page per SKU. The family URL is the
// canonical that accumulates authority; every member is its own `Offer` in the
// Product JSON-LD (AggregateOffer low/high) and its own Merchant Center row
// sharing item_group_id. See memory/NEXT-SESSION-HANDOFF.md (S5 block) and
// the Sep 12 Abram sign-off on the "one page per family" pattern.
//
// PURE MODULE — no server imports, safe to import from client components
// (SupplyFamilyBuyBox needs STOCK_TIERS + familyUrl).
//
// Family copy (name / blurb / why / picker label) lives in
// data/supplyFamilies.json — written once by the Sonnet copy pass
// (scripts/templates/supply-family-copy-2026-09-12.py in the workspace), never
// hand-typed here. Missing entry → derived fallback (common label prefix).
//
// HARD RULE: the supplier is NEVER named on the site. Nothing in this file or
// the copy JSON may say who we buy from — "ships from our supplier's Ontario
// warehouse" is the most specific allowed.
// ─────────────────────────────────────────────────────────────────────────────

import FAMILY_COPY from '@/data/supplyFamilies.json';

// stock_tier → buyer-facing availability. Never hide on stock: everything is
// orderable, the badge just sets the expectation. Lead times are the default
// supplier transfer windows (Abram to confirm before first activation).
export const STOCK_TIERS = {
  showroom: {
    label: 'In stock at our Markham showroom',
    short: 'Markham pickup',
    tone: 'emerald',
    schema: 'https://schema.org/InStock',
    handlingDays: [0, 1],
  },
  gta: {
    label: 'Ready for Markham pickup next business day',
    short: 'Next-day pickup',
    tone: 'emerald',
    schema: 'https://schema.org/InStock',
    handlingDays: [1, 1],
  },
  ontario: {
    label: 'Order-in from our supplier\u2019s Ontario warehouse \u2014 usually 2\u20134 business days',
    short: '2\u20134 business days',
    tone: 'amber',
    schema: 'https://schema.org/InStock',
    handlingDays: [2, 4],
  },
  canada: {
    label: 'Order-in \u2014 usually 1\u20132 weeks',
    short: '1\u20132 weeks',
    tone: 'amber',
    schema: 'https://schema.org/InStock',
    handlingDays: [5, 10],
  },
  none: {
    label: 'Special order \u2014 call or message us for the current lead time',
    short: 'Special order',
    tone: 'slate',
    schema: 'https://schema.org/BackOrder',
    handlingDays: [5, 15],
  },
};

export function stockInfo(tier) {
  return STOCK_TIERS[tier] || STOCK_TIERS.none;
}

export function familyUrl(family, item = null) {
  const base = `/flooring-accessories/${family.slug}`;
  if (!item || !family.isMulti || item.code === family.primary.code) return base;
  return `${base}?v=${encodeURIComponent(item.code)}`;
}

// Longest common prefix of member labels, cut back to a word boundary and
// stripped of trailing separators — the fallback family name when the copy
// pass hasn't written one yet.
function commonLabelPrefix(labels) {
  if (labels.length === 0) return '';
  let prefix = labels[0];
  for (const l of labels.slice(1)) {
    let i = 0;
    while (i < prefix.length && i < l.length && prefix[i] === l[i]) i++;
    prefix = prefix.slice(0, i);
  }
  prefix = prefix.replace(/[\s\-–—(:,/]+$/u, '');
  const lastSpace = prefix.lastIndexOf(' ');
  if (lastSpace > 0 && prefix.length < labels[0].length) prefix = prefix.slice(0, lastSpace);
  return prefix.replace(/[\s\-–—(:,/]+$/u, '').trim();
}

const PICKER_BY_CATEGORY = {
  floor_vent: 'Size & finish',
  repair: 'Colour',
  cleaner: 'Format',
  transition: 'Finish',
  stair: 'Size',
  baseboard: 'Profile',
  fasteners: 'Type',
};

/**
 * Group normalized supply items (lib/suppliesCatalog.normalizeRow shape) into
 * families. Input is already filtered to live/approved rows, so a family only
 * contains members that are actually for sale — a hidden member never leaks.
 */
export function buildFamilies(items) {
  const bySlug = new Map();
  for (const item of items) {
    const slug = item.group || item.code;
    if (!bySlug.has(slug)) bySlug.set(slug, []);
    bySlug.get(slug).push(item);
  }

  const families = [];
  for (const [slug, members] of bySlug) {
    members.sort((a, b) => a.variantOrder - b.variantOrder || (a.price ?? 0) - (b.price ?? 0));
    const copy = FAMILY_COPY[slug] || {};
    const isMulti = members.length > 1;
    const primary = members.find((m) => m.attach_default) || members[0];
    const prices = members.map((m) => m.price).filter((p) => p != null);
    const floorTypes = [...new Set(members.flatMap((m) => m.floor_types || []))];
    const fallbackName = isMulti ? commonLabelPrefix(members.map((m) => m.label)) : primary.label;
    const name = copy.name || (fallbackName.length >= 8 ? fallbackName : primary.label);
    families.push({
      slug,
      name,
      blurb: copy.blurb || (isMulti ? null : primary.blurb) || null,
      why: copy.why || null,
      picker: copy.picker || PICKER_BY_CATEGORY[primary.category] || 'Size',
      category: primary.category,
      brand: primary.brand || null,
      items: members,
      primary,
      isMulti,
      priceLow: prices.length ? Math.min(...prices) : null,
      priceHigh: prices.length ? Math.max(...prices) : null,
      image: primary.image || members.find((m) => m.image)?.image || null,
      floor_types: floorTypes,
      recommended: members.some((m) => m.recommended),
      sortOrder: Math.min(...members.map((m) => m.sortOrder ?? 100)),
      // Best availability across members — the hub badge shows the fastest
      // tier; the picker shows each member's own.
      bestTier: ['showroom', 'gta', 'ontario', 'canada', 'none'].find((t) => members.some((m) => (m.stockTier || 'none') === t)) || 'none',
    });
  }
  families.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  return families;
}

// Card-sized projection for client grids (SuppliesShopClient): the hub/category
// pages must not ship every member row to the browser — 380 rows × 20 fields
// is a megabyte of RSC payload. Keep exactly what a card renders + what the
// ItemList schema needs (offerCount, primary code/upc/price).
export function slimFamily(f) {
  const p = f.primary;
  return {
    slug: f.slug,
    name: f.name,
    brand: f.brand,
    blurb: f.blurb,
    picker: f.picker,
    category: f.category,
    image: f.image,
    isMulti: f.isMulti,
    priceLow: f.priceLow,
    priceHigh: f.priceHigh,
    bestTier: f.bestTier,
    recommended: f.recommended,
    sortOrder: f.sortOrder,
    optionCount: f.items.length,
    offerCount: f.items.filter((i) => i.price != null).length,
    primary: {
      key: p.key, code: p.code, label: p.label, unit: p.unit, pack_size: p.pack_size,
      coverage_sqft: p.coverage_sqft, length_ft: p.length_ft, price: p.price, image: p.image,
      category: p.category, upc: p.upc, stockTier: p.stockTier,
    },
  };
}

export function familiesByCategory(families) {
  const out = {};
  for (const f of families) {
    if (!out[f.category]) out[f.category] = [];
    out[f.category].push(f);
  }
  return out;
}

// "Shop by your floor" — ONE pro's pick per slot. Ordered candidates: the first
// slug that exists in the live catalogue wins, so a slot survives a family
// being paused and the stairs slot upgrades to treads the day those families
// go live. `why` is written PER CANDIDATE: it is the floor-specific reason for
// THIS pick (the family's generic `why` from the copy JSON is only a fallback),
// so a fallback candidate never inherits the rationale written for the one
// above it (stair nosing must not carry the tread pitch).
const WHY_HENRY_630 = 'Pressure-sensitive or wet-set, the one adhesive that covers a normal plywood or primed concrete subfloor without guesswork.';
const WHY_CLICK_TRANSITION = 'Most click vinyl ships with the pad already attached. What you actually need is a transition at every doorway, not a second underlay.';
const WHY_ECO_983 = 'Moisture-control wood adhesive rated for concrete slabs. The failure point on glue-down wood floors is the wrong glue, not the plank.';
const WHY_WAX_PAPER = 'Wax paper goes down first on every nail-down install. Fewer squeaks, and it stops subfloor moisture wicking into the boards.';

export const PRO_PICK_SLOTS = [
  {
    id: 'glue-down-vinyl',
    title: 'Glue-down vinyl',
    floorUrl: '/vinyl',
    candidates: [
      { slug: 'henry-630', why: WHY_HENRY_630 },
      { slug: 'AR630-04', why: WHY_HENRY_630 },
      { slug: 'henry-695', why: 'The step-up vinyl adhesive for high-humidity concrete slabs where a standard glue would let go.' },
    ],
  },
  {
    id: 'click-vinyl',
    title: 'Click vinyl (SPC / LVP)',
    floorUrl: '/vinyl',
    candidates: [
      { slug: 't_moulding', why: WHY_CLICK_TRANSITION },
      { slug: 'mdpro-alu-reducer', why: WHY_CLICK_TRANSITION },
    ],
  },
  {
    id: 'laminate',
    title: 'Laminate',
    floorUrl: '/laminate',
    candidates: [
      { slug: 'underpad_3_black', why: 'IIC 72 / STC 73 with a built-in moisture barrier. Clears most GTA condo sound rules and works over concrete.' },
      { slug: 'underpad_5_airflow', why: 'The thicker airflow pad for basements and over concrete where you want cushion plus moisture protection.' },
    ],
  },
  {
    id: 'basement',
    title: 'Basement / concrete slab',
    floorUrl: '/laminate',
    candidates: [
      { slug: 'DMX1-STEP2', why: 'The dimpled air-gap pad that lifts a floating floor off the slab so moisture evaporates instead of soaking in. Vapour barrier, thermal break and sound control in one roll.' },
      { slug: 'underpad_5_airflow', why: 'Dimpled air-gap pad for concrete and below-grade subfloors: lets the slab breathe, lifts the floor off surface moisture, IIC 72.' },
    ],
  },
  {
    id: 'engineered',
    title: 'Engineered hardwood (glue-down)',
    floorUrl: '/engineered-hardwood',
    candidates: [
      { slug: 'mapei-eco-983', why: WHY_ECO_983 },
      { slug: 'ECO983-15', why: WHY_ECO_983 },
      { slug: 'roberts-moisture-barricade', why: 'Roll-out moisture barrier for engineered floors over concrete, the layer that keeps slab moisture out of the plank.' },
    ],
  },
  {
    id: 'solid-hardwood',
    title: 'Solid hardwood (nail-down)',
    floorUrl: '/solid-hardwood',
    candidates: [
      { slug: 'toolway-wax-paper', why: WHY_WAX_PAPER },
      { slug: 'M30', why: WHY_WAX_PAPER },
    ],
  },
  {
    id: 'stairs',
    title: 'Stairs',
    floorUrl: '/stairs',
    candidates: [
      { slug: 'fusion-tread-red-oak-square', why: 'Unfinished red oak box treads you can stain to match the floor. The honest fix for builder-grade carpeted stairs.' },
      { slug: 'mdpro-alu-stair-nose', why: 'Aluminum stair nosing that caps the tread edge when you run laminate or vinyl down a staircase.' },
      { slug: 'stair_nosing', why: 'Caps and finishes the leading edge of every tread when you run laminate or vinyl down the stairs. One piece per step.' },
    ],
  },
];

export function resolveProPicks(catalog) {
  const out = [];
  for (const slot of PRO_PICK_SLOTS) {
    let hit = null;
    for (const c of slot.candidates) {
      const family = catalog.familyBySlug[c.slug] || catalog.familyByCode[c.slug];
      if (family) { hit = { family, why: c.why || family.why || null }; break; }
    }
    if (!hit) continue;
    const { candidates, ...rest } = slot;
    out.push({ ...rest, family: hit.family, why: hit.why });
  }
  return out;
}
