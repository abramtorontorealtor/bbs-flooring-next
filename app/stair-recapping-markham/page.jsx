import { Suspense } from 'react';
import StairRecappingCityClient from '@/components/StairRecappingCityClient';
import { faqSchema, carpetToHardwoodStairsServiceSchema, cityLocalBusinessSchema, JsonLd } from '@/lib/schemas';

const CITY = 'Markham';

const FAQ_ITEMS = [
  { question: 'How much does stair recapping cost in Markham?', answer: 'Stair recapping is $185/step for straight treads (old-surface removal included) and $225/step for pie or bullnose steps. A typical 13-step Markham staircase runs about $2,405–$3,300 with nosing; iron pickets add $25 each. Call (647) 428-1111 for a free in-home quote.' },
  { question: 'Do you recap the carpeted builder stairs in Markham new builds?', answer: 'Yes — this is one of our most common Markham jobs. Many Cornell, Cathedraltown, Greensborough and Wismer homes were built with carpeted MDF or plywood stairs. We remove the carpet, install new solid oak treads and risers over the existing structure, and stain them to match your floors.' },
  { question: 'Is recapping cheaper than rebuilding the staircase?', answer: 'Significantly. Recapping reuses your existing staircase frame, so there is no demolition and no structural carpentry — typically 40–60% less than a full rebuild, done in 2–3 days, and it looks identical to a brand-new staircase.' },
  { question: 'Will the recapped stairs match my existing Markham floors?', answer: 'Yes. We custom-stain the new treads and risers to match your existing hardwood, applying test patches on your actual stairs first. If we are installing your main floors and stairs together, we guarantee a perfect colour match across the home.' },
  { question: 'How long does stair recapping take?', answer: 'Most standard 13-step Markham staircases take 2–3 days — removal, prep, installation, staining, and polyurethane. An extra day of drying may be needed before heavy use. We confirm the exact timeline at the free assessment.' },
  { question: 'Which Markham neighbourhoods do you serve?', answer: 'All of them — Unionville, Cornell, Cachet, Cathedraltown, Markham Village, Berczy Village, Wismer, Greensborough, Angus Glen and Milliken. Our Highway 7 showroom is central to Markham, so site visits are quick. Call (647) 428-1111.' },
];

export const metadata = {
  title: 'Stair Recapping Markham | New Hardwood Treads $185/Step | BBS Flooring',
  description: 'Stair recapping & cladding in Markham — new solid-hardwood treads and risers over your existing staircase. No demolition. From $185/step, custom colour-matched, 2-3 day turnaround. Serving Unionville, Cornell, Cathedraltown. WSIB insured. (647) 428-1111.',
  alternates: { canonical: '/stair-recapping-markham' },
};

const DATA = {
  city: CITY,
  breadcrumbPath: '/stair-recapping-markham',
  schemaId: 'faq-stair-recapping-markham',
  heroSubtitle: 'New solid-hardwood treads and risers installed over your existing Markham staircase — no demolition, no rebuild. A brand-new staircase for a fraction of replacement cost, custom colour-matched to your floors.',
  answer: [
    { t: 'Stair recapping in ' },
    { b: 'Markham' },
    { t: ' costs ' },
    { b: '$185 per step' },
    { t: ' for straight treads (old-surface removal included) and ' },
    { b: '$225 per step' },
    { t: ' for pie or bullnose steps. A typical 13-step Markham staircase runs about ' },
    { b: '$2,400–$3,300' },
    { t: ', finished in 2–3 days and custom-stained to match your floors.' },
  ],
  whyHereTitle: 'Why Markham Homes Recap Their Stairs',
  whyHereParagraphs: [
    'Markham grew fastest through the 1990s and 2000s — Cornell, Cathedraltown, Berczy Village, Wismer and Greensborough filled with two-storey homes finished with carpeted staircases over plywood or MDF treads. Two decades of foot traffic later, those carpeted stairs are the most dated, worn surface in the house and the first thing anyone sees at the front door.',
    'Recapping is the highest-return way to fix that. Because Markham\'s builder staircases have solid, code-built frames, there\'s no reason to tear them out — we install real solid-hardwood treads and risers directly over the existing structure. No demolition, no structural carpentry, and the staircase reads as a seamless, finished upgrade that matches the main-floor flooring.',
    'Markham is BBS\'s home city. Our Highway 7 showroom is central to every neighbourhood here, so assessments are quick and our stair crew knows the local housing stock inside out — from Unionville century homes to the newest Angus Glen builds.',
  ],
  neighbourhoodsIntro: 'Our stair crew recaps staircases across every Markham neighbourhood, from the established homes around Unionville and Markham Village to the newer subdivisions in Cornell, Cathedraltown and Angus Glen.',
  neighbourhoods: ['Unionville', 'Cornell', 'Cachet', 'Cathedraltown', 'Markham Village', 'Berczy Village', 'Wismer', 'Greensborough', 'Angus Glen', 'Milliken', 'Thornhill', 'Box Grove'],
  faqItems: FAQ_ITEMS,
  spokeLinks: [
    { href: '/carpet-to-hardwood-stairs', label: 'Carpet to Hardwood Stairs', description: 'Rip out the carpet and recap with beautiful hardwood treads' },
    { href: '/stair-refinishing-markham', label: 'Stair Refinishing in Markham', description: 'Sand & restain existing hardwood stairs to like-new' },
    { href: '/hardwood-flooring-markham', label: 'Hardwood Flooring Markham', description: 'Match your recapped stairs to real hardwood floors throughout the home' },
    { href: '/engineered-hardwood', label: 'Engineered Hardwood', description: 'Stable real-wood floors for concrete and radiant-heat homes' },
    { route: 'FreeMeasurement', label: 'Free In-Home Measurement', description: 'Book a free stair assessment and quote in Markham' },
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd data={[
        carpetToHardwoodStairsServiceSchema(),
        cityLocalBusinessSchema(CITY, 'Stair recapping and cladding in Markham — new solid-hardwood treads and risers over your existing staircase from $185/step, custom colour-matched. Serving Unionville, Cornell, Cathedraltown and all Markham neighbourhoods.'),
        faqSchema(FAQ_ITEMS),
      ]} />
      <Suspense><StairRecappingCityClient data={DATA} /></Suspense>
    </>
  );
}
