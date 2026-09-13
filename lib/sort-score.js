/**
 * Showroom ranking helpers (client-safe, no server imports).
 *
 * `products.sort_score`     — per-category order (category pages)
 * `products.sort_score_all` — all-products order (All Flooring / brand pages)
 * Both recomputed by scripts/showroom-sort.py.
 */

/**
 * Pick the ranking column for a product set.
 * Per-category `sort_score` when scoped to one category (explicit `category`, or the
 * set only contains one category, e.g. a brand page filtered to vinyl); global
 * `sort_score_all` when the set spans categories.
 *
 * @param {Array} products
 * @param {string} [category] - explicit category scope, if any
 * @returns {'sort_score'|'sort_score_all'}
 */
export function pickScoreKey(products, category) {
  if (category) return 'sort_score';
  const cats = new Set();
  for (const p of products || []) {
    cats.add(p.category);
    if (cats.size > 1) return 'sort_score_all';
  }
  return 'sort_score';
}
