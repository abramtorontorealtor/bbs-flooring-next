// ─────────────────────────────────────────────────────────────────────────────
// SUPPLY CALCULATOR — pure recommendation logic for the standalone
// /flooring-accessories/calculator page (S3, Sep 12 2026).
//
// Pairs a floor type + subfloor + sqft with the exact supplies catalog rows
// (by `key`, matching lib/suppliesCatalog.getSuppliesCatalog().byKey) already
// used elsewhere in the codebase (Install Kit, hub page) — no new pricing or
// coverage numbers invented here, every quantity comes from suggestQty()
// against the DB's real coverage_sqft.
// ─────────────────────────────────────────────────────────────────────────────

import { suggestQty, sizingHint } from '@/lib/installKit';

export const FLOOR_TYPE_OPTIONS = [
  { value: 'laminate', label: 'Laminate (floating)' },
  { value: 'vinyl_floating', label: 'Vinyl / SPC (floating click-lock)' },
  { value: 'vinyl_gluedown', label: 'Vinyl / SPC (glue-down)' },
  { value: 'engineered_floating', label: 'Engineered hardwood (floating)' },
  { value: 'engineered_gluedown', label: 'Engineered hardwood (glue-down)' },
  { value: 'solid_nailed', label: 'Solid hardwood (nail-down)' },
];

export const SUBFLOOR_OPTIONS = [
  { value: 'plywood', label: 'Plywood / wood subfloor' },
  { value: 'concrete', label: 'Concrete slab' },
];

function line(byKey, key, sqft, meta) {
  const item = byKey[key];
  if (!item) return null;
  const qty = suggestQty(item, sqft);
  if (!qty) return null;
  return { key, item, qty, hint: sizingHint(item, sqft), ...meta };
}

// Returns { lines: [{key,item,qty,required,note,hint}], headline }
export function recommendSupplyKit({ floorType, subfloor, sqft }, catalog) {
  const sq = parseFloat(sqft) || 0;
  const byKey = catalog?.byKey || {};
  const lines = [];
  const add = (key, meta) => {
    const l = line(byKey, key, sq, meta);
    if (l) lines.push(l);
  };
  let headline = '';

  if (floorType === 'laminate') {
    if (subfloor === 'concrete') {
      add('underpad_5_airflow', { required: true, note: 'Moisture protection + soundproofing under laminate over concrete' });
      headline = 'Laminate over concrete needs a moisture-blocking underlay. No separate adhesive or primer required.';
    } else {
      add('underpad_3_black', { required: true, note: 'Cushioning + sound insulation under floating laminate' });
      headline = 'Laminate over a wood subfloor needs underlay. No separate adhesive or primer required.';
    }
  } else if (floorType === 'vinyl_floating') {
    if (subfloor === 'concrete') {
      add('Q70115', { required: false, note: 'Optional — only if your vinyl has no pad attached and you want extra moisture protection' });
    }
    headline = 'Most floating vinyl (SPC/LVP) already has a pad attached to the back — no underlay needed unless your plank spec says otherwise.';
  } else if (floorType === 'vinyl_gluedown') {
    if (subfloor === 'concrete') {
      add('ARP4-04', { required: false, note: 'Prime bare/porous concrete first for a stronger bond' });
      add('ARH695-04', { required: true, note: 'High-RH adhesive for glue-down vinyl over a concrete slab' });
      headline = 'Glue-down vinyl over concrete: prime bare concrete first, then use a high-RH adhesive.';
    } else {
      add('AR630-04', { required: true, note: 'Standard glue-down vinyl adhesive' });
      headline = 'Glue-down vinyl over a wood subfloor: one adhesive, no primer needed.';
    }
  } else if (floorType === 'engineered_floating') {
    if (subfloor === 'concrete') {
      add('Q70115', { required: true, note: 'Moisture barrier under floating engineered hardwood over concrete' });
      headline = 'Floating engineered hardwood over concrete needs a moisture barrier underneath.';
    } else {
      add('underpad_2_5_white', { required: false, note: 'Optional cushioning layer if your plank has no attached pad' });
      headline = 'Floating engineered hardwood over a wood subfloor rarely needs anything extra — check your plank spec.';
    }
  } else if (floorType === 'engineered_gluedown') {
    if (subfloor === 'concrete') {
      add('ARP4-04', { required: false, note: 'Prime bare/porous concrete first for a stronger bond' });
    }
    add('prosol_eco983', { required: true, note: 'Moisture-control wood adhesive for glue-down engineered hardwood' });
    headline = subfloor === 'concrete'
      ? 'Glue-down engineered hardwood over concrete: prime first, then this moisture-control adhesive.'
      : 'Glue-down engineered hardwood: one moisture-control adhesive.';
  } else if (floorType === 'solid_nailed') {
    add('prosol_wax_paper', { required: true, note: 'Rosin/wax paper goes under every nail-down solid hardwood install' });
    headline = 'Nail-down solid hardwood needs wax paper underneath. No adhesive or primer required.';
  }

  const total = lines.reduce((sum, l) => sum + (l.required !== false ? l.item.price * l.qty : 0), 0);
  return { lines, headline, total };
}
