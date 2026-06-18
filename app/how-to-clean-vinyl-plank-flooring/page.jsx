import { Suspense } from 'react';
import CleanVinylPlankClient from '@/components/CleanVinylPlankClient';
import { faqSchema, JsonLd } from '@/lib/schemas';

const faqItems = [
  {
    question: 'Can I use a steam mop on vinyl plank flooring?',
    answer: 'No. Even though vinyl plank (LVP/SPC) is 100% waterproof, the heat from a steam mop is the problem — it softens the wear layer, can lift the adhesive on glue-down planks, and warp or gap floating click planks. Steam voids most vinyl warranties. Use a damp microfibre mop with a pH-neutral cleaner instead.',
  },
  {
    question: 'What is the best way to clean vinyl plank floors?',
    answer: 'Vinyl plank is the most forgiving floor to clean. Sweep or vacuum (no beater bar) to remove grit, then damp-mop with warm water or a pH-neutral floor cleaner. Because LVP is waterproof you can use a slightly wetter mop than on hardwood — just avoid steam, abrasive pads, and harsh solvents. Dry streaks with a microfibre cloth.',
  },
  {
    question: 'Can you use vinegar on vinyl plank flooring?',
    answer: 'A heavily diluted vinegar solution (about 1 cup per gallon of warm water) is generally safe for occasional cleaning of vinyl plank because the floor is not a finished wood surface. However, a pH-neutral floor cleaner is gentler and avoids any risk of dulling the wear layer over time. Never use undiluted vinegar, bleach, ammonia, or wax-based products.',
  },
  {
    question: 'How do I remove scuff marks from vinyl plank?',
    answer: 'Most scuff marks come off with a damp microfibre cloth or a melamine (Magic Eraser) sponge used gently. For stubborn marks, a little pH-neutral cleaner or a dab of baking soda on a damp cloth works. Avoid abrasive scouring pads or steel wool — they scratch the wear layer permanently.',
  },
  {
    question: 'Do you need to wax or polish vinyl plank flooring?',
    answer: 'No. Modern luxury vinyl plank has a factory-applied wear layer and never needs wax, polish, or sealant. Wax actually builds up, traps dirt, and creates a hazy, slippery film that is hard to remove. Just sweep and damp-mop — that is the entire maintenance routine.',
  },
  {
    question: 'Is vinyl plank really waterproof?',
    answer: 'Yes — quality SPC and WPC vinyl plank is 100% waterproof on the surface, which is why it is ideal for kitchens, bathrooms, basements, and laundry rooms. Standing water will not damage the plank itself. Note that large standing water can still seep into seams on click-lock floors over long periods, so wipe spills reasonably promptly.',
  },
];

export const metadata = {
  title: 'How to Clean Vinyl Plank Flooring — The Right Way (2026) | BBS Flooring',
  description: 'How to clean vinyl plank (LVP/SPC) the right way: simple daily & weekly routines, the best cleaners, removing scuffs, and why steam mops still damage waterproof vinyl. Markham flooring experts.',
  alternates: { canonical: '/how-to-clean-vinyl-plank-flooring' },
};

export default function Page() {
  return (
    <>
      <JsonLd data={faqSchema(faqItems)} />
      <Suspense>
        <CleanVinylPlankClient />
      </Suspense>
    </>
  );
}
