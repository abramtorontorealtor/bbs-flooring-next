import { Suspense } from 'react';
import LaminateFlooringGuideClient from '@/components/LaminateFlooringGuideClient';
import { faqSchema, localBusinessSchema, JsonLd } from '@/lib/schemas';

const faqItems = [
  {
    question: 'How much does laminate flooring cost in Toronto?',
    answer: 'At BBS Flooring in Markham, laminate material ranges from $1.49–$3.29/sqft. Installation adds $2.00/sqft for click-lock floating installation. For a typical 500 sqft project, total installed cost is approximately $1,745–$2,645 — making laminate the most affordable hard-surface flooring option in the GTA.',
  },
  {
    question: 'Is laminate flooring waterproof?',
    answer: 'Traditional laminate is water-resistant but not fully waterproof — the HDF core can swell if submerged. However, modern waterproof laminate (like our 12mm Evergreen and 14mm NAF lines) uses sealed edges and wax-coated cores to handle splashes and spills. For truly wet areas (bathrooms, laundry), we recommend vinyl (LVP) instead.',
  },
  {
    question: 'What AC rating do I need for my home?',
    answer: 'AC3 is suitable for light residential use (bedrooms, guest rooms). AC4 handles moderate-to-heavy residential traffic (living rooms, hallways, kitchens) and light commercial use. AC5 is commercial-grade and handles the heaviest traffic. For most GTA homes, AC4 is the sweet spot — durable enough for kids and pets without overpaying.',
  },
  {
    question: 'Can laminate flooring be refinished?',
    answer: 'No. Unlike solid or engineered hardwood, laminate cannot be sanded or refinished. The decorative layer is a printed image beneath a wear layer — once the wear layer is through, the plank needs to be replaced. This is why choosing the right AC rating matters upfront. Quality laminate lasts 15–25 years before needing replacement.',
  },
  {
    question: 'Is 12mm laminate better than 8mm?',
    answer: 'Yes, for most applications. 12mm laminate is more durable, feels more solid underfoot, produces less hollow sound when walked on, and better hides minor subfloor imperfections. At BBS Flooring, all our laminate is 12mm or thicker — we don\'t carry thin, low-quality laminate. Our premium NAF line is 14mm with pre-attached IXPE underpad.',
  },
  {
    question: 'Can laminate be installed in a basement?',
    answer: 'Yes, with caveats. Modern laminate with waterproof features can go in dry basements over a moisture barrier underlay. However, if your basement has any history of water intrusion, seepage, or high humidity, vinyl (LVP) is the safer choice. Our installers test moisture levels during the free in-home measurement.',
  },
  {
    question: 'Does laminate flooring need underlay?',
    answer: 'Yes — unless the laminate has pre-attached underpad (like our NAF 14mm line with IXPE). Underlay provides sound absorption, moisture barrier, and thermal insulation. We recommend 3mm foam or cork underlay for most installations. Never double up underlays — it causes the click-lock joints to fail.',
  },
  {
    question: 'How long does laminate installation take?',
    answer: 'Laminate is one of the fastest flooring types to install. A standard 500 sqft room takes 1 day for floating click-lock installation. This includes subfloor prep, underlay, laminate installation, and transitions. BBS Flooring handles old flooring removal and baseboard work in the same visit.',
  },
  {
    question: 'Is laminate good for pets?',
    answer: 'Laminate is excellent for pets. The wear layer resists scratches from claws (choose AC4 or higher), it doesn\'t absorb odours like carpet, and spills wipe up easily. The main caution: laminate can be slippery — look for products with textured (EIR) surfaces for better traction.',
  },
  {
    question: 'What brands of laminate do you carry?',
    answer: 'BBS Flooring carries 145 laminate options from 9 brands: NAF Flooring (32 options, 14mm premium), Tosca Floors (21, from $1.49/sqft — our value leader), Northernest (18), Simba (18), Triforest (16), Evergreen (16, 12mm waterproof), Falcon (12), Woden (6), and Golden Choice (6). Visit our Markham showroom to see samples.',
  },
];

export const metadata = {
  title: 'Laminate Flooring Guide 2026 | AC Ratings, Costs & Best Brands | BBS Flooring',
  description: 'Complete guide to laminate flooring in Canada. AC ratings explained, 12mm vs 14mm, waterproof options, real 2026 pricing. 145 options from $1.49/sqft at BBS Flooring Markham.',
  alternates: { canonical: '/laminate-flooring-guide' },
};

export default function LaminateFlooringGuidePage() {
  return (
    <>
      <JsonLd data={[localBusinessSchema(), faqSchema(faqItems)]} />
      <Suspense>
        <LaminateFlooringGuideClient />
      </Suspense>
    </>
  );
}
