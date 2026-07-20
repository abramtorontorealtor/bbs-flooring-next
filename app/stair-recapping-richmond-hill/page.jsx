import { Suspense } from 'react';
import StairRecappingCityClient from '@/components/StairRecappingCityClient';
import { faqSchema, carpetToHardwoodStairsServiceSchema, cityLocalBusinessSchema, JsonLd } from '@/lib/schemas';

const CITY = 'Richmond Hill';

const FAQ_ITEMS = [
  { question: 'How much does stair recapping cost in Richmond Hill?', answer: 'Stair recapping is $185/step for straight treads (old-surface removal included) and $225/step for pie or bullnose steps. A typical 13-step Richmond Hill staircase runs about $2,405–$3,300 with nosing; iron pickets add $25 each. Call (647) 428-1111 for a free in-home quote.' },
  { question: 'Do you recap the carpeted stairs in Richmond Hill homes?', answer: 'Yes — it\'s one of our most common Richmond Hill jobs. Many Oak Ridges, Jefferson and Bayview Hill homes from the 1990s–2000s were built with carpeted MDF or plywood stairs. We remove the carpet, install new solid oak treads and risers over the existing structure, and stain them to match your floors.' },
  { question: 'Is recapping cheaper than replacing the whole staircase?', answer: 'Significantly. Recapping reuses your existing frame, so there is no demolition and no structural carpentry — typically 40–60% less than a full rebuild, done in 2–3 days, and it looks identical to a brand-new staircase.' },
  { question: 'Will the recapped stairs match my existing Richmond Hill floors?', answer: 'Yes. We custom-stain the new treads and risers to match your existing hardwood, applying test patches on your actual stairs first. If we are installing floors and stairs together, we guarantee a perfect colour match. Call (647) 428-1111.' },
  { question: 'How long does stair recapping take?', answer: 'Most standard 13-step Richmond Hill staircases take 2–3 days — removal, prep, installation, staining, and polyurethane. An extra day of drying may be needed before heavy use. We confirm the exact timeline at the free assessment.' },
  { question: 'Which Richmond Hill neighbourhoods do you serve?', answer: 'All of them — Oak Ridges, South Richvale, Bayview Hill, Mill Pond, Jefferson, Lake Wilcox, Elgin Mills and Observatory. Our Highway 7 showroom in Markham is minutes away, so site visits are quick. Call (647) 428-1111.' },
];

export const metadata = {
  title: 'Stair Recapping Richmond Hill | New Hardwood Treads $185/Step | BBS Flooring',
  description: 'Stair recapping & cladding in Richmond Hill — new solid-hardwood treads and risers over your existing staircase. No demolition. From $185/step, custom colour-matched, 2-3 day turnaround. Serving Oak Ridges, Bayview Hill, Mill Pond. WSIB insured. (647) 428-1111.',
  alternates: { canonical: '/stair-recapping-richmond-hill' },
};

const DATA = {
  city: CITY,
  breadcrumbPath: '/stair-recapping-richmond-hill',
  schemaId: 'faq-stair-recapping-richmond-hill',
  heroSubtitle: 'New solid-hardwood treads and risers installed over your existing Richmond Hill staircase — no demolition, no rebuild. A brand-new staircase for a fraction of replacement cost, custom colour-matched to your floors.',
  answer: [
    { t: 'Stair recapping in ' },
    { b: 'Richmond Hill' },
    { t: ' costs ' },
    { b: '$185 per step' },
    { t: ' for straight treads (old-surface removal included) and ' },
    { b: '$225 per step' },
    { t: ' for pie or bullnose steps. A typical 13-step Richmond Hill staircase runs about ' },
    { b: '$2,400–$3,300' },
    { t: ', finished in 2–3 days and custom-stained to match your floors.' },
  ],
  whyHereTitle: 'Why Richmond Hill Homes Recap Their Stairs',
  whyHereParagraphs: [
    'Richmond Hill\'s big growth ran through the 1990s and 2000s — the Oak Ridges expansion, Jefferson, and Bayview Hill in particular — filling with two-storey homes finished with carpeted staircases over plywood or MDF treads. Twenty years on, those carpeted stairs are the most worn, dated surface in the house, and the first thing a guest or buyer notices at the front door.',
    'Recapping is the highest-return fix. These builder staircases have sound, code-built frames, so there\'s no reason to tear them out — we install real solid-hardwood treads and risers directly over the existing structure. No demolition, no structural carpentry, and the staircase reads as a seamless, finished upgrade that matches the main-floor flooring. In Richmond Hill\'s move-up market, that translates directly into perceived home value.',
    'Older pockets like Mill Pond and Observatory sometimes have genuine hardwood treads hiding under the carpet — in those cases refinishing at $125/step may be the smarter call. We tell you exactly what your stairs need during the free in-home visit before you commit to anything.',
  ],
  neighbourhoodsIntro: 'Our stair crew recaps staircases across every Richmond Hill neighbourhood, from the newer Oak Ridges Moraine subdivisions to the established homes around Mill Pond and South Richvale.',
  neighbourhoods: ['Oak Ridges', 'South Richvale', 'Bayview Hill', 'Mill Pond', 'Jefferson', 'Lake Wilcox', 'Elgin Mills', 'Observatory', 'Devonsleigh', 'Rouge Woods'],
  faqItems: FAQ_ITEMS,
  spokeLinks: [
    { href: '/carpet-to-hardwood-stairs-richmond-hill', label: 'Carpet to Hardwood Stairs Richmond Hill', description: 'Rip out the carpet and recap with beautiful hardwood treads' },
    { href: '/stair-recapping', label: 'Stair Recapping & Cladding', description: 'How recapping works — process, pricing and material options' },
    { href: '/hardwood-flooring-richmond-hill', label: 'Hardwood Flooring Richmond Hill', description: 'Match your recapped stairs to real hardwood floors throughout the home' },
    { href: '/engineered-hardwood-flooring-richmond-hill', label: 'Engineered Hardwood Richmond Hill', description: 'Stable real-wood floors for concrete and radiant-heat homes' },
    { route: 'FreeMeasurement', label: 'Free In-Home Measurement', description: 'Book a free stair assessment and quote in Richmond Hill' },
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd data={[
        carpetToHardwoodStairsServiceSchema(),
        cityLocalBusinessSchema(CITY, 'Stair recapping and cladding in Richmond Hill — new solid-hardwood treads and risers over your existing staircase from $185/step, custom colour-matched. Serving Oak Ridges, Bayview Hill, Mill Pond and all Richmond Hill neighbourhoods.'),
        faqSchema(FAQ_ITEMS),
      ]} />
      <Suspense><StairRecappingCityClient data={DATA} /></Suspense>
    </>
  );
}
