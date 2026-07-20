import { Suspense } from 'react';
import CarpetToHardwoodStairsCityClient from '@/components/CarpetToHardwoodStairsCityClient';
import { faqSchema, carpetToHardwoodStairsServiceSchema, cityLocalBusinessSchema, JsonLd } from '@/lib/schemas';

const CITY = 'Vaughan';

const FAQ_ITEMS = [
  { question: 'How much does it cost to convert carpet stairs to hardwood in Vaughan?', answer: 'New hardwood stair treads are $185/step (straight) with carpet removal included, or $125/step to refinish solid-wood treads already underneath. A typical 13-step Vaughan staircase runs $2,405–$3,300 with nosing; iron pickets add $25 each. Call (647) 428-1111 for a free in-home quote.' },
  { question: 'Do you convert the carpeted builder stairs in Vaughan new builds?', answer: 'Yes — it is one of our most common Vaughan jobs. Many homes in Woodbridge, Maple, and Thornhill were built with carpeted MDF or plywood staircases. We remove the carpet, install new solid oak treads and risers over the existing structure, and stain them to match your floors.' },
  { question: 'Can you match my new stairs to my existing Vaughan floors?', answer: 'Yes. We custom-stain treads to match any existing hardwood, applying test patches on your actual stairs first. If we are installing your main floors and stairs together, we guarantee a perfect colour match across the home. Call (647) 428-1111.' },
  { question: 'How long does a carpet-to-hardwood stair conversion take?', answer: 'Most standard 13-step Vaughan staircases take 2–3 days — carpet removal, prep, installation, staining, and polyurethane. An extra day of drying may be needed before heavy use. We confirm the exact timeline at the free assessment.' },
  { question: 'Which Vaughan neighbourhoods do you serve?', answer: 'All of them — Woodbridge, Maple, Thornhill, Kleinburg, Vellore Village, Patterson, and Concord. Our Highway 7 showroom is minutes from Vaughan, so site visits are quick. Call (647) 428-1111.' },
  { question: 'What is under my Vaughan carpet stairs?', answer: 'It depends on the home age. Older Thornhill and Woodbridge homes sometimes have solid hardwood treads under the carpet — refinishable at $125/step. Most newer Maple, Vellore Village, and Patterson builds have plywood treads that need new hardwood recapping at $185/step. We check during the free in-home visit.' },
];

export const metadata = {
  title: 'Carpet to Hardwood Stairs Vaughan | $185/Step | BBS Flooring',
  description: 'Convert carpet stairs to hardwood in Vaughan — new treads from $185/step, refinishing from $125/step, custom colour-matched. Serving Woodbridge, Maple, Thornhill & Kleinburg. WSIB insured. Free estimate: (647) 428-1111.',
  alternates: { canonical: '/carpet-to-hardwood-stairs-vaughan' },
};

const DATA = {
  city: CITY,
  breadcrumbPath: '/carpet-to-hardwood-stairs-vaughan',
  schemaId: 'faq-carpet-to-hardwood-stairs-vaughan',
  heroSubtitle: 'Ditch the dust-trapping carpet on your Vaughan stairs and reveal — or install — beautiful hardwood treads. Honest per-step pricing, 2-3 day turnaround, custom colour-matched to your floors.',
  answer: [
    { t: 'Converting carpet stairs to hardwood in ' },
    { b: 'Vaughan' },
    { t: ' costs ' },
    { b: '$185 per step' },
    { t: ' for new solid-hardwood treads (carpet removal included), or ' },
    { b: '$125 per step' },
    { t: ' to refinish solid-wood treads already under the carpet. A typical 13-step Vaughan staircase runs about ' },
    { b: '$2,400–$3,300' },
    { t: ', finished in 2–3 days and custom-stained to match your floors.' },
  ],
  whyHereTitle: 'Why Vaughan Homes Are Converting Their Carpet Stairs',
  whyHereParagraphs: [
    'Vaughan is one of the fastest-growing municipalities in the GTA, and much of its housing stock — the Maple and Vellore Village subdivisions, the newer Patterson and Kleinburg builds — went up with wall-to-wall carpeted staircases over plywood or MDF treads. A decade or two later, those carpeted stairs are the most worn, dated surface in the home and the first thing anyone sees at the front door.',
    'That is why carpet-to-hardwood conversion is one of the highest-return upgrades in this market. Recapping installs real solid-oak treads and risers over the existing staircase frame, so there is no demolition and no structural rebuild — a fraction of replacement cost, done in a few days. In Vaughan\u2019s move-up market, hardwood stairs that match the main-floor flooring read as a finished, higher-value home.',
    'Established pockets like Thornhill and older Woodbridge tell a different story: some of those homes have genuine hardwood treads hiding under the carpet that can simply be sanded and refinished at $125/step. We check what is actually under your carpet during the free in-home visit before you commit to anything.',
  ],
  neighbourhoodsIntro: 'Our stair crew converts carpet-to-hardwood staircases across every Vaughan neighbourhood, from the newer Patterson and Vellore Village subdivisions to the established homes in Thornhill and Woodbridge.',
  neighbourhoods: ['Woodbridge', 'Maple', 'Thornhill', 'Kleinburg', 'Vellore Village', 'Patterson', 'Concord', 'Sonoma Heights', 'East Woodbridge', 'Vaughan Mills'],
  faqItems: FAQ_ITEMS,
  spokeLinks: [
    { href: '/stair-recapping', label: 'Stair Recapping & Cladding', description: 'New hardwood treads over your existing staircase — no demolition' },
    { route: 'StairRefinishing', label: 'Staircase Refinishing & Staining', description: 'Restore existing hardwood stairs with sanding, staining & finishing' },
    { href: '/hardwood-flooring-vaughan', label: 'Hardwood Flooring Vaughan', description: 'Match your new stairs to real hardwood floors throughout the home' },
    { href: '/engineered-hardwood-flooring-vaughan', label: 'Engineered Hardwood Vaughan', description: 'Stable real-wood floors for concrete and radiant-heat homes' },
    { route: 'FreeMeasurement', label: 'Free In-Home Measurement', description: 'Book a free stair assessment and quote in Vaughan' },
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd data={[
        carpetToHardwoodStairsServiceSchema(),
        cityLocalBusinessSchema(CITY, 'Carpet-to-hardwood stair conversion in Vaughan — new hardwood treads from $185/step, refinishing from $125/step, custom colour-matched. Serving Woodbridge, Maple, Thornhill and all Vaughan neighbourhoods.'),
        faqSchema(FAQ_ITEMS),
      ]} />
      <Suspense><CarpetToHardwoodStairsCityClient data={DATA} /></Suspense>
    </>
  );
}
