import { Suspense } from 'react';
import StairRefinishingClient from '@/components/StairRefinishingClient';
import { faqSchema, stairRefinishingServiceSchema, JsonLd } from '@/lib/schemas';

const FAQ_ITEMS = [
  { question: 'How long does staircase refinishing take?', answer: 'A typical 13-step staircase takes 2–3 days for recapping, or 3–5 days for a full carpet-to-hardwood conversion. Refinishing only (sanding + staining) takes 1–2 days plus drying time. We\'ll give you an exact timeline during the free quote.' },
  { question: 'Can you match my stair treads to my existing floors?', answer: 'Yes. We custom-stain stair treads to match any existing flooring. If we\'re installing your main floors and stairs together, we guarantee a perfect colour match.' },
  { question: 'Is stair recapping cheaper than replacing the whole staircase?', answer: 'Yes, significantly. Recapping installs new hardwood treads and risers over the existing staircase structure, so there\'s no demolition cost. It\'s typically 40–60% less than a full staircase rebuild and looks identical.' },
  { question: 'Do you remove old carpet from stairs?', answer: 'Yes. Carpet removal, tack strip removal, and nail patching are included in our carpet-to-hardwood conversion service. We handle the full job from demo to final coat.' },
  { question: 'What wood species are available for stair treads?', answer: 'We offer red oak, white oak, maple, hickory, and walnut stair treads. Engineered options are also available for compatibility with radiant heat or specific tread thicknesses. Visit our showroom to see samples.' },
];

export const metadata = {
  title: 'Staircase Refinishing Markham & GTA 2026 | Recapping $185/Step',
  description: 'Professional staircase refinishing in Markham & the GTA. Recapping from $185/step, refinishing from $125/step. Custom staining, WSIB insured. Free in-home assessment. Call (647) 428-1111.',
  alternates: { canonical: '/stair-refinishing' },
};

export default function StairRefinishingPage() {
  return (
    <>
      <JsonLd data={[stairRefinishingServiceSchema(), faqSchema(FAQ_ITEMS)]} />
      <Suspense><StairRefinishingClient /></Suspense>
    </>
  );
}
