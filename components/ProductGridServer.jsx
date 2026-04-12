import ProductCardStatic from '@/components/ProductCardStatic';

/* ── Server-Rendered Product Grid ──
 * Renders the first batch of product cards as real HTML in the server response.
 * This eliminates CLS — the grid DOM is present before any JS runs.
 *
 * The client-side CategoryFilterGrid overlays this with its interactive grid
 * once React hydrates. The server grid is hidden via CSS when the client takes over.
 */

const ITEMS_PER_PAGE = 24;

function filterProducts(products) {
  return products.filter(p => {
    if (!p.image_url || p.is_variant) return false;
    if (p.name && (p.name.toLowerCase().includes('installation') || p.name.toLowerCase().includes('removal'))) return false;
    return true;
  });
}

function sortProducts(products) {
  return [...products].sort((a, b) => (b.sort_score || 0) - (a.sort_score || 0));
}

export default function ProductGridServer({ products, viewMode = 'grid' }) {
  if (!products || products.length === 0) return null;

  const filtered = sortProducts(filterProducts(products));
  const visible = filtered.slice(0, ITEMS_PER_PAGE);

  return (
    <div
      data-server-grid="true"
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4'
          : 'grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'
      }
    >
      {visible.map((product) => (
        <ProductCardStatic key={product.id} product={product} />
      ))}
    </div>
  );
}
