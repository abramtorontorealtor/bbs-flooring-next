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

// ── Quantity auto-suggest ──
//  - Rolls: ceil(sqft / roll coverage).
//  - Linear trim (10ft / 7ft sticks): rooms aren't square, so estimate the
//    perimeter as ~4.5×√area (a mild buffer over the 4×√area square-room ideal)
//    then ceil(perimeter / stick length). An estimate, never forced.
//  - Fixed items (T-moulding / reducer): 1 — one doorway is the common case.
export function suggestQty(item, floorSqft) {
  const sqft = parseFloat(floorSqft);
  if (!sqft || sqft <= 0) return 0;
  if (item.unit === 'roll') {
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
  if (item.unit === 'roll') return `sized for ${Math.round(sqft)} sqft`;
  if (!item.length_ft) return 'per doorway';
  return 'est. for your perimeter';
}

// ── Kit line factories ──
function accessoryLine(cat, key, extra = {}) {
  const c = cat[key];
  return {
    kind: 'accessory',
    key: c.key,
    label: c.label,
    price: c.price,
    unit: c.unit,
    coverage_sqft: c.coverage_sqft || null,
    length_ft: c.length_ft || null,
    image: c.image,
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
//   engineered hardwood → shoe moulding · [Mapei glue-down adhesive — pending price approval] · baseboard
//   solid hardwood      → [wax paper — pending price approval] · shoe moulding · baseboard
// PRE-CHECK RULE (mine): only the near-certain items are pre-checked (underpad on
// bare laminate, shoe, T-moulding). Reducer / nosing / baseboard are situational —
// shown, sized, one tap to include, but never silently added to a cart total.
// Returns { lines, note } — `note` is the one-line "why these" the UI shows.
export function buildInstallKit(product) {
  const category = (product?.category || '').toLowerCase();
  const pad = underpadMode(product);
  const lines = [];

  // Shoe moulding is what GTA homeowners actually buy (Abram, Sep 11 2026).
  const shoe = () => accessoryLine(TRIM_CATALOG, 'shoe_d02', {
    sub: '10ft · covers the expansion gap at every wall',
  });
  const baseboard = () => accessoryLine(BASEBOARD_CATALOG, 'bb_b05', {
    sub: '10ft paint-grade MDF · the most common residential profile',
    checked: false,
  });
  const underpadRequired = () => accessoryLine(UNDERPAD_CATALOG, 'underpad_3_black', {
    sub: '200 sqft roll · quieter + built-in moisture barrier (IIC 72)',
    tag: 'REQUIRED',
  });
  const underpadOptional = (why) => accessoryLine(UNDERPAD_CATALOG, 'underpad_3_black', {
    sub: why,
    checked: false,
  });
  const reducer = () => transitionLine('reducer', {
    sub: '8ft · steps down to tile, carpet or concrete',
    checked: false,
  });
  const nosing = () => transitionLine('stair_nosing', {
    sub: '8ft · finishes a stair edge or landing drop-off',
    checked: false,
  });

  if (category === 'laminate') {
    lines.push(pad === 'recommend'
      ? underpadRequired()
      : underpadOptional('This laminate is thick / pre-padded — add only if your subfloor calls for it'));
    lines.push(shoe());
    lines.push(transitionLine('t_moulding'));
    lines.push(reducer());
    return {
      lines,
      note: pad === 'recommend'
        ? 'Floating laminate needs underlay, shoe moulding at the walls and a transition at each doorway.'
        : 'Floating laminate needs shoe moulding at the walls and a transition at each doorway.',
    };
  }

  if (category === 'vinyl') {
    lines.push(shoe());
    lines.push(transitionLine('t_moulding'));
    lines.push(reducer());
    lines.push(pad === 'optional'
      ? underpadOptional('This vinyl has no attached pad — add if your subfloor calls for it')
      : nosing());
    return { lines, note: 'Vinyl needs shoe moulding at the walls and a transition wherever it meets another floor.' };
  }

  if (category === 'engineered_hardwood') {
    lines.push(shoe());
    // TODO(S2): Mapei Ultrabond ECO 983 (Prosol ECO983-15) glue-down adhesive
    // slot goes here once Abram approves retail — unchecked by default, sized
    // by coverage, labelled "for glue-down installs".
    lines.push(baseboard());
    return { lines, note: 'Engineered hardwood is finished at the wall with shoe moulding; new baseboard makes the room read as new.' };
  }

  if (category === 'solid_hardwood' || category === 'hardwood') {
    // TODO(S2): wax paper (Prosol Toolway M30, 750 sqft roll) goes FIRST here
    // once Abram approves retail — pre-checked, sized ceil(sqft / 750).
    lines.push(shoe());
    lines.push(baseboard());
    return { lines, note: 'Nail-down hardwood is finished at the wall with shoe moulding; new baseboard makes the room read as new.' };
  }

  // Unknown / other categories — the universal finish pieces only.
  lines.push(shoe());
  lines.push(baseboard());
  return { lines, note: 'The finish pieces every floor install needs at the wall.' };
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
  const unitDesc = line.unit === 'roll' ? `${line.coverage_sqft} sqft roll` : `${line.length_ft}ft`;
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
