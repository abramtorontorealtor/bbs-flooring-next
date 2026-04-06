import { Suspense } from 'react';
import EngineeredHardwoodGuideClient from '@/components/EngineeredHardwoodGuideClient';
import { faqSchema, localBusinessSchema, JsonLd } from '@/lib/schemas';

const faqItems = [
  {
    question: 'Can engineered hardwood be refinished?',
    answer: 'Yes. Engineered hardwood with a wear layer of 2mm or more can typically be refinished 1–3 times. Premium 3/4" thick engineered boards can be refinished 2–3 times, similar to solid hardwood.',
  },
  {
    question: 'Is engineered hardwood waterproof?',
    answer: 'No. Engineered hardwood is more moisture-resistant than solid hardwood due to its plywood core, but it is not waterproof. For wet areas like basements, consider vinyl (LVP/SPC) flooring instead, or use engineered hardwood with proper moisture barriers.',
  },
  {
    question: 'How long does engineered hardwood last?',
    answer: 'Engineered hardwood typically lasts 25–50 years depending on wear layer thickness, species hardness, finish quality, and maintenance. Premium brands like Vidar and Canadian Standard with thick wear layers can last a lifetime with proper care.',
  },
  {
    question: 'Can you install engineered hardwood over concrete?',
    answer: 'Yes — this is one of engineered hardwood\'s biggest advantages over solid hardwood. It can be glue-down installed directly over concrete (with moisture testing) or floated with a click-lock system. BBS charges $3.25/sqft for glue-down installation.',
  },
  {
    question: 'What is the best wood species for high-traffic areas?',
    answer: 'Hickory (Janka hardness 1820) is the hardest common species and best for high-traffic areas. White Oak (Janka 1360) is the most popular overall — hard enough for most homes with a modern aesthetic. Avoid softer species like Walnut (Janka 1010) in high-traffic zones.',
  },
  {
    question: 'How much does engineered hardwood cost in Toronto?',
    answer: 'At BBS Flooring, engineered hardwood ranges from $2.49–$9.29/sqft for materials. Including installation ($2.25–$4.25/sqft labour depending on method), total installed cost is $4.75–$13.50/sqft. Budget options start around $4.50/sqft total installed.',
  },
  {
    question: 'What width engineered hardwood is most popular in 2026?',
    answer: 'Wide plank (7" to 9½") dominates the 2026 market. Wider boards create a modern, open look with fewer seams. 5" remains a versatile standard width. Narrow 3¼" strips are now considered traditional/classic.',
  },
  {
    question: 'Should I choose engineered or solid hardwood?',
    answer: 'Choose engineered if: installing over concrete, using radiant heat, in a condo, or want wider planks at lower cost. Choose solid if: you want maximum refinish potential (5–7 times), prefer the traditional feel, and have a wood subfloor. BBS carries 447 engineered and 81 solid hardwood options.',
  },
  {
    question: 'Does BBS Flooring install engineered hardwood?',
    answer: 'Yes. BBS provides professional installation with WSIB-insured contractors. Nail-down: $2.25/sqft, glue-down: $3.25/sqft, herringbone: $4.25/sqft. Same-week installation is often available. Free in-home measurement included.',
  },
  {
    question: 'What is the difference between flooring grades?',
    answer: 'Select grade has a uniform appearance with minimal knots. #1 Common (Natural) has moderate character marks. Rustic/Character grade has prominent knots, colour variation, and natural imperfections. All grades are structurally identical — the difference is purely aesthetic. Rustic grades are often less expensive.',
  },
];

export const metadata = {
  title: 'Engineered Hardwood Buying Guide 2026 | Prices, Brands & Installation | BBS Flooring',
  description: 'Complete guide to buying engineered hardwood flooring in Canada. Compare 447+ options from 7 brands ($2.49–$9.29/sqft), installation costs, species, and grades. Based in Markham, serving the GTA.',
  alternates: { canonical: '/engineered-hardwood-guide' },
  openGraph: {
    title: 'Engineered Hardwood Buying Guide 2026 | BBS Flooring',
    description: 'Compare 447+ engineered hardwood options from 7 brands. Real pricing, installation costs, and expert advice from BBS Flooring in Markham.',
    url: 'https://bbsflooring.ca/engineered-hardwood-guide',
    type: 'article',
  },
};

export default function EngineeredHardwoodGuidePage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'The Complete Guide to Engineered Hardwood Flooring in Canada (2026)',
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
    mainEntityOfPage: 'https://bbsflooring.ca/engineered-hardwood-guide',
  };

  const schemas = [
    articleSchema,
    faqSchema(faqItems),
    localBusinessSchema(),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <Suspense><EngineeredHardwoodGuideClient /></Suspense>
    </>
  );
}
