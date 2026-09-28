/**
 * Brand aliases — manufacturers whose products reach customers under a
 * different consumer brand name. Shoppers search the name printed on the
 * sample board, so the alias must appear on-page (title, brand line, spec
 * table, JSON-LD alternateName) or those queries never reach us.
 *
 * Triforest Inc. (manufacturer, Toronto/Ajax) sells its laminate + SPC vinyl
 * as "Toucan Flooring" (toucanflooring.com: "Toucan Flooring is a market
 * leading brand owned by Triforest Inc."). DB `products.brand` stays
 * "Triforest Flooring" — it is the filter key everywhere — this is display-only.
 */
const BRAND_ALIASES = [
  {
    match: 'triforest',
    name: 'Triforest',
    alias: 'Toucan Flooring',
    aliasShort: 'Toucan',
    label: 'Triforest · Toucan Flooring',
    specValue: 'Triforest (sold as Toucan Flooring)',
    landing: '/triforest-flooring',
  },
];

/** Return the alias record for a raw DB brand string, or null. */
export function getBrandAlias(brand) {
  if (!brand) return null;
  const b = String(brand).toLowerCase();
  return BRAND_ALIASES.find((a) => b.includes(a.match)) || null;
}

/** Brand text for the PDP brand line: "Triforest · Toucan Flooring" or the raw brand. */
export function brandDisplayLabel(brand) {
  const a = getBrandAlias(brand);
  return a ? a.label : brand;
}

/** Brand text for the spec table: "Triforest (sold as Toucan Flooring)" or the raw brand. */
export function brandSpecValue(brand) {
  const a = getBrandAlias(brand);
  return a ? a.specValue : brand;
}

/** schema.org Brand node — adds alternateName when the brand has a consumer alias. */
export function brandSchema(brand, fallback = 'BBS Flooring') {
  const a = getBrandAlias(brand);
  const node = { '@type': 'Brand', name: brand || fallback };
  if (a) node.alternateName = a.alias;
  return node;
}
