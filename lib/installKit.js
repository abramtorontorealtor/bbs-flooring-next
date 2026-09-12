// ─────────────────────────────────────────────────────────────────────────────
// INSTALL KIT — pure helpers shared by the PDP Install Kit, AccessoryBox and any
// future supplies surface. NO 'use client' — safe to import server-side.
//
// Pricing ALWAYS comes from lib/accessoryCatalog.js (the server bills against
// it). This file only decides WHICH items a given floor needs and HOW MANY.
//
// Sep 11 2026 (S1 of the Prosol supplies program, memory/ACCESSORY-ATTACH-PLAN.md):
// the full AccessoryBox sat ~1000px down the PDP and most buyers never reached
// it. The kit is the compact, opinionated answer to "what else do I need?" —
// max 4 items, chosen by floor type, sized from the sqft already typed into the
// buy box, added in one tap. Everything else stays reachable behind
// "Browse all accessories".
// ─────────────────────────────────────────────────────────────────────────────

import {
  UNDERPAD_CATALOG,
  TRIM_CATALOG,
  BASEBOARD_CATALOG,
  TRANSITION_CATALOG,
  SUPPLIES_CATALOG,
} from '@/lib/accessoryCatalog';

const IMG_BASE = 'https://qxeatxgzhfhccbaxtphq.supabase.co/storage/v1/object/public/flooring-accessories';

// ── Underpad recommendation (Abram, Aug 13) ──
// Vinyl: virtually all is pre-padded → don't recommend (pad-on-pad is wrong).
// Laminate: needs pad EXCEPT 14mm (thick enough) or any SKU whose spec string
//   says it already carries IXPE / attached pad.
// → 'recommend' (floor needs it, show expanded) · 'optional' (customer may know
//   better — collapsed) · 'hidden' (never for this floor).
export function underpadMode(product) {
  const category = (product?.category || '').toLowerCase();
  const hay = `${product?.thickness || ''} ${product?.specifications || ''} ${product?.product_details || ''}`.toLowerCase();
  const hasAttachedPad = /ixpe|attached|pre-?attached|underpad|underlay|pad/.test(hay);

  if (category === 'laminate') {
    const is14 = /\b14\s*mm/.test(hay) || /\b14mm/.test((product?.thickness || '').toLowerCase());
    if (is14 || hasAttachedPad) return 'optional';
    return 'recommend';
  }
  if (category === 'vinyl') {
    return hasAttachedPad ? 'hidden' : 'optional';
  }
  return 'hidden';
}

// ── Install method detection (S2, Sep 12 2026) ──
// Vinyl is sold both as floating (click-lock, the majority) and full-spread
// glue-down (commercial-weight SPC, some LVT). A glue-down floor doesn't take
// underpad at all — it needs adhesive instead. There's no dedicated DB column
// for this (checked: no `installation_method` on products), so — same pattern
// as underpadMode above — read it off the spec text. Conservative: only fires
// on an explicit "glue down / glue-down / full spread" mention, never guessed.
export function installMethod(product) {
  const hay = `${product?.specifications || ''} ${product?.product_details || ''} ${product?.name || ''} ${product?.subcategory || ''}`.toLowerCase();
  if (/glue[\s-]?down|full[\s-]?spread|direct[\s-]?glue/.test(hay)) return 'glue-down';
  if (/click|floating|loose[\s-]?lay|drop[\s-]?lock/.test(hay)) return 'floating';
  return 'unknown';
}

// ── Quantity auto-suggest ──
//  - Rolls: ceil(sqft / roll coverage).
//  - Linear trim (10ft / 7ft sticks): rooms aren't square, so estimate the
//    perimeter as ~4.5×√area (a mild buffer over the 4×√area square-room ideal)
//    then ceil(perimeter / stick length). An estimate, never forced.
//  - Fixed items (T-moulding / reducer): 1 — one doorway is the common case.
export function suggestQty(item, floorSqft) {
  const sqft = parseFloat(floorSqft);
  if (!sqft || sqft <= 0) return 0;
  if (item.coverage_sqft || item.unit === 'roll') {
    const cov = item.coverage_sqft || 200;
    return Math.max(1, Math.ceil(sqft / cov));
  }
  if (!item.length_ft) return 1; // transitions & other fixed pieces
  const perimeterFt = 4.5 * Math.sqrt(sqft);
  return Math.max(1, Math.ceil(perimeterFt / item.length_ft));
}

// Human label for how a qty was sized — shown under the stepper so the number
// never looks arbitrary ("2 rolls for 340 sqft", "~8 pieces for your perimeter").
export function sizingHint(item, floorSqft) {
  const sqft = parseFloat(floorSqft);
  if (!sqft || sqft <= 0) return null;
  if (item.coverage_sqft || item.unit === 'roll') return `sized for ${Math.round(sqft)} sqft`;
  if (!item.length_ft) return 'per doorway';
  return 'est. for your perimeter';
}

