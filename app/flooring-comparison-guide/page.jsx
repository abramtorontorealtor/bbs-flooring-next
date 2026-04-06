import { Suspense } from 'react';
import FlooringComparisonGuideClient from '@/components/FlooringComparisonGuideClient';
import { faqSchema, localBusinessSchema, JsonLd } from '@/lib/schemas';

const faqItems = [
  {
    question: 'What is the most durable type of flooring?',
    answer: 'Solid hardwood is the most durable long-term — it can be refinished 5–7 times and last 50–100 years. For scratch and water resistance, vinyl (LVP/SPC) is the most durable day-to-day option. BBS carries 81 solid hardwood options from $5.10/sqft and 233 vinyl options from $2.19/sqft.',
  },
  {
    question: 'Is hardwood or vinyl flooring better value?',
    answer: 'Vinyl offers the best upfront value at $2.19–$3.59/sqft material + $2.00/sqft installation. Hardwood costs more upfront ($2.49–$8.99/sqft for engineered) but adds more resale value and lasts longer. For a 500 sqft room, vinyl costs $2,095–$2,795 installed vs $2,370–$6,120 for engineered hardwood.',
  },
  {
    question: 'What is the cheapest flooring option at BBS?',
    answer: 'Laminate flooring starts at $1.49/sqft (Tosca Floors). With installation at $2.00/sqft, total cost starts around $3.49/sqft — about $1,745 for a 500 sqft room. Vinyl starts at $2.19/sqft, making it the second most affordable option.',
  },
  {
    question: 'Can you mix flooring types in the same house?',
    answer: 'Yes — this is actually very common and recommended. Most GTA homeowners use engineered hardwood in living areas, vinyl in basements and bathrooms, and laminate in bedrooms or rental units. BBS installs transition strips between different flooring types.',
  },
  {
    question: 'Which flooring is best for pets?',
    answer: 'Vinyl (LVP/SPC) is the best for pets — 100% waterproof, scratch-resistant, and comfortable underfoot. If you prefer real wood, choose Hickory engineered hardwood (Janka 1820) with a wire-brushed finish to hide scratches. Avoid laminate — the surface can show scratches more easily.',
  },
  {
    question: 'What flooring adds the most home resale value?',
    answer: 'Hardwood flooring (engineered or solid) adds the most resale value — real estate agents consistently rank it as the #1 flooring upgrade buyers look for. White Oak in wide-plank is the most in-demand look in 2026. Vinyl is a neutral choice that won\'t hurt resale. Laminate adds the least value.',
  },
  {
    question: 'Is vinyl flooring really waterproof?',
    answer: 'Yes. SPC (stone polymer composite) and WPC (wood polymer composite) vinyl are 100% waterproof through the core. The surface, core, and backing will not absorb water. This makes vinyl ideal for basements, kitchens, and bathrooms. BBS carries 233 waterproof vinyl options from $2.19/sqft.',
  },
  {
    question: 'How long does each flooring type last?',
    answer: 'Solid hardwood: 50–100 years (refinishable 5–7 times). Engineered hardwood: 25–50 years (refinishable 1–3 times). Vinyl: 15–25 years. Laminate: 10–20 years. Longevity depends on quality, traffic, and maintenance.',
  },
  {
    question: 'What flooring is best for a rental property?',
    answer: 'Vinyl (LVP/SPC) is the top choice for rentals — waterproof, durable, affordable ($2.19–$3.59/sqft), and tenants can\'t easily damage it. Laminate ($1.49–$3.29/sqft) is the budget alternative. Avoid expensive hardwood in rental units unless targeting premium tenants.',
  },
  {
    question: 'Does BBS Flooring carry all three types?',
    answer: 'Yes. BBS stocks 807+ flooring products across all types: 348 engineered hardwood, 81 solid hardwood, 233 vinyl (LVP/SPC), and 145 laminate options from 15 brands. Visit the Markham showroom at 6061 Highway 7, Unit B, or browse online at bbsflooring.ca.',
  },
];

export const metadata = {
  title: 'Hardwood vs Vinyl vs Laminate: Which Flooring to Choose? (2026) | BBS Flooring',
  description: 'Complete comparison of hardwood, vinyl, and laminate flooring with real 2026 pricing from BBS Flooring. 807+ options compared — costs, durability, best uses, and room-by-room recommendations for GTA homeowners.',
  alternates: { canonical: '/flooring-comparison-guide' },
  openGraph: {
    title: 'Hardwood vs Vinyl vs Laminate Flooring Comparison (2026) | BBS Flooring',
    description: 'Compare 807+ flooring options with real Canadian pricing. Hardwood, vinyl, and laminate — head-to-head on cost, durability, and room suitability.',
    url: 'https://bbsflooring.ca/flooring-comparison-guide',
    type: 'article',
  },
};

export default function FlooringComparisonGuidePage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Hardwood vs Vinyl vs Laminate: Which Flooring Should You Choose? (2026)',
    description: metadata.description,
    author: {
      '@type': 'Organization',
      name: 'BBS Flooring',
      url: 'https://bbsflooring.ca',
    },
    publisher: {
      '@type': 'Organization',
      name: 'BBS Flooring',
      url: 'https://bbsflooring.ca',
      logo: {
        '@type': 'ImageObject',
        url: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/bbs-logo-official-v2.png',
      },
    },
    datePublished: '2026-04-06',
    dateModified: '2026-04-06',
    mainEntityOfPage: 'https://bbsflooring.ca/flooring-comparison-guide',
  };

  const schemas = [
    articleSchema,
    faqSchema(faqItems),
    localBusinessSchema(),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <Suspense><FlooringComparisonGuideClient /></Suspense>
    </>
  );
}
