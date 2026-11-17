// Pure (no React) accessory/supply search helpers, shared by the header
// search bar (components/AdvancedSearchBar.jsx) and the grid empty-state
// fallback (components/SupplySearchFallback.jsx). Rows come from
// /api/supplies/search (the `supplies` table, one family per row).

export const TYPO_OVERRIDES = {
  'laminate': /lam[ia]nate/i,
  'limanate': /lam[ia]nate/i,
  'vinyl': /v[iy]n[iy]l/i,
  'vynil': /v[iy]n[iy]l/i,
  'hardwood': /hard\s*wood/i,
  'hardwod': /hard\s*wood/i,
  'engineerd': /engineer/i,
  'engieered': /engineer/i,
  'engineered': /engineer/i,
  'hickery': /hickory/i,
  'hickory': /hickory/i,
  'wallnut': /walnut/i,
  'walnut': /walnut/i,
};

// Accessory vocabulary: shoppers say "glue", the catalogue says "adhesive".
// Only applied when scoring supplies so flooring scoring is unchanged.
export const ACCESSORY_TERM_RX = {
  'underlay': /underlay|underpad|underlayment|acoustic/i,
  'underlayment': /underlay|underpad|underlayment/i,
  'underpad': /underlay|underpad|underlayment/i,
  'pad': /underlay|underpad|underlayment|pad/i,
  'glue': /glue|adhesive/i,
  'adhesive': /glue|adhesive/i,
  'vent': /vent|register/i,
  'vents': /vent|register/i,
  'register': /vent|register/i,
  'registers': /vent|register/i,
  'trim': /trim|moulding|molding|quarter|shoe/i,
  'molding': /moulding|molding/i,
  'moulding': /moulding|molding/i,
  'quarter': /quarter|shoe/i,
  'baseboard': /baseboard/i,
  'baseboards': /baseboard/i,
  'transition': /transition|t-mould|t-mold|reducer|threshold|stair\s*nos/i,
  'transitions': /transition|t-mould|t-mold|reducer|threshold/i,
  'reducer': /reducer|transition/i,
  'threshold': /threshold|transition/i,
  'nosing': /nosing|stair/i,
  'leveler': /level|self-lev|patch/i,
  'leveller': /level|self-lev|patch/i,
  'levelling': /level|self-lev/i,
  'leveling': /level|self-lev/i,
  'primer': /primer/i,
  'vapor': /vapou?r|moisture|barrier/i,
  'vapour': /vapou?r|moisture|barrier/i,
  'moisture': /moisture|vapou?r|barrier/i,
  'barrier': /barrier|moisture|vapou?r/i,
  'spacer': /spacer/i,
  'spacers': /spacer/i,
  'tool': /tool|tapping|pull\s*bar|trowel|knee|kit/i,
  'tools': /tool|tapping|pull\s*bar|trowel|knee|kit/i,
  'cleaner': /clean/i,
  'cleaning': /clean/i,
  'nail': /nail|cleat|staple|fastener/i,
  'nails': /nail|cleat|staple|fastener/i,
  'cleats': /cleat|nail|fastener/i,
  'staples': /staple|fastener/i,
  'screws': /screw|fastener/i,
  'accessory': /./,
  'accessories': /./,
  'supplies': /./,
};

export const SUPPLY_CATEGORY_LABELS = {
  underlay: 'Underlay',
  stair: 'Stair Treads & Posts',
  fasteners: 'Fasteners',
  repair: 'Repair & Touch-Up',
  cleaner: 'Floor Care',
  protection: 'Surface Protection',
  moisture_barrier: 'Moisture Barrier',
  adhesive: 'Adhesive',
  primer: 'Primer',
  subfloor_prep: 'Subfloor Prep',
  trim: 'Shoe Moulding & Quarter Round',
  baseboard: 'Baseboard',
  floor_vent: 'Floor Vent',
  tools: 'Installer Tool',
  transition: 'Transition',
};

export function buildFuzzyRegex(term) {
  if (TYPO_OVERRIDES[term.toLowerCase()]) return TYPO_OVERRIDES[term.toLowerCase()];
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escaped, 'i');
}

export function scoreSupply(supply, terms) {
  let totalScore = 0;
  let termsMatched = 0;
  for (const term of terms) {
    const rx = ACCESSORY_TERM_RX[term] || buildFuzzyRegex(term);
    let s = 0;
    if (rx.test(supply._name)) s += 100;
    if (rx.test(supply._brand)) s += 70;
    if (rx.test(supply._category)) s += 60;
    if (rx.test(supply._members)) s += 45;
    // Blurb / floor-type hits only BOOST a real match — on their own they
    // would drag an underlay into an "oak" search because its copy says oak.
    if (s > 0) {
      if (rx.test(supply._blurb)) s += 20;
      if (rx.test(supply._floorTypes)) s += 10;
      termsMatched++; totalScore += s;
    }
  }
  if (termsMatched === 0) return 0;
  return termsMatched === terms.length ? totalScore * 10 : totalScore * (termsMatched / terms.length);
}

// Raw /api/supplies/search row -> index row with lowercase search fields.
export function normalizeSupplyRow(s) {
  var catLabel = SUPPLY_CATEGORY_LABELS[s.category] || (s.category || '').replace(/_/g, ' ');
  return {
    id: 'supply:' + s.slug,
    slug: s.slug,
    name: s.name,
    brand: s.brand || '',
    image_url: s.image || null,
    category: s.category || '',
    categoryLabel: catLabel,
    priceLow: s.priceLow,
    priceHigh: s.priceHigh,
    unit: s.unit || '',
    isMulti: !!s.isMulti,
    optionCount: s.optionCount || 1,
    kind: 'supply',
    _name: (s.name || '').toLowerCase(),
    _brand: (s.brand || '').toLowerCase(),
    _category: ((s.category || '') + ' ' + catLabel).toLowerCase(),
    _members: (s.members || '').toLowerCase(),
    _blurb: (s.blurb || '').toLowerCase(),
    _floorTypes: (s.floorTypes || []).join(' ').toLowerCase(),
  };
}

// rows: normalized supply rows (see normalizeSupplyRow). Terms are the raw
// whitespace-split query (no flooring synonym expansion), de-duplicated.
export function searchSupplies(rows, query, limit = 3) {
  const q = (query || '').toLowerCase().trim();
  if (!q || !rows || rows.length === 0) return [];
  const terms = Array.from(new Set(q.split(/\s+/)));
  return rows
    .map((s) => Object.assign({}, s, { score: scoreSupply(s, terms) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Browser-side loader with a module-level cache (shared by the grid fallback
// and the toolbar Enter handler). Never throws; resolves [] on any failure.
let supplyIndexPromise = null;
export function loadSupplyIndex() {
  if (!supplyIndexPromise) {
    supplyIndexPromise = fetch('/api/supplies/search')
      .then((res) => (res.ok ? res.json() : []))
      .then((rows) => (Array.isArray(rows)
        ? rows.filter((s) => s.slug && s.name).map(normalizeSupplyRow)
        : []))
      .catch(() => [])
      .then((rows) => {
        if (rows.length === 0) supplyIndexPromise = null; // retry next time
        return rows;
      });
  }
  return supplyIndexPromise;
}

// Top accessory slug for a query (or null). Used by the toolbar Enter key.
export async function topSupplySlug(query) {
  const hits = searchSupplies(await loadSupplyIndex(), query, 1);
  return hits.length ? hits[0].slug : null;
}