// ── Kit line factories ──
// `resolveItem` prefers the live DB-backed supplies catalog (S2) when it has
// the key, falling back to the static catalog in lib/accessoryCatalog.js when
// the caller doesn't pass one (defensive — keeps this file usable standalone)
// or when the key genuinely isn't in the DB yet. Both shapes carry the same
// fields (label/price/unit/coverage_sqft/length_ft/pack_size/image/blurb), so
// callers below never need to know which source won.
function resolveItem(suppliesCatalog, staticCat, key) {
  return (suppliesCatalog && suppliesCatalog.byKey && suppliesCatalog.byKey[key]) || staticCat[key];
}

function accessoryLine(cat, key, extra = {}, suppliesCatalog = null) {
  const c = resolveItem(suppliesCatalog, cat, key);
  if (!c) return null;
  return {
    kind: 'accessory',
    key: c.key || key,
    label: c.label,
    price: c.price,
    unit: c.unit,
    coverage_sqft: c.coverage_sqft || null,
    length_ft: c.length_ft || null,
    pack_size: c.pack_size || null,
    image: c.image || null,
    sub: extra.sub || c.blurb,
    checked: extra.checked !== false,
    tag: extra.tag || null,
  };
}

function transitionLine(key, extra = {}) {
  const t = TRANSITION_CATALOG[key];
  return {
    kind: 'transition',
    key,
    label: t.label,
    price: t.price,
    unit: t.unit,
    coverage_sqft: null,
    length_ft: null, // fixed qty (per doorway), not perimeter-sized
    size: t.size,
    // Only t-moulding.webp exists in the bucket today; reducer/stair nosing
    // render an icon placeholder in the UI until photos are uploaded.
    image: key === 't_moulding' ? `${IMG_BASE}/t-moulding.webp` : null,
    sub: extra.sub || `${t.size} · doorways & room-to-room transitions`,
    checked: extra.checked !== false,
    tag: extra.tag || null,
  };
}

