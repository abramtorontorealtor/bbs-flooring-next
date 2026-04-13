import { Suspense } from 'react';
import CarpetToHardwoodStairsClient from '@/components/CarpetToHardwoodStairsClient';
import { faqSchema, carpetToHardwoodStairsServiceSchema, JsonLd } from '@/lib/schemas';

const FAQ_ITEMS = [
  { question: 'How much does it cost to convert carpet stairs to hardwood?', answer: 'A full carpet-to-hardwood conversion costs $200–$400 per step, including carpet removal, new hardwood treads and risers, staining, and finish. A typical 13-step staircase runs $2,600–$5,200 total. Call (647) 428-1111 for a free quote.' },
  { question: 'How long does carpet to hardwood stair conversion take?', answer: 'Most standard 13-step staircases take 2–3 days. This includes carpet removal, prep, installation, staining, and at least one coat of polyurethane. An additional day of drying may be needed before heavy use.' },
  { question: 'Can you match stair treads to my existing hardwood floors?', answer: 'Yes. We custom-stain stair treads to match your existing floors. If you\'re doing floors and stairs together, we guarantee a perfect match since we\'re using the same materials and stain.' },
  { question: 'What\'s under my carpet stairs?', answer: 'About 60% of the time, there\'s salvageable plywood or hardwood underneath. In either case, we can make your stairs beautiful — either by refinishing the existing wood or recapping with new hardwood treads. We assess this during the free in-home visit.' },
  { question: 'Do you serve Pickering and Toronto for stair renovations?', answer: 'Yes. BBS Flooring installs stairs across the GTA including Markham, Pickering, Ajax, Toronto, Scarborough, Richmond Hill, Vaughan, and Durham Region.' },
  { question: 'Can I get vinyl stair caps instead of hardwood?', answer: 'Yes. Vinyl stair caps are a more budget-friendly option that still looks great. They\'re especially popular when the main floors are vinyl plank — everything matches perfectly. Ask about vinyl stair options during your free assessment.' },
];

export const metadata = {
  title: 'Carpet to Hardwood Stairs Markham & GTA 2026 | From $185/Step',
  description: 'Convert carpet stairs to hardwood in Markham & GTA. Recapping from $185/step, full conversion from $200/step. Custom staining, 2-3 day turnaround. WSIB insured. Call (647) 428-1111.',
  alternates: { canonical: '/carpet-to-hardwood-stairs' },
};

export default function CarpetToHardwoodStairsPage() {
  return (
    <>
      <JsonLd data={[carpetToHardwoodStairsServiceSchema(), faqSchema(FAQ_ITEMS)]} />
      <Suspense><CarpetToHardwoodStairsClient /></Suspense>
    </>
  );
}
