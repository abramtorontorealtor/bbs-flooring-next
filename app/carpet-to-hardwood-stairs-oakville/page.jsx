import { Suspense } from 'react';
import CarpetToHardwoodStairsCityClient from '@/components/CarpetToHardwoodStairsCityClient';
import { faqSchema, carpetToHardwoodStairsServiceSchema, cityLocalBusinessSchema, JsonLd } from '@/lib/schemas';

const CITY = 'Oakville';

const FAQ_ITEMS = [
  { question: 'How much does it cost to convert carpet stairs to hardwood in Oakville?', answer: 'New hardwood stair treads are $185/step (straight) with carpet removal included, or $125/step to refinish solid-wood treads already underneath. A typical 13-step Oakville staircase runs $2,405–$3,300 with nosing; iron pickets add $25 each. Call (647) 428-1111 for a free in-home quote.' },
  { question: 'Do you serve Oakville from your Markham showroom?', answer: 'Yes. While our showroom is on Highway 7 in Markham, our stair crew installs carpet-to-hardwood conversions across the west GTA including all of Oakville. Book a free in-home assessment and we\'ll bring material and stain samples to you. Call (647) 428-1111.' },
  { question: 'Can you match my new stairs to my existing Oakville floors?', answer: 'Yes. We custom-stain treads to match any existing hardwood, testing patches on your actual stairs first. If we\'re installing your main floors and stairs together, we guarantee a perfect colour match across the home. Call (647) 428-1111.' },
  { question: 'How long does a carpet-to-hardwood stair conversion take?', answer: 'Most standard 13-step Oakville staircases take 2–3 days — carpet removal, prep, installation, staining, and polyurethane, plus a drying day before heavy use. We give an exact timeline at the free assessment.' },
  { question: 'Which Oakville neighbourhoods do you serve?', answer: 'All of them — Old Oakville, Glen Abbey, Bronte, River Oaks, West Oak Trails, Joshua Creek, and Clearview. Call (647) 428-1111 to book a free stair assessment anywhere in Oakville.' },
  { question: 'What\'s under my Oakville carpet stairs?', answer: 'It depends on the home\'s age. Established Old Oakville and Bronte homes sometimes have solid hardwood treads under carpet — refinishable at $125/step. Newer Glen Abbey, River Oaks, and West Oak Trails builds usually have plywood treads that need new hardwood recapping at $185/step. We check during the free in-home visit.' },
];

export const metadata = {
  title: 'Carpet to Hardwood Stairs Oakville | $185/Step | BBS Flooring',
  description: 'Convert carpet stairs to hardwood in Oakville — new treads from $185/step, refinishing from $125/step, custom colour-matched. Serving Glen Abbey, Bronte, River Oaks, West Oak Trails & Old Oakville. WSIB insured. Free estimate: (647) 428-1111.',
  alternates: { canonical: '/carpet-to-hardwood-stairs-oakville' },
};

const DATA = {
  city: CITY,
  breadcrumbPath: '/carpet-to-hardwood-stairs-oakville',
  schemaId: 'faq-carpet-to-hardwood-stairs-oakville',
  heroSubtitle: 'Replace the worn carpet on your Oakville stairs with real hardwood treads. Honest per-step pricing, 2-3 day turnaround, custom-stained to match your floors.',
  answer: [
    { t: 'Converting carpet stairs to hardwood in ' },
    { b: 'Oakville' },
    { t: ' costs ' },
    { b: '$185 per step' },
    { t: ' for new solid-hardwood treads (carpet removal included), or ' },
    { b: '$125 per step' },
    { t: ' to refinish solid-wood treads already under the carpet. A typical 13-step Oakville staircase runs about ' },
    { b: '$2,400–$3,300' },
    { t: ', finished in 2–3 days and custom-stained to match your floors.' },
  ],
  whyHereTitle: 'Why Oakville Homes Are Converting Their Carpet Stairs',
  whyHereParagraphs: [
    'Oakville pairs high home values with a housing stock that spans a century — from the heritage homes of Old Oakville and Bronte to the sprawling 1990s and 2000s family subdivisions of Glen Abbey, River Oaks, and West Oak Trails. Almost all of the newer homes were finished with carpeted staircases over plywood treads, and in a market this design-driven, a dated carpeted staircase stands out immediately.',
    'Carpet-to-hardwood conversion is the upgrade that ties a home together. We recap the existing staircase with real solid-oak treads and risers — no demolition, a fraction of a rebuild — and custom-stain them to match your main-floor hardwood. In Oakville\'s move-up and luxury segments, hardwood stairs are an expected finish, not a splurge.',
    'The older homes in Old Oakville and Bronte occasionally have genuine hardwood treads under the carpet that can be refinished at $125/step rather than recapped. Our crew serves all of Oakville from our Markham showroom, bringing material and stain samples to your free in-home assessment so you can see the options on your actual stairs.',
  ],
  neighbourhoodsIntro: 'Our stair crew converts carpet-to-hardwood staircases across all of Oakville, from heritage Old Oakville and Bronte to the family neighbourhoods of Glen Abbey and West Oak Trails.',
  neighbourhoods: ['Old Oakville', 'Glen Abbey', 'Bronte', 'River Oaks', 'West Oak Trails', 'Joshua Creek', 'Clearview', 'Palermo', 'College Park', 'Iroquois Ridge'],
  faqItems: FAQ_ITEMS,
  spokeLinks: [
    { href: '/stair-recapping', label: 'Stair Recapping & Cladding', description: 'New hardwood treads over your existing staircase — no demolition' },
    { route: 'StairRefinishing', label: 'Staircase Refinishing & Staining', description: 'Restore existing hardwood stairs with sanding, staining & finishing' },
    { route: 'CarpetToHardwoodStairs', label: 'Carpet to Hardwood Stairs (Overview)', description: 'How the conversion works, full pricing, and project gallery' },
    { route: 'Stairs', label: 'Staircase Installation & Renovation', description: 'Full staircase renovation — treads, railings, pickets and more' },
    { route: 'FreeMeasurement', label: 'Free In-Home Measurement', description: 'Book a free stair assessment and quote in Oakville' },
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd data={[
        carpetToHardwoodStairsServiceSchema(),
        cityLocalBusinessSchema(CITY, 'Carpet-to-hardwood stair conversion in Oakville — new hardwood treads from $185/step, refinishing from $125/step, custom colour-matched. Serving Glen Abbey, Bronte, River Oaks and all Oakville neighbourhoods.'),
        faqSchema(FAQ_ITEMS),
      ]} />
      <Suspense><CarpetToHardwoodStairsCityClient data={DATA} /></Suspense>
    </>
  );
}
