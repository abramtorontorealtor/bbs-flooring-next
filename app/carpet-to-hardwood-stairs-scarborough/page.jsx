import { Suspense } from 'react';
import CarpetToHardwoodStairsCityClient from '@/components/CarpetToHardwoodStairsCityClient';
import { faqSchema, carpetToHardwoodStairsServiceSchema, cityLocalBusinessSchema, JsonLd } from '@/lib/schemas';

const CITY = 'Scarborough';

const FAQ_ITEMS = [
  { question: 'How much does it cost to convert carpet stairs to hardwood in Scarborough?', answer: 'New hardwood stair treads are $185/step (straight) with carpet removal included, or $125/step to refinish solid-wood treads already underneath. A typical 13-step Scarborough staircase runs $2,405–$3,300 with nosing; iron pickets add $25 each. Call (647) 428-1111 for a free in-home quote.' },
  { question: 'Do you refinish the original hardwood stairs in older Scarborough homes?', answer: 'Yes — and Scarborough is one of the best places for it. Many 1960s–1980s homes in Birch Cliff, the Bluffs, and Agincourt have genuine solid-hardwood treads hiding under decades-old carpet. Those can be sanded and refinished at $125/step — the most affordable option. We confirm what\'s underneath at the free visit.' },
  { question: 'Can you match my new stairs to my existing Scarborough floors?', answer: 'Yes. We custom-stain treads to match any existing hardwood, testing patches on your actual stairs first. If we\'re doing your main floors and stairs together, we guarantee a perfect colour match. Call (647) 428-1111.' },
  { question: 'How long does a carpet-to-hardwood stair conversion take?', answer: 'Most standard 13-step Scarborough staircases take 2–3 days — carpet removal, prep, installation, staining, and polyurethane, plus a drying day before heavy use. We give an exact timeline at the free assessment.' },
  { question: 'Which Scarborough neighbourhoods do you serve?', answer: 'All of them — Agincourt, Birch Cliff, the Bluffs, Malvern, West Hill, Highland Creek, Woburn, and Guildwood. Our Highway 7 showroom in Markham is a short drive from north Scarborough. Call (647) 428-1111.' },
  { question: 'What\'s under my Scarborough carpet stairs?', answer: 'It depends on the era. Post-war and mid-century homes in Birch Cliff and the Bluffs often have solid oak treads under carpet — refinishable at $125/step. Newer Malvern and Agincourt builds usually have plywood treads that need new hardwood recapping at $185/step. We check during the free in-home visit.' },
];

export const metadata = {
  title: 'Carpet to Hardwood Stairs Scarborough | $185/Step | BBS Flooring',
  description: 'Convert carpet stairs to hardwood in Scarborough — new treads from $185/step, refinishing from $125/step, custom colour-matched. Serving Agincourt, Birch Cliff, the Bluffs, Malvern & Guildwood. WSIB insured. Free estimate: (647) 428-1111.',
  alternates: { canonical: '/carpet-to-hardwood-stairs-scarborough' },
};

const DATA = {
  city: CITY,
  breadcrumbPath: '/carpet-to-hardwood-stairs-scarborough',
  schemaId: 'faq-carpet-to-hardwood-stairs-scarborough',
  heroSubtitle: 'Pull up the tired carpet on your Scarborough stairs and bring back real hardwood. Honest per-step pricing, 2-3 day turnaround, custom-stained to match your floors.',
  answer: [
    { t: 'Converting carpet stairs to hardwood in ' },
    { b: 'Scarborough' },
    { t: ' costs ' },
    { b: '$185 per step' },
    { t: ' for new solid-hardwood treads (carpet removal included), or ' },
    { b: '$125 per step' },
    { t: ' to refinish solid-wood treads already under the carpet — common in Scarborough’s older homes. A typical 13-step staircase runs about ' },
    { b: '$2,400–$3,300' },
    { t: ', finished in 2–3 days and custom-stained to match your floors.' },
  ],
  whyHereTitle: 'Why Scarborough Homes Are Converting Their Carpet Stairs',
  whyHereParagraphs: [
    'Scarborough has some of the most varied housing stock in the GTA, and that shapes every stair job. The post-war and mid-century homes of Birch Cliff, the Bluffs, and Cliffside were frequently built with solid hardwood treads that were later covered in carpet — meaning the real wood is often still there, waiting to be uncovered and refinished at $125/step.',
    'The newer subdivisions in Malvern, Agincourt, and around Highland Creek are a different story: those two-storey homes typically have plywood or MDF treads under carpet, which we recap with new solid-oak treads at $185/step. Either way, carpet-to-hardwood is the upgrade that transforms the entryway — the carpeted staircase is the first thing anyone sees, and the first surface to show wear.',
    'Because Scarborough is home to specialist stair shops, homeowners here are used to premium pricing. We bring the same craftsmanship — real solid-oak treads, custom colour-matched staining, WSIB-insured installers — with the honest per-step pricing of a flooring company. We check exactly what\'s under your carpet at the free in-home visit before you commit.',
  ],
  neighbourhoodsIntro: 'Our stair crew converts carpet-to-hardwood staircases across all of Scarborough, from the lakeside homes of the Bluffs to the family subdivisions of Malvern and Agincourt.',
  neighbourhoods: ['Agincourt', 'Birch Cliff', 'The Bluffs', 'Malvern', 'West Hill', 'Highland Creek', 'Woburn', 'Guildwood', 'Cliffside', 'Morningside'],
  faqItems: FAQ_ITEMS,
  spokeLinks: [
    { href: '/stair-recapping', label: 'Stair Recapping & Cladding', description: 'New hardwood treads over your existing staircase — no demolition' },
    { route: 'StairRefinishing', label: 'Staircase Refinishing & Staining', description: 'Restore existing hardwood stairs with sanding, staining & finishing' },
    { href: '/hardwood-flooring-scarborough', label: 'Hardwood Flooring Scarborough', description: 'Match your new stairs to real hardwood floors throughout the home' },
    { href: '/engineered-hardwood-flooring-scarborough', label: 'Engineered Hardwood Scarborough', description: 'Stable real-wood floors for basements and older subfloors' },
    { route: 'FreeMeasurement', label: 'Free In-Home Measurement', description: 'Book a free stair assessment and quote in Scarborough' },
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd data={[
        carpetToHardwoodStairsServiceSchema(),
        cityLocalBusinessSchema(CITY, 'Carpet-to-hardwood stair conversion in Scarborough — new hardwood treads from $185/step, refinishing from $125/step, custom colour-matched. Serving Agincourt, Birch Cliff, the Bluffs and all Scarborough neighbourhoods.'),
        faqSchema(FAQ_ITEMS),
      ]} />
      <Suspense><CarpetToHardwoodStairsCityClient data={DATA} /></Suspense>
    </>
  );
}
