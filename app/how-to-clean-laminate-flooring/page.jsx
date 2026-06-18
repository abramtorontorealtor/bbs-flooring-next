import { Suspense } from 'react';
import CleanLaminateClient from '@/components/CleanLaminateClient';
import { faqSchema, JsonLd } from '@/lib/schemas';

const faqItems = [
  {
    question: 'Can I use a steam mop on laminate flooring?',
    answer: 'No — never. Laminate has a fibreboard (HDF) core that swells permanently when moisture reaches it. A steam mop forces hot water into the seams, causing the planks to swell, bubble, and lift at the edges. This is irreversible and voids the warranty. Use a barely-damp microfibre mop instead.',
  },
  {
    question: 'Is laminate flooring waterproof?',
    answer: 'No. Laminate is water-RESISTANT, not waterproof. The surface repels water briefly, but the HDF core underneath swells if water sits on it or seeps into the seams. Wipe spills immediately and only ever use a barely-damp mop. If you need a truly waterproof floor for a bathroom or basement, vinyl plank is the better choice.',
  },
  {
    question: 'What is the best way to clean laminate floors?',
    answer: 'Dry dust-mop or vacuum (no beater bar) to remove grit, then clean with a barely-damp microfibre mop and a laminate-specific or pH-neutral cleaner — sprayed lightly onto the mop, never poured on the floor. Dry as you go. The golden rule: the floor should look damp for only a few seconds, then be dry.',
  },
  {
    question: 'Can you use vinegar on laminate flooring?',
    answer: 'It is not recommended. While some people use a heavily diluted vinegar solution, the acidity can dull the laminate wear layer over time and the extra moisture risks swelling the seams. A laminate-specific or pH-neutral cleaner applied to a barely-damp mop is safer and just as effective.',
  },
  {
    question: 'Can laminate flooring be refinished?',
    answer: 'No. Unlike hardwood, laminate cannot be sanded or refinished — the decorative layer is a printed photo under a wear coating, not real wood. Once the wear layer is worn through or a plank is water-damaged, that section must be replaced. This is why preventing moisture and scratches is so important with laminate.',
  },
  {
    question: 'How do I fix a swollen or bubbled laminate plank?',
    answer: 'A swollen plank cannot be repaired — the HDF core has expanded permanently. The affected plank (or planks) must be replaced. On click-lock floors you can sometimes unclick rows back to the damaged plank and swap it. Address the moisture source first, or it will happen again.',
  },
];

export const metadata = {
  title: 'How to Clean Laminate Flooring — The Right Way (2026) | BBS Flooring',
  description: 'How to clean laminate floors the right way: the barely-damp method, the best cleaners, and why steam mops, vinegar & wet-mopping ruin laminate (it is water-resistant, not waterproof). Markham flooring experts.',
  alternates: { canonical: '/how-to-clean-laminate-flooring' },
};

export default function Page() {
  return (
    <>
      <JsonLd data={faqSchema(faqItems)} />
      <Suspense>
        <CleanLaminateClient />
      </Suspense>
    </>
  );
}
