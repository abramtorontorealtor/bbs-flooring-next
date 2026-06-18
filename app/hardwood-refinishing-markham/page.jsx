import { Suspense } from 'react';
import HardwoodRefinishingMarkhamClient from '@/components/HardwoodRefinishingMarkhamClient';
import {
  faqSchema,
  hardwoodRefinishingServiceSchema,
  cityLocalBusinessSchema,
  JsonLd,
} from '@/lib/schemas';

const FAQ_ITEMS = [
  { question: 'How much does hardwood floor refinishing cost in Markham?', answer: 'Sand & refinish (natural) is $5.25/sqft and sand, stain & refinish is $6.25/sqft. A typical 1,000 sqft Markham main floor runs $5,250–$6,250 — usually 60–75% less than full replacement. Call (647) 428-1111 for a free in-home quote on your specific floors.' },
  { question: 'Do you refinish hardwood floors in all Markham neighbourhoods?', answer: 'Yes. We refinish hardwood across all of Markham including Unionville, Cornell, Cachet, Cathedraltown, Markham Village, Berczy Village, Wismer, Greensborough, Angus Glen, and Milliken. Our showroom is on Highway 7, so we are minutes from most Markham homes.' },
  { question: 'How long does hardwood refinishing take?', answer: 'A typical 1,000 sqft Markham home takes 3–5 days: 1 day sanding, 1 day staining (if applicable), and 1–2 days for polyurethane coats with drying time. Water-based finishes dry faster (2–3 hours between coats) than oil-based (8–12 hours).' },
  { question: 'Can the original 1990s builder hardwood in my Markham home be refinished?', answer: 'Almost always, yes. Solid 3/4" oak from Markham builds in the 1990s and 2000s can typically be sanded and refinished multiple times. We measure the remaining thickness during the free in-home assessment and tell you honestly whether refinishing or replacement is the smarter spend.' },
  { question: 'How dusty is the sanding process?', answer: 'We use HEPA-filtered vacuum attachments connected directly to the sander and seal off the work area, which dramatically reduces airborne dust versus old-school sanding. It is not 100% dust-free, but the rest of your Markham home stays clean.' },
  { question: 'Do you offer free estimates in Markham?', answer: 'Yes — every refinishing quote in Markham is free and in-home. We assess your floors, measure, check the wear layer, and give you an exact written price. Book online or call (647) 428-1111.' },
];

export const metadata = {
  title: 'Hardwood Floor Refinishing in Markham 2026 | From $5.25/sqft | BBS Flooring',
  description: 'Hardwood floor refinishing in Markham from $5.25/sqft. Dust-contained sanding, custom staining, polyurethane finish — 60–75% cheaper than replacement. Serving Unionville, Cornell, Cachet & all of Markham. Free in-home estimate: (647) 428-1111.',
  alternates: { canonical: '/hardwood-refinishing-markham' },
};

export default function HardwoodRefinishingMarkhamPage() {
  return (
    <>
      <JsonLd
        data={[
          hardwoodRefinishingServiceSchema(),
          cityLocalBusinessSchema(
            'Markham',
            'Hardwood floor refinishing in Markham — dust-contained sanding, custom staining, and polyurethane finishing from $5.25/sqft. Serving Unionville, Cornell, Cachet, Cathedraltown and all Markham neighbourhoods.'
          ),
          faqSchema(FAQ_ITEMS),
        ]}
      />
      <Suspense><HardwoodRefinishingMarkhamClient /></Suspense>
    </>
  );
}
