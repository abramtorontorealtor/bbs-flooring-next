import { Suspense } from 'react';
import WaterproofLaminateClient from '@/components/WaterproofLaminateClient';
import { faqSchema, JsonLd } from '@/lib/schemas';
import DeepPageCapture from '@/components/DeepPageCapture';

const faqItems = [
  {
    question: 'Is waterproof laminate really waterproof?',
    answer: 'Yes. Modern 72-hour waterproof laminate has a sealed, water-resistant HDF core and tight locking joints that keep spills and standing water out for up to 72 hours — long enough to clean up any household spill or minor leak with no damage. It is a genuine waterproof floor, not the old water-resistant laminate that swelled at the edges. BBS carries Falcon Flooring 12mm 72-hour waterproof laminate in stock from $2.39/sqft in Markham.',
  },
  {
    question: 'Waterproof laminate vs SPC vinyl — which is better?',
    answer: 'Both are waterproof. The difference is feel and price. SPC vinyl has a stone-plastic composite core, so it is harder and colder underfoot. 12mm waterproof laminate is pressed wood, so it is noticeably warmer and quieter to walk on, and it looks and feels more like real wood. It is also thicker: our 12mm laminate (often 14mm with attached pad) is more substantial than most vinyl, yet starts at $2.39/sqft versus $4.35/sqft for our thickest 11mm vinyl. For most living areas, waterproof laminate is the warmer, better-value choice.',
  },
  {
    question: 'How thick is 12mm waterproof laminate really?',
    answer: 'The wear-and-core plank is 12mm. Many of our 72-hour waterproof laminates come with a 2mm pad already attached, making the plank 14mm. When we add a separate 3–5mm premium underlay during installation, the finished floor is effectively 15–17mm thick. That thickness is what gives it a solid, warm, quiet feel underfoot — a big step up from thin 4–6mm vinyl, at a lower price than premium 11mm vinyl.',
  },
  {
    question: 'Why does laminate feel warmer than vinyl?',
    answer: 'Laminate is made from pressed wood (HDF), which is a natural insulator, so it holds warmth and feels warm to bare feet. SPC vinyl is built on a stone-plastic composite core that conducts cold from the subfloor, so it feels cold — especially over concrete basements and in winter. If warmth underfoot matters to you, 12mm waterproof laminate is the better pick.',
  },
  {
    question: 'How much does 12mm waterproof laminate cost in the GTA?',
    answer: 'At BBS Flooring in Markham, Falcon 12mm 72-hour waterproof laminate is in stock from $2.39/sqft. Floating installation is $2.00/sqft, and old-floor removal (if needed) is $1.00–$1.25/sqft. For a 500 sqft room that works out to roughly $2,195 for material and installation before removal and delivery. Book a free in-home measurement for an exact quote.',
  },
  {
    question: 'Can I put waterproof laminate in a kitchen, bathroom, or basement?',
    answer: 'Yes. Because it is 72-hour waterproof through the core and joints, 12mm waterproof laminate is suitable for kitchens, laundry rooms, powder rooms, and dry-to-moderate basements when installed with the right underlayment and vapour barrier over concrete. For basements with a history of flooding or standing water, we still recommend SPC vinyl — we carry both and will advise honestly during your free measurement.',
  },
  {
    question: 'Is waterproof laminate good for homes with pets and kids?',
    answer: 'It is one of the best choices. The AC4 commercial-grade wear layer resists scratches from pet claws and heavy furniture, the surface is easy to wipe clean, and the 72-hour waterproof core shrugs off pet accidents and spilled drinks. It is warmer and quieter than vinyl, which families with young kids tend to prefer.',
  },
  {
    question: 'Does BBS install waterproof laminate across the GTA?',
    answer: 'Yes. BBS Flooring provides professional floating installation of waterproof laminate across Markham, Richmond Hill, Vaughan, Toronto, Scarborough, and the wider GTA at $2.00/sqft. Our installers assess your subfloor, add the right underlayment, and handle transitions. Call (647) 428-1111 or book a free in-home measurement at bbsflooring.ca/free-measurement.',
  },
  {
    question: 'What warranty and durability does it have?',
    answer: 'Our Falcon 12mm waterproof laminate carries an AC4 commercial-grade wear rating, meaning it is built to withstand heavy residential and light commercial traffic. It resists fading, staining, and scratching. For the specific manufacturer warranty on a colour you are considering, ask us in the showroom or on the phone and we will confirm the exact terms before you buy.',
  },
];

export const metadata = {
  title: '72-Hour Waterproof Laminate Flooring in Markham | 12mm from $2.39/sqft',
  description:
    '12mm 72-hour waterproof laminate — warmer and quieter than SPC vinyl, AC4 commercial-grade, from $2.39/sqft in Markham. The smart vinyl alternative for GTA homes. Free measurement.',
  alternates: { canonical: '/waterproof-laminate-flooring' },
  openGraph: {
    title: '72-Hour Waterproof Laminate Flooring | BBS Flooring Markham',
    description:
      '12mm waterproof laminate from $2.39/sqft. Warmer and quieter than vinyl, thicker than most SPC, and a fraction of the price of premium vinyl. In stock in Markham.',
    url: 'https://bbsflooring.ca/waterproof-laminate-flooring',
    type: 'article',
  },
};

export default function WaterproofLaminateFlooringPage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: '72-Hour Waterproof Laminate Flooring: The Smart Vinyl Alternative (2026)',
    description: metadata.description,
    author: {
      '@type': 'Organization',
      name: 'BBS Flooring',
      url: 'https://bbsflooring.ca',
    },
    publisher: {
      '@type': 'Organization',
      name: 'BBS Flooring',
      url: 'https://bbsflooring.ca',
      logo: {
        '@type': 'ImageObject',
        url: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/bbs-logo-official-v2.png',
      },
    },
    datePublished: '2026-08-05',
    dateModified: '2026-08-05',
    mainEntityOfPage: 'https://bbsflooring.ca/waterproof-laminate-flooring',
  };

  const schemas = [articleSchema, faqSchema(faqItems)];

  return (
    <>
      <JsonLd data={schemas} />
      <Suspense>
        <WaterproofLaminateClient />
      </Suspense>
      <DeepPageCapture productType="laminate" />
    </>
  );
}
