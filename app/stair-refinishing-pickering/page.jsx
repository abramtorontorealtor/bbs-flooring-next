import { Suspense } from 'react';
import StairRefinishingCityClient from '@/components/StairRefinishingCityClient';
import { faqSchema, stairRefinishingServiceSchema, cityLocalBusinessSchema, JsonLd } from '@/lib/schemas';

const CITY = 'Pickering';

const FAQ_ITEMS = [
  { question: 'How much does staircase refinishing cost in Pickering?', answer: 'Sand & restain refinishing is $125/step, recapping with new hardwood treads is $185/step, and a full carpet-to-hardwood conversion runs about $200/step. A typical 13-step Pickering staircase refinish is roughly $1,625. Call (647) 428-1111 for a free in-home quote.' },
  { question: 'Do you serve Pickering and Durham for stair work?', answer: 'Yes — Durham is a core service area for BBS. We regularly work in Pickering, Ajax, Whitby and Oshawa. Most specialist stair companies concentrate on central Toronto and York Region, so Pickering homeowners often struggle to find a dedicated stair crew — we cover it directly.' },
  { question: 'Can you refinish the existing hardwood stairs in older Pickering homes?', answer: 'Yes. Many established Rosebank, Bay Ridges and Amberlea homes have solid-oak treads that have gone dull or scratched. We sand them dust-contained, custom-stain to your colour, and finish with 2–3 coats of commercial-grade polyurethane. $125/step.' },
  { question: 'Can you match my refinished stairs to my Pickering floors?', answer: 'Yes. We custom-stain stair treads to match any existing hardwood, testing patches on your actual stairs first. If we are refinishing your main floors and stairs together, we guarantee a perfect colour match across the home.' },
  { question: 'How long does stair refinishing take?', answer: 'Refinishing only (sanding + staining) takes 1–2 days plus drying time. Recapping with new treads is 2–3 days, and a full carpet-to-hardwood conversion is 3–5 days. We give an exact timeline at the free assessment.' },
  { question: 'Which Pickering neighbourhoods do you serve?', answer: 'All of them — Rosebank, West Shore, Bay Ridges, Amberlea, Liverpool, Highbush, Brock Ridge and the new Seaton community. We also cover Ajax and Whitby. Call (647) 428-1111.' },
];

export const metadata = {
  title: 'Staircase Refinishing Pickering | Sand & Restain $125/Step | BBS Flooring',
  description: 'Staircase refinishing in Pickering & Durham — sand & restain existing hardwood stairs from $125/step, recapping from $185/step. Dust-contained, custom colour-matched, WSIB insured. Serving Rosebank, Amberlea, Bay Ridges, Seaton. Free estimate: (647) 428-1111.',
  alternates: { canonical: '/stair-refinishing-pickering' },
};

const DATA = {
  city: CITY,
  breadcrumbPath: '/stair-refinishing-pickering',
  schemaId: 'faq-stair-refinishing-pickering',
  heroSubtitle: 'Restore worn or dated hardwood stairs — or convert carpet — into a stunning Pickering focal point. Dust-contained sanding, custom staining, and honest per-step pricing across Rosebank, Amberlea and all of Durham.',
  answer: [
    { t: 'Staircase refinishing in ' },
    { b: 'Pickering' },
    { t: ' costs ' },
    { b: '$125 per step' },
    { t: ' to sand and restain existing solid-hardwood treads, or ' },
    { b: '$185 per step' },
    { t: ' to recap with new hardwood when the treads can\'t be saved. A typical 13-step Pickering refinish runs about ' },
    { b: '$1,625' },
    { t: ', finished in 1–2 days and custom-stained to match your floors.' },
  ],
  whyHereTitle: 'Why Pickering Homeowners Choose BBS for Stairs',
  whyHereParagraphs: [
    'Pickering and the wider Durham region are underserved when it comes to dedicated stair work. Most GTA stair specialists cluster in central Toronto, Vaughan and Richmond Hill, which leaves Pickering homeowners hunting for a crew that will actually make the trip east. Durham is a core service area for BBS — we work in Pickering, Ajax, Whitby and Oshawa regularly, and our free in-home assessment covers the whole region.',
    'The right stair fix depends on the home. Established Rosebank, Bay Ridges and Amberlea homes often have solid-oak staircases where the treads have simply dulled or scratched over the years — those get sanded and restained at $125/step, the most affordable stair upgrade there is. We use HEPA-filtered dust-contained sanding, colour-match the stain to your floors with test patches on your actual stairs, and finish with 2–3 coats of commercial-grade polyurethane.',
    'Newer builds in Liverpool, Brock Ridge and the fast-growing Seaton community usually have carpeted plywood or MDF stairs instead — those can\'t be sanded, so we recap with new hardwood at $185/step. On the railing, most Pickering customers keep and refinish what they have rather than replacing it. We tell you exactly which path your stairs need at the free visit.',
  ],
  neighbourhoodsIntro: 'Our stair crew refinishes staircases across every Pickering neighbourhood, from the established homes of Rosebank and Bay Ridges to the new Seaton community — and throughout Ajax and Whitby.',
  neighbourhoods: ['Rosebank', 'West Shore', 'Bay Ridges', 'Amberlea', 'Liverpool', 'Highbush', 'Brock Ridge', 'Seaton', 'Dunbarton', 'Village East'],
  faqItems: FAQ_ITEMS,
  spokeLinks: [
    { href: '/stair-recapping', label: 'Stair Recapping & Cladding', description: 'New hardwood treads over the structure when treads can\'t be saved' },
    { href: '/carpet-to-hardwood-stairs', label: 'Carpet to Hardwood Stairs', description: 'Rip out the carpet and reveal or install hardwood treads' },
    { route: 'HardwoodRefinishing', label: 'Hardwood Floor Refinishing', description: 'Sand & restain your main-floor hardwood to match the stairs' },
    { route: 'Stairs', label: 'Staircase Installation & Renovation', description: 'Full staircase renovation — treads, railings, pickets and more' },
    { route: 'FreeMeasurement', label: 'Free In-Home Measurement', description: 'Book a free stair assessment and quote in Pickering' },
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd data={[
        stairRefinishingServiceSchema(),
        cityLocalBusinessSchema(CITY, 'Staircase refinishing in Pickering and Durham — sand & restain existing hardwood stairs from $125/step, recapping from $185/step, custom colour-matched. Serving Rosebank, Amberlea, Bay Ridges, Seaton and all Pickering neighbourhoods.'),
        faqSchema(FAQ_ITEMS),
      ]} />
      <Suspense><StairRefinishingCityClient data={DATA} /></Suspense>
    </>
  );
}
