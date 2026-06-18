import { Suspense } from 'react';
import StairRefinishingMarkhamClient from '@/components/StairRefinishingMarkhamClient';
import {
  faqSchema,
  stairRefinishingServiceSchema,
  cityLocalBusinessSchema,
  JsonLd,
} from '@/lib/schemas';

const FAQ_ITEMS = [
  { question: 'How much does staircase refinishing cost in Markham?', answer: 'Recapping with new hardwood treads is $185/step, sand & restain refinishing is $125/step, and a full carpet-to-hardwood conversion runs about $200/step. A typical 13-step Markham staircase is roughly $1,625–$2,600 depending on the option. Call (647) 428-1111 for a free in-home quote.' },
  { question: 'Do you recap carpeted builder stairs in Markham new builds?', answer: 'Yes — this is one of our most common Markham jobs. Many Cornell, Cathedraltown, Greensborough and Wismer homes were built with carpeted MDF stairs. We remove the carpet, install new solid oak treads and risers over the existing structure, and stain them to match your floors.' },
  { question: 'How long does stair refinishing take?', answer: 'A typical 13-step Markham staircase takes 2–3 days for recapping or 3–5 days for a full carpet-to-hardwood conversion. Refinishing only (sanding + staining) takes 1–2 days plus drying time. We give an exact timeline at the free assessment.' },
  { question: 'Can you match my new stairs to my existing Markham floors?', answer: 'Yes. We custom-stain treads to match any existing hardwood. If we are installing your main floors and stairs together, we guarantee a perfect colour match across the whole home.' },
  { question: 'Is recapping cheaper than rebuilding the staircase?', answer: 'Significantly. Recapping installs new hardwood over the existing staircase structure, so there is no demolition — typically 40–60% less than a full rebuild, and it looks identical to a brand-new staircase.' },
  { question: 'Which Markham neighbourhoods do you serve?', answer: 'All of them — Unionville, Cornell, Cachet, Cathedraltown, Markham Village, Berczy Village, Wismer, Greensborough, Angus Glen, Milliken and more. Our Highway 7 showroom is central to Markham, so site visits are quick.' },
];

export const metadata = {
  title: 'Staircase Refinishing in Markham 2026 | Recapping $185/Step | BBS Flooring',
  description: 'Staircase refinishing & recapping in Markham. New hardwood treads from $185/step, refinishing from $125/step, carpet-to-hardwood conversions. Custom colour-matched, WSIB insured. Serving Unionville, Cornell, Cachet & all Markham. Free estimate: (647) 428-1111.',
  alternates: { canonical: '/stair-refinishing-markham' },
};

export default function StairRefinishingMarkhamPage() {
  return (
    <>
      <JsonLd
        data={[
          stairRefinishingServiceSchema(),
          cityLocalBusinessSchema(
            'Markham',
            'Staircase refinishing and recapping in Markham — new hardwood treads from $185/step, refinishing from $125/step, and carpet-to-hardwood conversions. Serving Unionville, Cornell, Cathedraltown and all Markham neighbourhoods.'
          ),
          faqSchema(FAQ_ITEMS),
        ]}
      />
      <Suspense><StairRefinishingMarkhamClient /></Suspense>
    </>
  );
}
