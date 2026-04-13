/**
 * Route mapping: Base44 page names → Next.js paths
 * Used by createPageUrl() to maintain compatibility with ported components.
 * 
 * Base44 uses page names as routes (e.g., /Vinyl, /SolidHardwood).
 * Next.js uses clean lowercase-hyphenated paths.
 */

const ROUTE_MAP = {
  Home: '/',
  Products: '/products',
  ProductDetail: '/products', // needs ?slug= → /products/[slug]
  EngineeredHardwood: '/engineered-hardwood',
  SolidHardwood: '/solid-hardwood',
  Vinyl: '/vinyl',
  Laminate: '/laminate',
  WaterproofFlooring: '/waterproof-flooring',
  WhiteOakFlooring: '/white-oak-flooring',
  BasementFlooring: '/basement-flooring',
  VidarFlooring: '/vidar-flooring',
  WickhamFlooring: '/wickham-flooring',
  NafFlooring: '/naf-flooring',
  NorthernestFlooring: '/northernest-flooring',
  WodenFlooring: '/woden-flooring',
  FalconFlooring: '/falcon-flooring',
  CanadianStandardFlooring: '/canadian-standard-flooring',
  TriforestFlooring: '/triforest-flooring',
  SimbaFlooring: '/simba-flooring',
  LeeFlooring: '/lee-flooring',
  ToscaFlooring: '/tosca-flooring',
  AppalachianFlooring: '/appalachian-flooring',
  EvergreenFlooring: '/evergreen-flooring',
  SherwoodFlooring: '/sherwood-flooring',
  GoldenChoiceFlooring: '/golden-choice-flooring',
  ContractorFlooring: '/contractor-flooring',
  Clearance: '/clearance',
  FlooringClearanceSale: '/flooring-clearance-sale',
  Compare: '/compare',
  Stairs: '/stairs',
  StairRefinishing: '/stair-refinishing',
  Installation: '/installation',
  HardwoodRefinishing: '/hardwood-refinishing',
  CarpetRemoval: '/carpet-removal',
  HardwoodRemoval: '/hardwood-removal',
  TileRemoval: '/tile-removal',
  VinylLaminateRemoval: '/vinyl-laminate-removal',
  CarpetToHardwoodStairs: '/carpet-to-hardwood-stairs',
  FreeMeasurement: '/free-measurement',
  FlooringInstallationCost: '/flooring-installation-cost',
  FlooringShowroomMarkham: '/flooring-showroom-markham',
  QuoteCalculator: '/quote-calculator',
  RoomVisualizer: '/room-visualizer',
  Financing: '/financing',
  About: '/about',
  Contact: '/contact',
  Gallery: '/gallery',
  ProjectDetail: '/gallery', // needs ?id= → /gallery/[id]
  GradeGuide: '/grade-guide',
  EngineeredHardwoodGuide: '/engineered-hardwood-guide',
  FlooringComparisonGuide: '/flooring-comparison-guide',
  FlooringCostGuide: '/flooring-cost-toronto-2026',
  BasementFlooringGuide: '/basement-flooring-guide',
  VinylFlooringGuide: '/vinyl-flooring-guide',
  StairRenovationGuide: '/stair-renovation-guide',
  SolidHardwoodGuide: '/solid-hardwood-guide',
  LaminateFlooringGuide: '/laminate-flooring-guide',
  Blog: '/blog',
  BlogPost: '/blog', // needs ?slug= → /blog/[slug]
  Location: '/flooring-in', // needs ?city= → /flooring-in-[city]
  Cart: '/cart',
  Checkout: '/checkout',
  QuoteBooking: '/quote-booking',
  ViewBooking: '/view-booking',
  AccountDashboard: '/account',
  VerifyEmail: '/verify-email',
  PrivacyPolicy: '/privacy-policy',
  TermsOfService: '/terms-of-service',
  ReturnPolicy: '/return-policy',
  // Admin pages
  AdminProducts: '/admin/products',
  AdminVariants: '/admin/variants',
  AdminProductEnrichment: '/admin/product-enrichment',
  AdminOrders: '/admin/orders',
  AdminQuotes: '/admin/quotes',
  AdminBookings: '/admin/bookings',
  AdminBlogPosts: '/admin/blog-posts',
  AdminSEOOptimization: '/admin/seo',
  AdminCRM: '/admin/crm',
  AdminCustomers: '/admin/customers',
  AdminImportProducts: '/admin/import',
  AdminGitHub: '/admin/github',
};

/**
 * Convert a Base44 page name (with optional query params) to a Next.js URL.
 * Examples:
 *   createPageUrl('Vinyl') → '/vinyl'
 *   createPageUrl('ProductDetail?slug=oak-flooring') → '/products/oak-flooring'
 *   createPageUrl('Location?city=Markham') → '/flooring-in-markham'
 *   createPageUrl('BlogPost?slug=my-post') → '/blog/my-post'
 */
export function createPageUrl(pageName) {
  // Parse query params if present
  const [name, queryString] = pageName.split('?');
  const params = queryString ? Object.fromEntries(new URLSearchParams(queryString)) : {};

  const basePath = ROUTE_MAP[name];
  if (!basePath) {
    console.warn(`Unknown page: ${name}, falling back to /${name}`);
    return '/' + name;
  }

  // Handle dynamic routes
  if (name === 'ProductDetail' && params.slug) {
    return `/products/${params.slug}`;
  }
  if (name === 'BlogPost' && params.slug) {
    return `/blog/${params.slug}`;
  }
  if (name === 'ProjectDetail' && params.id) {
    return `/gallery/${params.id}`;
  }
  if (name === 'Location' && params.city) {
    return `/flooring-in-${params.city.toLowerCase().replace(/\s+/g, '-')}`;
  }

  return basePath;
}
