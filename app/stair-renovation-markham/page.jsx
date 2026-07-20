import { Suspense } from 'react';
import StairRenovationMarkhamClient from '@/components/StairRenovationMarkhamClient';
import { faqSchema, stairRefinishingServiceSchema, cityLocalBusinessSchema, JsonLd } from '@/lib/schemas';

const FAQ_ITEMS = [
  { question: 'How much does a full stair renovation cost in Markham?', answer: 'It depends on scope. A sand-and-restain refinish is about $1,625 for a 13-step staircase; recapping with new hardwood treads runs $2,400–$3,300; a full renovation with new treads, iron pickets and railing work is typically $3,500–$5,500+. We give an exact quote at the free in-home visit. Call (647) 428-1111.' },
  { question: 'What does a stair renovation include?', answer: 'Everything from the treads up: new or refinished hardwood treads and risers, iron pickets or new balusters, refinished or new railings and newel posts, stringer work, carpet removal, and custom staining to match your floors. We coordinate the whole staircase as one finished look.' },
  { question: 'Do I have to replace my railing, or can you refinish it?', answer: 'You don\'t have to replace it. About 9 in 10 Markham customers keep and refinish the existing railing to match the new treads. If you want a more modern look, the highest-impact upgrade is usually swapping wood spindles for iron pickets while keeping the posts and handrail.' },
  { question: 'Can you modernise a 1990s Markham builder staircase?', answer: 'Absolutely — it\'s one of our most common jobs. Carpeted MDF builder stairs in Cornell, Cathedraltown, Wismer and Greensborough are recapped with new hardwood treads and risers, wood spindles are replaced with iron pickets, and the railing is refinished to match. The result looks like a brand-new custom staircase.' },
  { question: 'How long does a stair renovation take?', answer: 'A refinish is 1–2 days plus drying; recapping is 2–3 days; a full renovation with railing and picket work is typically 3–5 days. We confirm the exact timeline at the free assessment and respect your schedule.' },
  { question: 'Which Markham neighbourhoods do you serve?', answer: 'All of them — Unionville, Cornell, Cachet, Cathedraltown, Markham Village, Berczy Village, Wismer, Greensborough, Angus Glen and Milliken. Our Highway 7 showroom is central to Markham, so site visits are quick. Call (647) 428-1111.' },
];

export const metadata = {
  title: 'Stair Renovation Markham | Treads, Railings & Iron Pickets | BBS Flooring',
  description: 'Full staircase renovation in Markham — new hardwood treads, iron pickets, refinished railings, newel posts and structural work. Custom colour-matched, WSIB insured. Typical full reno $3,500–$5,500. Serving Unionville, Cornell, Cathedraltown. (647) 428-1111.',
  alternates: { canonical: '/stair-renovation-markham' },
};

export default function Page() {
  return (
    <>
      <JsonLd data={[
        stairRefinishingServiceSchema(),
        cityLocalBusinessSchema('Markham', 'Full staircase renovation in Markham — new hardwood treads, iron pickets, refinished or new railings, newel posts and structural work, custom colour-matched. Serving Unionville, Cornell, Cathedraltown and all Markham neighbourhoods.'),
        faqSchema(FAQ_ITEMS),
      ]} />
      <Suspense><StairRenovationMarkhamClient /></Suspense>
    </>
  );
}
