import { Suspense } from 'react';
import CleanEngineeredHardwoodClient from '@/components/CleanEngineeredHardwoodClient';
import { faqSchema, JsonLd } from '@/lib/schemas';

const faqItems = [
  {
    question: 'Can I use a steam mop on engineered hardwood?',
    answer: 'No. Never use a steam mop on engineered hardwood. The heat and forced moisture penetrate the seams, swell the wood layers, lift the finish, and delaminate the plank from its plywood core. Steam damage is permanent and voids virtually every engineered hardwood warranty. Use a barely-damp microfibre mop instead.',
  },
  {
    question: 'How often should I clean engineered hardwood floors?',
    answer: 'Dry dust-mop or vacuum (hard-floor setting, no beater bar) every day or two in high-traffic areas to remove grit that scratches the finish. Damp-mop with a pH-neutral hardwood cleaner once a week. Deep-clean and re-apply protection seasonally. Grit is the #1 enemy — it sands the finish off every time someone walks across it.',
  },
  {
    question: 'What is the best cleaner for engineered hardwood?',
    answer: 'A pH-neutral hardwood floor cleaner (Bona, Method Squirt+Mop, or any product labelled "for sealed/finished hardwood"). Avoid vinegar, ammonia, bleach, oil soaps (Murphy Oil), wax, and all-purpose sprays — they dull, etch, or build up on the finish. When in doubt, plain water on a wrung-out microfibre is safer than the wrong cleaner.',
  },
  {
    question: 'Can engineered hardwood be wet-mopped?',
    answer: 'No. Standing water is the fastest way to ruin engineered hardwood. Wood swells when it absorbs moisture, and engineered planks cup, gap, or delaminate. Always wring the mop until it is barely damp, mop with the grain, and dry any excess immediately. Water should evaporate in under a minute.',
  },
  {
    question: 'Can you refinish engineered hardwood?',
    answer: 'Sometimes — it depends on the wear-layer thickness. Engineered floors with a 3mm+ veneer can usually be sanded and refinished once or twice; thin 0.6–2mm wear layers generally cannot. Check your specific product spec before assuming. If your finish is worn but the floor is structurally sound, ask us about a refinish before replacing.',
  },
  {
    question: 'What humidity level is best for engineered hardwood?',
    answer: 'Keep indoor relative humidity between 35% and 55% year-round. Too dry (winter heating) causes gaps and cracks; too humid (summer) causes cupping and swelling. A simple hygrometer plus a humidifier/dehumidifier protects the floor far more than any cleaning product.',
  },
];

export const metadata = {
  title: 'How to Clean Engineered Hardwood Floors — The Right Way (2026) | BBS Flooring',
  description: 'How to clean engineered hardwood the right way: daily, weekly & seasonal routines, the pH-neutral cleaners to use, and why steam mops & vinegar destroy your floor. Markham flooring experts.',
  alternates: { canonical: '/how-to-clean-engineered-hardwood' },
};

export default function Page() {
  return (
    <>
      <JsonLd data={faqSchema(faqItems)} />
      <Suspense>
        <CleanEngineeredHardwoodClient />
      </Suspense>
    </>
  );
}
