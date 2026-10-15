/**
 * Collection grouping — shared by /clearance, /products, category + brand grids
 * and the SSR grid. Pure, server-safe (no React, no hooks).
 *
 * Collapse an already-filtered + sorted list of colours into one group per
 * brand+collection, preserving sorted order (group position = its first
 * colour's position; hero = that first colour, i.e. the top sort_score colour
 * under Recommended). Rows without a collection stand alone.
 *
 * Group AFTER filters so a colour filter ("grey") leaves each card showing only
 * the matching colours and the hero becomes the first matching colour.
 */

export function getProductPrice(product) {
  return parseFloat(product.sale_price_per_sqft || product.price_per_sqft || 0);
}

export function getDiscountPct(product) {
  const reg = parseFloat(product.price_per_sqft || 0);
  const sale = parseFloat(product.sale_price_per_sqft || 0);
  if (reg > 0 && sale > 0 && sale < reg) return Math.round(((reg - sale) / reg) * 100);
  return 0;
}

export function collectionKey(p) {
  const brand = (p.brand || '').trim().toLowerCase();
  const coll = (p.collection || '').trim().toLowerCase();
  // Variant parents (Vidar: one parent per COLOUR, variants = width/grade) group by
  // collection like everything else — 'American White Oak' is 20 colour-parents = 1 card.
  if (!coll) return `single||${p.id || p.slug}`;
  return `${brand}||${coll}`;
}

export function groupByCollection(products) {
  const map = new Map();
  const order = [];
  for (const p of products || []) {
    const key = collectionKey(p);
    let g = map.get(key);
    if (!g) {
      g = { key, hero: p, colours: [] };
      map.set(key, g);
      order.push(key);
    }
    g.colours.push(p);
  }
  return order.map((key) => {
    const g = map.get(key);
    const discounts = g.colours.map(getDiscountPct);
    const maxDiscountPct = Math.max(0, ...discounts);
    return {
      ...g,
      count: g.colours.length,
      minPrice: Math.min(...g.colours.map(getProductPrice)),
      maxDiscountPct,
      discountsVary: new Set(discounts).size > 1,
    };
  });
}
