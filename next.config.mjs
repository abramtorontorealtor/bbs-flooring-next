/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTE: experimental.optimizeCss (critters) does NOT work with Turbopack — produces zero
  // inline <style> tags. Removed to avoid confusion. optimizePackageImports also removed
  // previously (caused 122+ micro-chunks with Turbopack). Turbopack handles both natively.
  images: {
    minimumCacheTTL: 2678400,  // 31 days — Supabase sends no-cache, this prevents 60s re-transformation cycle
    formats: ['image/webp'],  // WebP only — AVIF doubles transformation count for ~20% size gain, not worth the cost
    deviceSizes: [640, 750, 828, 1080, 1200],  // Dropped 1920/2048/3840 — no flooring shopper needs 4K breakpoints
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.bbsflooring.ca',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'wsrv.nl',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'static.wixstatic.com',
      },
      {
        protocol: 'https',
        hostname: '*.wixstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'vidarflooring.com',
      },
    ],
  },
  // Redirect old Base44 PascalCase URLs to new kebab-case paths.
  // IMPORTANT: Do NOT add redirects where source and destination differ only by
  // capitalisation (e.g. /Vinyl → /vinyl). Next.js 16 / Vercel matches redirects
  // case-insensitively, so /vinyl would match the /Vinyl source and loop forever.
  // Case-only redirects are handled by the Cloudflare worker bbs-redirects-v1.
  async redirects() {
    return [
      // Category pages (multi-word only — single-word handled by Cloudflare)
      { source: '/SolidHardwood', destination: '/solid-hardwood', permanent: true },
      { source: '/EngineeredHardwood', destination: '/engineered-hardwood', permanent: true },
      // Service pages
      { source: '/StairRefinishing', destination: '/stair-refinishing', permanent: true },
      { source: '/HardwoodRefinishing', destination: '/hardwood-refinishing', permanent: true },
      { source: '/CarpetRemoval', destination: '/carpet-removal', permanent: true },
      { source: '/CarpetToHardwoodStairs', destination: '/carpet-to-hardwood-stairs', permanent: true },
      { source: '/FreeMeasurement', destination: '/free-measurement', permanent: true },
      // Content pages
      { source: '/FlooringInstallationCost', destination: '/flooring-installation-cost', permanent: true },
      { source: '/FlooringShowroomMarkham', destination: '/flooring-showroom-markham', permanent: true },
      { source: '/FlooringClearanceSale', destination: '/flooring-clearance-sale', permanent: true },
      { source: '/QuoteCalculator', destination: '/quote-calculator', permanent: true },
      { source: '/RoomVisualizer', destination: '/room-visualizer', permanent: true },
      // Missing legacy pages (were 404ing in GSC)
      { source: '/Hardwood', destination: '/engineered-hardwood', permanent: true },
      { source: '/WaterproofVinyl', destination: '/waterproof-flooring', permanent: true },
      { source: '/FlooringPaymentPlans', destination: '/financing', permanent: true },
      // Brand/specialty pages
      { source: '/VidarFlooring', destination: '/vidar-flooring', permanent: true },
      { source: '/WickhamFlooring', destination: '/wickham-flooring', permanent: true },
      { source: '/BasementFlooring', destination: '/basement-flooring', permanent: true },
      { source: '/WaterproofFlooring', destination: '/waterproof-flooring', permanent: true },
      { source: '/WhiteOakFlooring', destination: '/white-oak-flooring', permanent: true },
      { source: '/ContractorFlooring', destination: '/contractor-flooring', permanent: true },
      // Policy pages
      { source: '/PrivacyPolicy', destination: '/privacy-policy', permanent: true },
      { source: '/TermsOfService', destination: '/terms-of-service', permanent: true },
      { source: '/ReturnPolicy', destination: '/return-policy', permanent: true },
    ];
  },
};

export default nextConfig;
