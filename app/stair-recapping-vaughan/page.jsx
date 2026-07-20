import { Suspense } from 'react';
import StairRecappingCityClient from '@/components/StairRecappingCityClient';
import { faqSchema, carpetToHardwoodStairsServiceSchema, cityLocalBusinessSchema, JsonLd } from '@/lib/schemas';

const CITY = 'Vaughan';

const FAQ_ITEMS = [
  { question: 'How much does stair recapping cost in Vaughan?', answer: 'Stair recapping is $185/step for straight treads (old-surface removal included) and $225/step for pie or bullnose steps. A typical 13-step Vaughan staircase runs about $2,405–$3,300 with nosing; iron pickets add $25 each. Call (647) 428-1111 for a free in-home quote.' },
  { question: 'Do you recap the carpeted builder stairs in Vaughan new builds?', answer: 'Yes — it\'s one of our most common Vaughan jobs. Homes across Woodbridge, Maple, Vellore Village and Kleinburg were built with carpeted MDF or plywood stairs. We remove the carpet, install new solid oak treads and risers over the existing structure, and stain them to match your floors.' },
  { question: 'Is recapping cheaper than rebuilding the staircase?', answer: 'Significantly. Recapping reuses your existing frame, so there is no demolition and no structural carpentry — typically 40–60% less than a full rebuild, done in 2–3 days, and it looks identical to a brand-new staircase.' },
  { question: 'Will the recapped stairs match my existing Vaughan floors?', answer: 'Yes. We custom-stain the new treads and risers to match your existing hardwood, applying test patches on your actual stairs first. If we are installing floors and stairs together, we guarantee a perfect colour match. Call (647) 428-1111.' },
  { question: 'How long does stair recapping take?', answer: 'Most standard 13-step Vaughan staircases take 2–3 days — removal, prep, installation, staining, and polyurethane. An extra day of drying may be needed before heavy use. We confirm the exact timeline at the free assessment.' },
  { question: 'Which Vaughan neighbourhoods do you serve?', answer: 'All of them — Woodbridge, Maple, Vellore Village, Kleinburg, Thornhill, Concord, Patterson and Sonoma Heights. Our Highway 7 showroom in Markham serves all of Vaughan. Call (647) 428-1111.' },
];

export const metadata = {
  title: 'Stair Recapping Vaughan | New Hardwood Treads $185/Step | BBS Flooring',
  description: 'Stair recapping & cladding in Vaughan — new solid-hardwood treads and risers over your existing staircase. No demolition. From $185/step, custom colour-matched, 2-3 day turnaround. Serving Woodbridge, Maple, Vellore Village, Kleinburg. WSIB insured. (647) 428-1111.',
  alternates: { canonical: '/stair-recapping-vaughan' },
};

const DATA = {
  city: CITY,
  breadcrumbPath: '/stair-recapping-vaughan',
  schemaId: 'faq-stair-recapping-vaughan',
  heroSubtitle: 'New solid-hardwood treads and risers installed over your existing Vaughan staircase — no demolition, no rebuild. A brand-new staircase for a fraction of replacement cost, custom colour-matched to your floors.',
  answer: [
    { t: 'Stair recapping in ' },
    { b: 'Vaughan' },
    { t: ' costs ' },
    { b: '$185 per step' },
    { t: ' for straight treads (old-surface removal included) and ' },
    { b: '$225 per step' },
    { t: ' for pie or bullnose steps. A typical 13-step Vaughan staircase runs about ' },
    { b: '$2,400–$3,300' },
    { t: ', finished in 2–3 days and custom-stained to match your floors.' },
  ],
  whyHereTitle: 'Why Vaughan Homes Recap Their Stairs',
  whyHereParagraphs: [
    'Vaughan is one of the GTA\'s biggest suburban build-outs — Woodbridge, Maple, Vellore Village and Patterson filled with two-storey and three-storey homes through the 1990s, 2000s and 2010s, most finished with carpeted staircases over plywood or MDF treads. As those homes mature, the carpeted stairs are almost always the most dated, worn surface, and the very first thing seen from the front entry.',
    'Recapping is the highest-return way to modernise them. Vaughan\'s builder staircases sit on sound, code-built frames, so tearing them out is unnecessary — we install real solid-hardwood treads and risers directly over the existing structure. No demolition, no structural carpentry, and the finished staircase reads as a seamless upgrade that matches the main-floor flooring. Vaughan\'s larger homes often have two staircases (main + basement); we quote both together for the best value.',
    'Newer Kleinburg and Sonoma Heights builds almost always have plywood treads under the carpet — those get new hardwood recapping. We confirm exactly what\'s under your carpet during the free in-home visit before you commit to anything.',
  ],
  neighbourhoodsIntro: 'Our stair crew recaps staircases across every Vaughan neighbourhood, from the established streets of Woodbridge and Maple to the newer subdivisions in Vellore Village, Patterson and Kleinburg.',
  neighbourhoods: ['Woodbridge', 'Maple', 'Vellore Village', 'Kleinburg', 'Thornhill', 'Concord', 'Patterson', 'Sonoma Heights', 'Vaughan Mills', 'West Woodbridge'],
  faqItems: FAQ_ITEMS,
  spokeLinks: [
    { href: '/carpet-to-hardwood-stairs-vaughan', label: 'Carpet to Hardwood Stairs Vaughan', description: 'Rip out the carpet and recap with beautiful hardwood treads' },
    { href: '/stair-recapping', label: 'Stair Recapping & Cladding', description: 'How recapping works — process, pricing and material options' },
    { href: '/hardwood-flooring-vaughan', label: 'Hardwood Flooring Vaughan', description: 'Match your recapped stairs to real hardwood floors throughout the home' },
    { href: '/engineered-hardwood-flooring-vaughan', label: 'Engineered Hardwood Vaughan', description: 'Stable real-wood floors for concrete and radiant-heat homes' },
    { route: 'FreeMeasurement', label: 'Free In-Home Measurement', description: 'Book a free stair assessment and quote in Vaughan' },
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd data={[
        carpetToHardwoodStairsServiceSchema(),
        cityLocalBusinessSchema(CITY, 'Stair recapping and cladding in Vaughan — new solid-hardwood treads and risers over your existing staircase from $185/step, custom colour-matched. Serving Woodbridge, Maple, Vellore Village, Kleinburg and all Vaughan neighbourhoods.'),
        faqSchema(FAQ_ITEMS),
      ]} />
      <Suspense><StairRecappingCityClient data={DATA} /></Suspense>
    </>
  );
}
