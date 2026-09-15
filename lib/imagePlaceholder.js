/**
 * Shared "is this a real product photo?" check.
 *
 * ~40 in-stock products carry the generic
 * `bbs-image-coming-soon-placeholder.webp` (a camera icon) as `image_url`.
 * It must never occupy a featured / related / top-sort slot — a placeholder in
 * the highest-traffic real estate is a dead click. Grid rows keep showing it
 * (the product is still buyable), only curated slots exclude it.
 */
const PLACEHOLDER_RE = /placeholder|coming-soon|coming_soon/i;

export function isPlaceholderImage(url) {
  if (!url || typeof url !== 'string') return true;
  return PLACEHOLDER_RE.test(url);
}

export function hasRealImage(product) {
  return !isPlaceholderImage(product?.image_url);
}

/** PostgREST pattern for `.not('image_url', 'ilike', PLACEHOLDER_ILIKE)` */
export const PLACEHOLDER_ILIKE = '%placeholder%';
