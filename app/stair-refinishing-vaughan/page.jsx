import { Suspense } from 'react';
import StairRefinishingCityClient from '@/components/StairRefinishingCityClient';
import { faqSchema, stairRefinishingServiceSchema, cityLocalBusinessSchema, JsonLd } from '@/lib/schemas';

const CITY = 'Vaughan';

const FAQ_ITEMS = [
  { question: 'How much does staircase refinishing cost in Vaughan?', answer: 'Sand & restain refinishing is $125/step, recapping with new hardwood treads is $185/step, and a full carpet-to-hardwood conversion runs about $200/step. A typical 13-step Vaughan staircase refinish is roughly $1,625. Call (647) 428-1111 for a free in-home quote.' },
  { question: 'Can you refinish the existing hardwood stairs in older Woodbridge homes?', answer: 'Yes — that\'s exactly what refinishing is for. Many established Woodbridge and Maple homes have solid oak treads that have gone dull or scratched. We sand them dust-contained, custom-stain to your colour, and apply 2–3 coats of commercial-grade polyurethane. $125/step.' },
  { question: 'Do I need to refinish the railing too?', answer: 'Not necessarily. About 9 in 10 Vaughan customers keep and refinish the existing railing to match the treads ($25/lf), rather than replacing it. If you want a more modern look, we can swap in iron pickets at $25 each while keeping the posts and handrail.' },
  { question: 'Can you match my refinished stairs to my Vaughan floors?', answer: 'Yes. We custom-stain stair treads to match any existing hardwood, testing patches on your actual stairs first. If we are refinishing your main floors and stairs together, we guarantee a perfect colour match across the home.' },
  { question: 'How long does stair refinishing take?', answer: 'Refinishing only (sanding + staining) takes 1–2 days plus drying time. Recapping with new treads is 2–3 days, and a full carpet-to-hardwood conversion is 3–5 days. We give an exact timeline at the free assessment.' },
  { question: 'Which Vaughan neighbourhoods do you serve?', answer: 'All of them — Woodbridge, Maple, Vellore Village, Kleinburg, Thornhill, Concord, Patterson and Sonoma Heights. Our Highway 7 showroom in Markham serves all of Vaughan. Call (647) 428-1111.' },
];

export const metadata = {
  title: 'Staircase Refinishing Vaughan | Sand & Restain $125/Step | BBS Flooring',
  description: 'Staircase refinishing in Vaughan — sand & restain existing hardwood stairs from $125/step, recapping from $185/step. Dust-contained, custom colour-matched, WSIB insured. Serving Woodbridge, Maple, Vellore Village, Kleinburg. Free estimate: (647) 428-1111.',
  alternates: { canonical: '/stair-refinishing-vaughan' },
};

const DATA = {
  city: CITY,
  breadcrumbPath: '/stair-refinishing-vaughan',
  schemaId: 'faq-stair-refinishing-vaughan',
  heroSubtitle: 'Restore worn or dated hardwood stairs — or convert carpet — into a stunning Vaughan focal point. Dust-contained sanding, custom staining, and honest per-step pricing across Woodbridge, Maple and all of Vaughan.',
  answer: [
    { t: 'Staircase refinishing in ' },
    { b: 'Vaughan' },
    { t: ' costs ' },
    { b: '$125 per step' },
    { t: ' to sand and restain existing solid-hardwood treads, or ' },
    { b: '$185 per step' },
    { t: ' to recap with new hardwood when the treads can\'t be saved. A typical 13-step Vaughan refinish runs about ' },
    { b: '$1,625' },
    { t: ', finished in 1–2 days and custom-stained to match your floors.' },
  ],
  whyHereTitle: 'Why Vaughan Homes Refinish Their Stairs',
  whyHereParagraphs: [
    'Vaughan has a wide mix of housing ages, and that shapes the right stair fix. Established Woodbridge and Maple homes from the 1980s and early 1990s were often built with genuine solid-oak staircases — treads that have simply gone dull, scratched, or dated with a yellowed finish. Those don\'t need to be replaced; they need to be sanded and restained, which is the most affordable stair upgrade we offer at $125/step.',
    'Refinishing brings a tired staircase back to life for a fraction of a rebuild. We use HEPA-filtered dust-contained sanding, custom-match the stain to your floors with test patches on your actual stairs, and finish with 2–3 coats of commercial-grade polyurethane. Most Vaughan refinishes are done in one to two days plus drying.',
    'Newer Vellore Village, Patterson and Kleinburg builds usually have plywood or MDF treads under carpet instead — those can\'t be sanded, so we recap with new hardwood at $185/step. On the railing, about 9 in 10 Vaughan customers keep and refinish what they have rather than replacing it. We tell you exactly which path your stairs need at the free in-home visit.',
  ],
  neighbourhoodsIntro: 'Our stair crew refinishes staircases across every Vaughan neighbourhood, from the established homes of Woodbridge and Maple to the newer subdivisions in Vellore Village, Patterson and Kleinburg.',
  neighbourhoods: ['Woodbridge', 'Maple', 'Vellore Village', 'Kleinburg', 'Thornhill', 'Concord', 'Patterson', 'Sonoma Heights', 'Vaughan Mills', 'West Woodbridge'],
  faqItems: FAQ_ITEMS,
  spokeLinks: [
    { href: '/stair-recapping-vaughan', label: 'Stair Recapping Vaughan', description: 'New hardwood treads over the structure when treads can\'t be saved' },
    { href: '/carpet-to-hardwood-stairs-vaughan', label: 'Carpet to Hardwood Stairs Vaughan', description: 'Rip out the carpet and reveal or install hardwood treads' },
    { href: '/hardwood-flooring-vaughan', label: 'Hardwood Flooring Vaughan', description: 'Match your refinished stairs to freshly refinished hardwood floors' },
    { route: 'HardwoodRefinishing', label: 'Hardwood Floor Refinishing', description: 'Sand & restain your main-floor hardwood to match the stairs' },
    { route: 'FreeMeasurement', label: 'Free In-Home Measurement', description: 'Book a free stair assessment and quote in Vaughan' },
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd data={[
        stairRefinishingServiceSchema(),
        cityLocalBusinessSchema(CITY, 'Staircase refinishing in Vaughan — sand & restain existing hardwood stairs from $125/step, recapping from $185/step, custom colour-matched. Serving Woodbridge, Maple, Vellore Village, Kleinburg and all Vaughan neighbourhoods.'),
        faqSchema(FAQ_ITEMS),
      ]} />
      <Suspense><StairRefinishingCityClient data={DATA} /></Suspense>
    </>
  );
}
