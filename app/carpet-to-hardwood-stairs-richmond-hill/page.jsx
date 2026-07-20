import { Suspense } from 'react';
import CarpetToHardwoodStairsCityClient from '@/components/CarpetToHardwoodStairsCityClient';
import { faqSchema, carpetToHardwoodStairsServiceSchema, cityLocalBusinessSchema, JsonLd } from '@/lib/schemas';

const CITY = 'Richmond Hill';

const FAQ_ITEMS = [
  { question: 'How much does it cost to convert carpet stairs to hardwood in Richmond Hill?', answer: 'New hardwood stair treads are $185/step (straight) with carpet removal included, or $125/step to refinish solid-wood treads already underneath. A typical 13-step Richmond Hill staircase runs $2,405–$3,300 with nosing; iron pickets add $25 each. Call (647) 428-1111 for a free in-home quote.' },
  { question: 'Do you convert the carpeted builder stairs in Richmond Hill new builds?', answer: 'Yes — this is one of our most common Richmond Hill jobs. Many 1990s–2000s two-storey homes in Oak Ridges, Jefferson, and Bayview Hill were built with carpeted MDF or plywood stairs. We remove the carpet, install new solid oak treads and risers over the existing structure, and stain them to match your floors.' },
  { question: 'Can you match my new stairs to my existing Richmond Hill floors?', answer: 'Yes. We custom-stain treads to match any existing hardwood, applying test patches on your actual stairs first. If we\'re installing your main floors and stairs together, we guarantee a perfect colour match across the home. Call (647) 428-1111.' },
  { question: 'How long does a carpet-to-hardwood stair conversion take?', answer: 'Most standard 13-step Richmond Hill staircases take 2–3 days — carpet removal, prep, installation, staining, and polyurethane. An extra day of drying may be needed before heavy use. We confirm the exact timeline at the free assessment.' },
  { question: 'Which Richmond Hill neighbourhoods do you serve?', answer: 'All of them — Oak Ridges, South Richvale, Bayview Hill, Mill Pond, Jefferson, Lake Wilcox, Elgin Mills, and Observatory. Our Highway 7 showroom in Markham is minutes away, so site visits are quick. Call (647) 428-1111.' },
  { question: 'What\'s under my Richmond Hill carpet stairs?', answer: 'It depends on the home\'s age. Older Mill Pond and Observatory homes often have solid hardwood treads under carpet — refinishable at $125/step. Most Oak Ridges and Jefferson builds from the 1990s–2000s have plywood treads that need new hardwood recapping at $185/step. We check during the free in-home visit.' },
];

export const metadata = {
  title: 'Carpet to Hardwood Stairs Richmond Hill | $185/Step | BBS Flooring',
  description: 'Convert carpet stairs to hardwood in Richmond Hill — new treads from $185/step, refinishing from $125/step, custom colour-matched. Serving Oak Ridges, Bayview Hill, Mill Pond & Jefferson. WSIB insured. Free estimate: (647) 428-1111.',
  alternates: { canonical: '/carpet-to-hardwood-stairs-richmond-hill' },
};

const DATA = {
  city: CITY,
  breadcrumbPath: '/carpet-to-hardwood-stairs-richmond-hill',
  schemaId: 'faq-carpet-to-hardwood-stairs-richmond-hill',
  heroSubtitle: 'Ditch the dust-trapping carpet on your Richmond Hill stairs and reveal — or install — beautiful hardwood treads. Honest per-step pricing, 2-3 day turnaround, custom colour-matched to your floors.',
  answer: [
    { t: 'Converting carpet stairs to hardwood in ' },
    { b: 'Richmond Hill' },
    { t: ' costs ' },
    { b: '$185 per step' },
    { t: ' for new solid-hardwood treads (carpet removal included), or ' },
    { b: '$125 per step' },
    { t: ' to refinish solid-wood treads already under the carpet. A typical 13-step Richmond Hill staircase runs about ' },
    { b: '$2,400–$3,300' },
    { t: ', finished in 2–3 days and custom-stained to match your floors.' },
  ],
  whyHereTitle: 'Why Richmond Hill Homes Are Converting Their Carpet Stairs',
  whyHereParagraphs: [
    'Richmond Hill is full of two-storey homes built through the 1990s and 2000s — the Oak Ridges expansion, Jefferson, and Bayview Hill in particular — that were finished with wall-to-wall carpeted staircases over plywood or MDF treads. Two decades on, those carpeted stairs are the most worn, dated surface in the house, and they\'re the first thing a guest or a buyer sees walking in the front door.',
    'That\'s why carpet-to-hardwood conversion is one of the highest-return upgrades in this market. Recapping installs real solid-oak treads and risers over the existing staircase frame, so there\'s no demolition and no structural rebuild — a fraction of replacement cost, done in a few days. In Richmond Hill\'s move-up market, hardwood stairs that match the main-floor flooring read as a finished, higher-value home.',
    'Older pockets like Mill Pond and Observatory tell a different story: many of those homes have genuine hardwood treads hiding under the carpet that can simply be sanded and refinished at $125/step. We check what\'s actually under your carpet during the free in-home visit before you commit to anything.',
  ],
  neighbourhoodsIntro: 'Our stair crew converts carpet-to-hardwood staircases across every Richmond Hill neighbourhood, from the newer Oak Ridges Moraine subdivisions to the established homes around Mill Pond.',
  neighbourhoods: ['Oak Ridges', 'South Richvale', 'Bayview Hill', 'Mill Pond', 'Jefferson', 'Lake Wilcox', 'Elgin Mills', 'Observatory', 'Devonsleigh', 'Rouge Woods'],
  faqItems: FAQ_ITEMS,
  spokeLinks: [
    { href: '/stair-recapping', label: 'Stair Recapping & Cladding', description: 'New hardwood treads over your existing staircase — no demolition' },
    { route: 'StairRefinishing', label: 'Staircase Refinishing & Staining', description: 'Restore existing hardwood stairs with sanding, staining & finishing' },
    { href: '/hardwood-flooring-richmond-hill', label: 'Hardwood Flooring Richmond Hill', description: 'Match your new stairs to real hardwood floors throughout the home' },
    { href: '/engineered-hardwood-flooring-richmond-hill', label: 'Engineered Hardwood Richmond Hill', description: 'Stable real-wood floors for concrete and radiant-heat homes' },
    { route: 'FreeMeasurement', label: 'Free In-Home Measurement', description: 'Book a free stair assessment and quote in Richmond Hill' },
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd data={[
        carpetToHardwoodStairsServiceSchema(),
        cityLocalBusinessSchema(CITY, 'Carpet-to-hardwood stair conversion in Richmond Hill — new hardwood treads from $185/step, refinishing from $125/step, custom colour-matched. Serving Oak Ridges, Bayview Hill, Mill Pond and all Richmond Hill neighbourhoods.'),
        faqSchema(FAQ_ITEMS),
      ]} />
      <Suspense><CarpetToHardwoodStairsCityClient data={DATA} /></Suspense>
    </>
  );
}
