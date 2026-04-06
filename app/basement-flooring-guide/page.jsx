import { Suspense } from 'react';
import BasementFlooringGuideClient from '@/components/BasementFlooringGuideClient';
import { faqSchema, localBusinessSchema, JsonLd } from '@/lib/schemas';

const faqItems = [
  {
    question: 'What is the best waterproof flooring for a basement?',
    answer: 'Vinyl (LVP/SPC) is the best waterproof basement flooring. It is 100% waterproof through the core, installs directly over concrete, and handles basement humidity and temperature swings. BBS Flooring carries 233 waterproof vinyl options from $2.19–$3.59/sqft from brands like NAF, Woden, Triforest, and Simba.',
  },
  {
    question: 'Can you put hardwood in a basement?',
    answer: 'Engineered hardwood can work in dry, finished basements — but only with glue-down or floating installation and proper moisture testing. It is NOT waterproof and should never be used in basements with any moisture history. Solid hardwood should never be installed in a basement. If moisture is a concern, vinyl is the safer choice.',
  },
  {
    question: 'What is the cheapest basement flooring?',
    answer: 'Laminate is the cheapest option, starting at $1.49/sqft (Tosca Floors at BBS). With installation at $2.00/sqft, a 600 sqft basement costs about $2,094 for laminate. However, laminate is only water-resistant, not waterproof — use a moisture barrier underlayment and only install in dry basements.',
  },
  {
    question: 'How do you handle moisture in a basement before installing flooring?',
    answer: 'Step 1: Test moisture levels (calcium chloride test or relative humidity test). Step 2: If levels are acceptable, install a 6mil polyethylene vapour barrier over the concrete. Step 3: Consider a dehumidifier for ongoing humidity control. BBS tests moisture during free in-home measurements.',
  },
  {
    question: 'Does BBS Flooring install basement flooring?',
    answer: 'Yes. BBS provides professional basement flooring installation across the GTA. Vinyl/laminate installation is $2.00/sqft, engineered hardwood glue-down is $3.25/sqft. Includes subfloor assessment and moisture testing. Book a free in-home measurement at bbsflooring.ca/free-measurement.',
  },
  {
    question: 'How long does vinyl flooring last in a basement?',
    answer: 'Quality SPC vinyl lasts 15–25 years in a basement, depending on wear layer thickness and foot traffic. Products with 20mil+ wear layers last longest. BBS carries vinyl with wear layers from 12mil to 28mil. Thicker wear layers are worth the small premium for basement use.',
  },
  {
    question: 'Can laminate go in a basement?',
    answer: 'Yes, but only in dry basements with a proper moisture barrier underlayment. Laminate is water-resistant, not waterproof — standing water will damage it. Choose AC4 or AC5 rated laminate for durability. BBS carries 145 laminate options from $1.49/sqft. If there is any moisture history, use vinyl instead.',
  },
  {
    question: 'What about carpet in basements?',
    answer: 'Carpet is generally not recommended for basements in Ontario. It absorbs moisture, promotes mould growth, and is difficult to dry after any water event. If you want warmth underfoot, vinyl with built-in underlayment or vinyl + a quality pad provides warmth without the mould risk.',
  },
  {
    question: 'Do I need underlayment for basement flooring?',
    answer: 'For floating installations (vinyl or laminate), yes — use an underlayment with a built-in vapour barrier. Some vinyl products have attached underlayment (check specifications). For glue-down engineered hardwood, no underlayment is used, but a moisture barrier is applied to the concrete first.',
  },
  {
    question: 'How much does it cost to floor a 600 sqft basement?',
    answer: 'At BBS Flooring: Vinyl (material + install): $2,514–$3,354. Laminate: $2,094–$3,174. Engineered hardwood (glue-down): $3,444–$7,344. Add $600–$750 for old flooring removal if needed, plus $140–$200 for delivery. BBS provides free detailed quotes — book at bbsflooring.ca/free-measurement.',
  },
];

export const metadata = {
  title: 'Best Flooring for Basements in Ontario (2026) | Waterproof Options | BBS Flooring',
  description: 'Complete guide to basement flooring in Ontario. 233 waterproof vinyl options from $2.19/sqft, moisture barrier advice, cost breakdowns, and installation tips for concrete subfloors. Based in Markham, serving the GTA.',
  alternates: { canonical: '/basement-flooring-guide' },
  openGraph: {
    title: 'Best Basement Flooring in Ontario (2026) | BBS Flooring',
    description: '233 waterproof options from $2.19/sqft. Vinyl, laminate, and engineered hardwood compared for basements. Real pricing and Ontario-specific advice.',
    url: 'https://bbsflooring.ca/basement-flooring-guide',
    type: 'article',
  },
};

export default function BasementFlooringGuidePage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Best Flooring for Basements in Ontario (2026)',
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
    mainEntityOfPage: 'https://bbsflooring.ca/basement-flooring-guide',
  };

  const schemas = [
    articleSchema,
    faqSchema(faqItems),
    localBusinessSchema(),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <Suspense><BasementFlooringGuideClient /></Suspense>
    </>
  );
}
