import { Suspense } from 'react';
import FlooringCostGuideClient from '@/components/FlooringCostGuideClient';
import { faqSchema, localBusinessSchema, JsonLd } from '@/lib/schemas';

const faqItems = [
  {
    question: 'What is the cheapest type of flooring?',
    answer: 'Laminate is the cheapest flooring type at BBS Flooring, starting at $1.49/sqft for materials (Tosca Floors). With installation at $2.00/sqft, total cost starts around $3.49/sqft. Vinyl starts at $2.19/sqft material, making it the second most affordable.',
  },
  {
    question: 'How much does it cost to floor 1,000 square feet?',
    answer: 'At BBS Flooring: Laminate: $3,490–$5,290 installed. Vinyl: $4,190–$5,590 installed. Engineered hardwood: $4,740–$12,240 installed. Solid hardwood: $7,350–$10,500 installed. These include material + professional installation labour.',
  },
  {
    question: 'Does BBS Flooring offer free estimates?',
    answer: 'Yes. BBS offers free in-home measurements across the entire GTA. A technician visits your home, measures every room, checks subfloor conditions, and provides a detailed quote with no obligation. Book at bbsflooring.ca/free-measurement or call (647) 428-1111.',
  },
  {
    question: 'Is hardwood flooring worth the extra cost vs vinyl?',
    answer: 'For primary residences — usually yes. Hardwood adds 3–5% to home value and lasts 25–100 years vs 15–25 for vinyl. The cost gap has narrowed: BBS engineered hardwood starts at $2.49/sqft, while vinyl starts at $2.19/sqft. For rentals or basements, vinyl is the smarter investment.',
  },
  {
    question: 'Is installation included in BBS flooring prices?',
    answer: 'No — material and labour are quoted separately for transparency. Material prices are listed per square foot on the website. Installation labour starts at $2.00/sqft for vinyl/laminate and $2.25/sqft for hardwood. This lets you compare material costs fairly.',
  },
  {
    question: 'How should I budget for a flooring project?',
    answer: 'Rule of thumb: material cost × 2 covers materials + installation + most extras. For a more accurate budget, add: material + installation labour + old floor removal ($1.00–$3.00/sqft) + baseboards ($3.61/linear ft) + delivery ($140–$200) + 10% waste factor. BBS provides free detailed quotes.',
  },
  {
    question: 'How much do stairs cost?',
    answer: 'At BBS Flooring: Stair refinishing (sand & restain) is $125/step. New straight hardwood treads are $185/step. Specialty stairs (open/curved/bullnose) are $225/step. Pickets/spindles are $25/piece. A typical 13-step straight staircase costs $1,625–$2,405 for new treads.',
  },
  {
    question: 'Can I install flooring myself to save money?',
    answer: 'Click-lock vinyl and laminate are DIY-friendly — they float over the subfloor with no glue or nails. You can save $2.00/sqft in labour. Hardwood requires professional installation (nail guns, moisture testing, glue). BBS sells material without installation if you prefer DIY.',
  },
  {
    question: 'When is the cheapest time to buy flooring in the GTA?',
    answer: 'BBS runs clearance sales year-round with discontinued products from $1.49/sqft. The best time for deals is typically late fall and winter when demand is lower. Check bbsflooring.ca/clearance for current markdowns.',
  },
  {
    question: 'Does BBS require a deposit?',
    answer: 'For material purchases, payment is due at time of order. For installation projects, BBS typically requires a deposit to schedule the work, with the balance due on completion. Financing is available through PayBright for larger projects. Details at bbsflooring.ca/financing.',
  },
];

export const metadata = {
  title: 'How Much Does Flooring Cost in Toronto & the GTA? (2026) | BBS Flooring',
  description: 'Complete 2026 flooring cost guide for Toronto and the GTA. Real prices: material from $1.49/sqft, installation from $2.00/sqft. Room-by-room budgets, hidden costs, and money-saving tips from BBS Flooring.',
  alternates: { canonical: '/flooring-cost-toronto-2026' },
  openGraph: {
    title: 'Flooring Cost Guide for Toronto & the GTA (2026) | BBS Flooring',
    description: 'Real 2026 flooring prices for Toronto homeowners. Material + labour breakdowns, room-size calculators, and expert tips from BBS Flooring.',
    url: 'https://bbsflooring.ca/flooring-cost-toronto-2026',
    type: 'article',
  },
};

export default function FlooringCostGuidePage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How Much Does Flooring Cost in Toronto & the GTA? (2026)',
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
    mainEntityOfPage: 'https://bbsflooring.ca/flooring-cost-toronto-2026',
  };

  const schemas = [
    articleSchema,
    faqSchema(faqItems),
    localBusinessSchema(),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <Suspense><FlooringCostGuideClient /></Suspense>
    </>
  );
}
