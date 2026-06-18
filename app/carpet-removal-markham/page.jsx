import { Suspense } from 'react';
import CarpetRemovalMarkhamClient from '@/components/CarpetRemovalMarkhamClient';
import {
  faqSchema,
  carpetRemovalSchemas,
  cityLocalBusinessSchema,
  JsonLd,
} from '@/lib/schemas';

// carpetRemovalSchemas() returns [Service, FAQPage]; take only the Service node
// here and supply a fuller Markham-specific FAQPage via faqSchema() below.
const carpetRemovalService = carpetRemovalSchemas()[0];

const FAQ_ITEMS = [
  { question: 'How much does carpet removal cost in Markham?', answer: 'Carpet removal is $1.00/sqft plus a $75 haul-away fee. A typical 1,000 sqft Markham home is about $1,075 including disposal. We leave a clean, install-ready subfloor. Call (647) 428-1111 for a free quote.' },
  { question: 'How fast can you remove carpet in Markham?', answer: 'Most Markham carpet-removal jobs are done in a single day, and we offer 24-hour turnaround. Because our showroom is on Highway 7 in Markham, we can often schedule same-week — sometimes next-day for urgent jobs.' },
  { question: 'Do you remove the tack strips and staples too?', answer: 'Yes. Our price includes pulling the carpet, underpad, tack strips, and staples, then patching nail holes so the subfloor is ready for your new flooring. You are not left with a half-finished demo.' },
  { question: 'Can you remove carpet and install new flooring in the same visit?', answer: 'Yes — most Markham customers pair carpet removal with new vinyl, laminate, or hardwood. Bundling the demo with installation saves a trip charge and gets you a finished floor faster. We will quote both together.' },
  { question: 'Do you haul away and dispose of the old carpet?', answer: 'Yes. The $75 haul-away fee covers loading and responsible disposal of the old carpet and underpad — you do not have to deal with the dump or your municipal pickup limits.' },
  { question: 'Which Markham areas do you serve for carpet removal?', answer: 'All of Markham — Unionville, Cornell, Cachet, Cathedraltown, Markham Village, Berczy Village, Wismer, Greensborough, Angus Glen, Milliken and beyond, plus the wider GTA and Durham Region.' },
];

export const metadata = {
  title: 'Carpet Removal in Markham 2026 | $1.00/sqft + Haul-Away | BBS Flooring',
  description: 'Professional carpet removal in Markham for $1.00/sqft + $75 haul-away. Tack strips, staples & underpad removed, install-ready subfloor, 24-hr turnaround. Serving Unionville, Cornell, Cachet & all Markham. WSIB insured. Call (647) 428-1111.',
  alternates: { canonical: '/carpet-removal-markham' },
};

export default function CarpetRemovalMarkhamPage() {
  return (
    <>
      <JsonLd
        data={[
          carpetRemovalService,
          cityLocalBusinessSchema(
            'Markham',
            'Carpet removal in Markham — $1.00/sqft plus haul-away, tack strips and staples removed, install-ready subfloor with 24-hour turnaround. Serving Unionville, Cornell, Cathedraltown and all Markham neighbourhoods.'
          ),
          faqSchema(FAQ_ITEMS),
        ]}
      />
      <Suspense><CarpetRemovalMarkhamClient /></Suspense>
    </>
  );
}
