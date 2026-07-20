import { Suspense } from 'react';
import StairRecappingClient from '@/components/StairRecappingClient';
import { faqSchema, carpetToHardwoodStairsServiceSchema, JsonLd } from '@/lib/schemas';

const FAQ_ITEMS = [
  { question: 'What is stair recapping?', answer: 'Stair recapping (also called stair cladding) means installing new solid-hardwood treads and risers directly over your existing staircase structure. There is no demolition and no structural rebuild — the frame stays, and you get a brand-new hardwood surface for a fraction of full replacement cost.' },
  { question: 'How much does stair recapping cost?', answer: 'New hardwood tread recapping is $185/step (straight), with old-surface removal included. Pie, triangle, or bullnose steps are $225/step. A typical 13-step staircase runs about $2,405–$3,300 with nosing; iron pickets add $25 each. Call (647) 428-1111 for a free in-home quote.' },
  { question: 'Is recapping cheaper than replacing the whole staircase?', answer: 'Yes — significantly. Because recapping reuses your existing staircase frame, there is no demolition, no structural carpentry, and far less labour. You get the same finished hardwood look at a fraction of a full rebuild, usually done in 2–3 days.' },
  { question: 'Can you recap stairs that currently have carpet?', answer: 'Absolutely — carpet stairs are our most common recapping job. We remove the carpet, underpad, and tack strips, then install new hardwood treads and risers over the structure. See our dedicated carpet-to-hardwood stairs page for details.' },
  { question: 'Will the new stairs match my existing floors?', answer: 'Yes. We custom-stain the new treads and risers to match your existing hardwood, applying test patches on your actual stairs first. If we are installing floors and stairs together, we guarantee a perfect colour match.' },
  { question: 'How long does stair recapping take?', answer: 'Most standard 13-step staircases take 2–3 days — removal, prep, installation, staining, and polyurethane. An extra day of drying may be needed before heavy use. We confirm the exact timeline at the free assessment.' },
];

export const metadata = {
  title: 'Stair Recapping & Cladding Markham & GTA | From $185/Step | BBS Flooring',
  description: 'Stair recapping across the GTA — new solid-hardwood treads and risers installed over your existing staircase. No demolition. From $185/step, custom colour-matched, 2-3 day turnaround. WSIB insured. Call (647) 428-1111.',
  alternates: { canonical: '/stair-recapping' },
};

export default function StairRecappingPage() {
  return (
    <>
      <JsonLd data={[carpetToHardwoodStairsServiceSchema(), faqSchema(FAQ_ITEMS)]} />
      <Suspense><StairRecappingClient /></Suspense>
    </>
  );
}
