import { Suspense } from 'react';
import VinylFlooringGuideClient from '@/components/VinylFlooringGuideClient';
import { faqSchema, localBusinessSchema, JsonLd } from '@/lib/schemas';

const faqItems = [
  {
    question: 'Is luxury vinyl plank (LVP) truly waterproof?',
    answer: 'Yes. SPC and WPC vinyl planks are 100% waterproof through the entire plank thickness. Standing water, pet accidents, and kitchen spills will not damage the planks. However, water that seeps between planks to the subfloor should still be cleaned up — no click-lock floor creates a watertight seal at every seam.',
  },
  {
    question: 'What is the difference between SPC and WPC vinyl?',
    answer: 'SPC (Stone Plastic Composite) has a dense, rigid stone-polymer core — it\'s harder, more dent-resistant, and better for high-traffic areas. WPC (Wood Plastic Composite) has a foamed wood-polymer core — it\'s softer and warmer underfoot with slightly better sound absorption. Both are waterproof. SPC is the dominant choice in 2026 for residential use.',
  },
  {
    question: 'How long does vinyl plank flooring last?',
    answer: 'Quality vinyl plank lasts 20–30 years with normal residential use. Longevity depends primarily on wear layer thickness: 12mil is entry-level residential, 20mil is standard residential, and 22–28mil is premium/commercial grade. At BBS Flooring, our vinyl ranges from 12mil to 28mil wear layers.',
  },
  {
    question: 'Can vinyl flooring be installed over existing floors?',
    answer: 'In most cases, yes. LVP can be installed over concrete, existing vinyl, and some tile — as long as the surface is flat, clean, and dry. It typically cannot go over carpet or very uneven floors. Our installers assess your subfloor during the free in-home measurement.',
  },
  {
    question: 'Does vinyl flooring look fake?',
    answer: 'Modern LVP has come a long way. Premium products use high-definition printing and embossed-in-register (EIR) textures that closely mimic real wood grain. From standing height, most people cannot distinguish quality LVP from real hardwood. Visit our Markham showroom to see and feel the difference.',
  },
  {
    question: 'How much does vinyl flooring cost installed in Toronto?',
    answer: 'At BBS Flooring, vinyl materials range from $2.19–$3.59/sqft. Installation is $2.00/sqft for click-lock LVP. For a typical 500 sqft project, total installed cost is approximately $2,095–$2,795. We offer free in-home measurements and no hidden fees.',
  },
  {
    question: 'Is vinyl flooring good for basements?',
    answer: 'Vinyl is the #1 recommended flooring for basements. It\'s 100% waterproof, handles temperature fluctuations, doesn\'t need acclimatization like hardwood, and installs over concrete without a moisture barrier (though one is recommended). SPC vinyl with an attached IXPE underpad is the ideal basement choice.',
  },
  {
    question: 'Can you install vinyl on stairs?',
    answer: 'Yes. Vinyl stair caps (overlays) fit over existing stair treads and match your vinyl plank flooring. They\'re available in coordinating colours. BBS Flooring installs vinyl stair caps throughout the GTA — contact us for stair-specific pricing.',
  },
  {
    question: 'Does vinyl flooring increase home value?',
    answer: 'Modern LVP is widely accepted by homebuyers and can increase perceived value, especially when replacing dated carpet or laminate. While solid hardwood still commands the highest resale premium, waterproof vinyl in kitchens, basements, and bathrooms is now expected by GTA buyers.',
  },
  {
    question: 'How do you maintain vinyl flooring?',
    answer: 'Vinyl is extremely low-maintenance. Sweep or vacuum regularly, mop with a damp (not soaking) mop and mild cleaner. No waxing, no polishing, no refinishing needed. Avoid abrasive cleaners and rubber-backed mats, which can stain vinyl over time.',
  },
];

export const metadata = {
  title: 'Vinyl Flooring Buying Guide 2026 | LVP & SPC Explained | BBS Flooring',
  description: 'Complete guide to vinyl flooring in Canada. SPC vs WPC, wear layers, costs, installation, and the best LVP brands. 233 options from $2.19/sqft at BBS Flooring Markham.',
  alternates: { canonical: '/vinyl-flooring-guide' },
};

export default function VinylFlooringGuidePage() {
  return (
    <>
      <JsonLd data={[localBusinessSchema(), faqSchema(faqItems)]} />
      <Suspense>
        <VinylFlooringGuideClient />
      </Suspense>
    </>
  );
}
