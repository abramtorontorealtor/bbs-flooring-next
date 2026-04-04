/**
 * Centralized breadcrumb configuration for BBS Flooring.
 *
 * Hierarchy-based (location-based) breadcrumbs — the ecommerce standard.
 * Every parent link must land on a real, navigable page.
 * JSON-LD BreadcrumbList schema is injected by the Breadcrumbs component.
 *
 * Product detail: Home > Category > Brand (if brand has a page) > Product Name
 * Blog post:      Home > Blog > Post Title
 * Location:       Home > Flooring in [City]
 * Static pages:   Home > Page Name
 */

// ── Brand name (from DB) → landing page ──────────────────────────────────────
export const BRAND_PAGES = {
  'Vidar Design Flooring': { label: 'Vidar Flooring', url: '/vidar-flooring' },
  'Wickham Hardwood Flooring': { label: 'Wickham Flooring', url: '/wickham-flooring' },
};

// ── Category slug (from DB) → category page ──────────────────────────────────
export const CATEGORY_PAGES = {
  solid_hardwood: { label: 'Solid Hardwood', url: '/solid-hardwood' },
  engineered_hardwood: { label: 'Engineered Hardwood', url: '/engineered-hardwood' },
  laminate: { label: 'Laminate', url: '/laminate' },
  vinyl: { label: 'Vinyl', url: '/vinyl' },
};

// ── Static breadcrumb trails ─────────────────────────────────────────────────
// Key = pathname. Last item has no url (rendered as current page).
const HOME = { label: 'Home', url: '/' };

export const STATIC_BREADCRUMBS = {
  // Category pages
  '/solid-hardwood':       [HOME, { label: 'Solid Hardwood' }],
  '/engineered-hardwood':  [HOME, { label: 'Engineered Hardwood' }],
  '/vinyl':                [HOME, { label: 'Vinyl Flooring' }],
  '/laminate':             [HOME, { label: 'Laminate Flooring' }],
  '/waterproof-flooring':  [HOME, { label: 'Waterproof Flooring' }],
  '/basement-flooring':    [HOME, { label: 'Basement Flooring' }],
  '/white-oak-flooring':   [HOME, { label: 'White Oak Flooring' }],
  '/products':             [HOME, { label: 'All Products' }],
  '/clearance':            [HOME, { label: 'Clearance' }],
  '/flooring-clearance-sale': [HOME, { label: 'Clearance Sale' }],

  // Brand pages
  '/vidar-flooring':       [HOME, { label: 'Vidar Flooring' }],
  '/wickham-flooring':     [HOME, { label: 'Wickham Flooring' }],
  '/contractor-flooring':  [HOME, { label: 'Contractor Flooring' }],

  // Service pages
  '/installation':              [HOME, { label: 'Flooring Installation' }],
  '/stairs':                    [HOME, { label: 'Stair Renovation' }],
  '/stair-refinishing':         [HOME, { label: 'Stair Refinishing' }],
  '/hardwood-refinishing':      [HOME, { label: 'Hardwood Refinishing' }],
  '/carpet-removal':            [HOME, { label: 'Carpet Removal' }],
  '/carpet-to-hardwood-stairs': [HOME, { label: 'Carpet to Hardwood Stairs' }],
  '/free-measurement':          [HOME, { label: 'Free Measurement' }],
  '/flooring-installation-cost':[HOME, { label: 'Installation Cost Calculator' }],

  // Info pages
  '/about':                     [HOME, { label: 'About Us' }],
  '/contact':                   [HOME, { label: 'Contact' }],
  '/flooring-showroom-markham': [HOME, { label: 'Showroom' }],
  '/financing':                 [HOME, { label: 'Financing' }],
  '/grade-guide':               [HOME, { label: 'Grade Guide' }],
  '/quote-calculator':          [HOME, { label: 'Quote Calculator' }],
  '/room-visualizer':           [HOME, { label: 'Room Visualizer' }],
  '/compare':                   [HOME, { label: 'Compare Products' }],
  '/gallery':                   [HOME, { label: 'Gallery' }],
  '/blog':                      [HOME, { label: 'Blog' }],

  // Transactional
  '/cart':                      [HOME, { label: 'Cart' }],
  '/checkout':                  [HOME, { label: 'Checkout' }],
  '/quote-booking':             [HOME, { label: 'Book a Quote' }],
  '/view-booking':              [HOME, { label: 'View Booking' }],

  // Legal
  '/privacy-policy':            [HOME, { label: 'Privacy Policy' }],
  '/terms-of-service':          [HOME, { label: 'Terms of Service' }],
  '/return-policy':             [HOME, { label: 'Return Policy' }],
};

/**
 * Get breadcrumb items for a static page by pathname.
 * Returns null if no breadcrumbs defined (home, auth, admin).
 */
export function getStaticBreadcrumbs(pathname) {
  return STATIC_BREADCRUMBS[pathname] || null;
}

/**
 * Build breadcrumb items for a product detail page.
 * Home > Category > Brand (if brand has a landing page) > Product Name
 */
export function getProductBreadcrumbs(product) {
  if (!product) return [];
  const items = [HOME];

  const cat = CATEGORY_PAGES[product.category];
  if (cat) items.push({ label: cat.label, url: cat.url });

  if (product.brand && BRAND_PAGES[product.brand]) {
    const brand = BRAND_PAGES[product.brand];
    items.push({ label: brand.label, url: brand.url });
  }

  items.push({ label: product.name });
  return items;
}

/**
 * Build breadcrumb items for a blog post.
 * Home > Blog > Post Title
 */
export function getBlogPostBreadcrumbs(title) {
  return [HOME, { label: 'Blog', url: '/blog' }, { label: title }];
}

/**
 * Build breadcrumb items for a gallery project.
 * Home > Gallery > Project Name
 */
export function getGalleryProjectBreadcrumbs(title) {
  return [HOME, { label: 'Gallery', url: '/gallery' }, { label: title }];
}

/**
 * Build breadcrumb items for a location page.
 * Home > Flooring in [City]
 */
export function getLocationBreadcrumbs(cityName) {
  return [HOME, { label: `Flooring in ${cityName}` }];
}
