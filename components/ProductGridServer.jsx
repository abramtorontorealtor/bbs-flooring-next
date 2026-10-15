import CollectionCardStatic from '@/components/CollectionCardStatic';
import { pickScoreKey } from '@/lib/sort-score';
import { groupByCollection } from '@/lib/collection-groups';

/* ── Server-Rendered Product Grid ──
 * Renders the first batch of product cards as real HTML in the server response.
 * This eliminates CLS — the grid DOM is present before any JS runs.
 *
 * The client-side CategoryFilterGrid overlays this with its interactive grid
 * once React hydrates. The server grid is hidden via CSS when the client takes over.
 *
 * Oct 15 2026: one card per brand+collection (CollectionCardStatic) — same
 * grouping as the hydrated grids (lib/collection-groups.js) so SSR == client.
 */

const ITEMS_PER_PAGE = 24;

function filterProducts(products) {
  return products.filter(p => {
    if (!p.image_url || p.is_variant) return false;
    if (p.name && (p.name.toLowerCase().includes('installation') || p.name.toLowerCase().includes('removal'))) return false;
    return true;
  });
}

function sortProducts(products, scoreKey) {
  return [...products].sort((a, b) => (b[scoreKey] || 0) - (a[scoreKey] || 0));
}

export default function ProductGridServer({ products, category, viewMode = 'grid', limit = ITEMS_PER_PAGE }) {
  if (!products || products.length === 0) return null;

  const eligible = filterProducts(products);
  const filtered = sortProducts(eligible, pickScoreKey(eligible, category));
  const visible = groupByCollection(filtered).slice(0, limit);

  return (
    <div
      data-server-grid="true"
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4'
          : 'grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'
      }
    >
      {visible.map((group, index) => (
        <CollectionCardStatic key={group.key} group={group} priority={index < 4} />
      ))}
    </div>
  );
}