// ── The kit itself: ≤4 lines per floor type. CONTENTS ARE ABRAM'S SPEC (Sep 11 2026):
//   laminate            → underpad · shoe moulding · T-moulding · reducer
//   vinyl               → shoe moulding · T-moulding · reducer · stair nosing
//                         (bare vinyl with no attached pad: underpad replaces nosing)
//   engineered hardwood → shoe moulding · Mapei ECO 983 glue-down adhesive (Prosol) · baseboard
//   solid hardwood      → wax paper (Prosol) · shoe moulding · baseboard
// PRE-CHECK RULE (mine): only the near-certain items are pre-checked (underpad on
// bare laminate, shoe, T-moulding). Reducer / nosing / baseboard are situational —
// shown, sized, one tap to include, but never silently added to a cart total.
// Returns { lines, note } — `note` is the one-line "why these" the UI shows.
// `suppliesCatalog` (S2, Sep 12 2026) is the pre-fetched result of
// lib/suppliesCatalog.getSuppliesCatalog() — pass it from a server component
// (it's already cached there); omitting it falls back to the static catalog
// only (today's behavior, minus the DB-only Prosol SKUs).
export function buildInstallKit(product, suppliesCatalog = null) {
  const category = (product?.category || '').toLowerCase();
  const pad = underpadMode(product);
  const method = installMethod(product);
  const lines = [];

  // Shoe moulding is what GTA homeowners actually buy (Abram, Sep 11 2026).
  const shoe = () => accessoryLine(TRIM_CATALOG, 'shoe_d02', {
    sub: '10ft · covers the expansion gap at every wall',
  }, suppliesCatalog);
  const baseboard = () => accessoryLine(BASEBOARD_CATALOG, 'bb_b05', {
    sub: '10ft paint-grade MDF · the most common residential profile',
    checked: false,
  }, suppliesCatalog);
  const underpadRequired = () => accessoryLine(UNDERPAD_CATALOG, 'underpad_3_black', {
    sub: '200 sqft roll · quieter + built-in moisture barrier (IIC 72)',
    tag: 'REQUIRED',
  }, suppliesCatalog);
  const underpadOptional = (why) => accessoryLine(UNDERPAD_CATALOG, 'underpad_3_black', {
    sub: why,
    checked: false,
  }, suppliesCatalog);
  const reducer = () => transitionLine('reducer', {
    sub: '8ft · steps down to tile, carpet or concrete',
    checked: false,
  });
  const nosing = () => transitionLine('stair_nosing', {
    sub: '8ft · finishes a stair edge or landing drop-off',
    checked: false,
  });
  // Henry 630 PeachPro — glue-down vinyl adhesive (Prosol, DB code AR630-04).
  // Only offered when the plank spec text explicitly says glue-down/full-spread
  // (installMethod()); a floating click-lock floor has no use for it, and we'd
  // rather show nothing than the wrong supply. Falls out of the kit entirely
  // (not just unchecked) if the DB row isn't there — never a broken line.
  const glueDownAdhesive = () => accessoryLine({}, 'AR630-04', {
    sub: 'Full-spread glue-down vinyl adhesive · 1 gal covers ~150 sqft',
    checked: false,
  }, suppliesCatalog);

  if (category === 'laminate') {
    lines.push(pad === 'recommend'
      ? underpadRequired()
      : underpadOptional('This laminate is thick / pre-padded — add only if your subfloor calls for it'));
    lines.push(shoe());
    lines.push(transitionLine('t_moulding'));
    lines.push(reducer());
    return {
      lines: lines.filter(Boolean),
      note: pad === 'recommend'
        ? 'Floating laminate needs underlay, shoe moulding at the walls and a transition at each doorway.'
        : 'Floating laminate needs shoe moulding at the walls and a transition at each doorway.',
    };
  }

  if (category === 'vinyl') {
    lines.push(shoe());
    lines.push(transitionLine('t_moulding'));
    lines.push(reducer());
    if (method === 'glue-down') {
      // Full-spread vinyl doesn't take underpad at all — swap that slot for
      // the adhesive it actually needs (S2, per floor_types/attach_default
      // slotting spec in memory/ACCESSORY-ATTACH-PLAN.md).
      const glue = glueDownAdhesive();
      lines.push(glue || nosing());
    } else {
      lines.push(pad === 'optional'
        ? underpadOptional('This vinyl has no attached pad — add if your subfloor calls for it')
        : nosing());
    }
    return {
      lines: lines.filter(Boolean),
      note: method === 'glue-down'
        ? 'This is a full-spread glue-down vinyl — it needs adhesive, shoe moulding at the walls and a transition wherever it meets another floor.'
        : 'Vinyl needs shoe moulding at the walls and a transition wherever it meets another floor.',
    };
  }

  if (category === 'engineered_hardwood') {
    lines.push(shoe());
    // Unchecked by default: 370/550 engineered SKUs say "glue OR nail" — we can't
    // tell a glue-down from a float, so the customer opts in. Sized by coverage.
    lines.push(accessoryLine(SUPPLIES_CATALOG, 'prosol_eco983', {
      sub: 'For glue-down installs · 15 L pail covers ~160 sqft',
      checked: false,
    }, suppliesCatalog));
    lines.push(baseboard());
    return { lines: lines.filter(Boolean), note: 'Engineered hardwood is finished at the wall with shoe moulding; new baseboard makes the room read as new.' };
  }

  if (category === 'solid_hardwood' || category === 'hardwood') {
    lines.push(accessoryLine(SUPPLIES_CATALOG, 'prosol_wax_paper', {
      sub: 'Goes under every nail-down floor · 750 sqft roll',
      tag: 'REQUIRED',
    }, suppliesCatalog));
    lines.push(shoe());
    lines.push(baseboard());
    return { lines: lines.filter(Boolean), note: 'Nail-down hardwood goes over wax paper and is finished at the wall with shoe moulding.' };
  }

  // Unknown / other categories — the universal finish pieces only.
  lines.push(shoe());
  lines.push(baseboard());
  return { lines: lines.filter(Boolean), note: 'The finish pieces every floor install needs at the wall.' };
}

// Cart payload for one kit line. Mirrors EXACTLY the shapes AccessoryBox.jsx
// (accessory) and TransitionPieces.jsx (transition) already write, so the cart
// render, qty stepper and the server's priceAccessoryLine() resolver all work
// unchanged. Do not invent new columns here.
export function kitLineToCartItem(line, qty, product, sessionId) {
  const q = Math.max(1, parseInt(qty, 10) || 1);
  const parentId = product?.product_id || product?.id || null;
  const parentName = product?.product_name || product?.name || null;
  const lineTotal = Math.round(line.price * q * 100) / 100;

  if (line.kind === 'transition') {
    return {
      session_id: sessionId,
      item_type: 'transition',
      transition_type: line.key,
      transition_quantity: q,
      parent_product_id: parentId,
      parent_product_name: parentName,
      product_name: `${line.label} (${line.size || '8ft'}) — Matches ${parentName}`,
      sku: `TRANS-${line.key.toUpperCase()}-${product?.sku || product?.id || 'KIT'}`,
      line_total: lineTotal,
    };
  }
  const unitDesc = line.pack_size
    ? line.pack_size
    : line.unit === 'roll' ? `${line.coverage_sqft} sqft roll` : `${line.length_ft}ft`;
  return {
    session_id: sessionId,
    item_type: 'accessory',
    transition_type: line.key, // reused column: holds the accessory key
    sku: line.key,
    quantity: q,
    transition_quantity: q, // mirror so the shared cart qty stepper works
    product_name: `${line.label} (${unitDesc})`,
    parent_product_id: parentId,
    parent_product_name: parentName,
    image_url: line.image,
    line_total: lineTotal,
  };
}
