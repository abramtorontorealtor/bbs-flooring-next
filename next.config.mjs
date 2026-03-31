/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
    ],
  },
  // Redirect old Base44 URLs to new paths
  async redirects() {
    return [
      // Category pages
      { source: '/Vinyl', destination: '/vinyl', permanent: true },
      { source: '/Laminate', destination: '/laminate', permanent: true },
      { source: '/SolidHardwood', destination: '/solid-hardwood', permanent: true },
      { source: '/EngineeredHardwood', destination: '/engineered-hardwood', permanent: true },
      { source: '/Products', destination: '/products', permanent: true },
      { source: '/Clearance', destination: '/clearance', permanent: true },
      // Service pages
      { source: '/Stairs', destination: '/stairs', permanent: true },
      { source: '/Installation', destination: '/installation', permanent: true },
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
      { source: '/Compare', destination: '/compare', permanent: true },
      { source: '/Financing', destination: '/financing', permanent: true },
      { source: '/About', destination: '/about', permanent: true },
      { source: '/Contact', destination: '/contact', permanent: true },
      { source: '/Gallery', destination: '/gallery', permanent: true },
      { source: '/Blog', destination: '/blog', permanent: true },
      { source: '/Cart', destination: '/cart', permanent: true },
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
