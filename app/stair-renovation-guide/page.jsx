import { Suspense } from 'react';
import StairRenovationGuideClient from '@/components/StairRenovationGuideClient';
import { faqSchema, localBusinessSchema, JsonLd } from '@/lib/schemas';

const faqItems = [
  {
    question: 'How much does a staircase renovation cost in Toronto?',
    answer: 'At BBS Flooring: refinishing (sand & restain) is $125/step, new straight treads $185/step, specialty steps (pie, bullnose) $225/step, and rail/picket work from $25/piece. A full 13-step staircase refinish with rails runs $2,000–$2,500. New hardwood treads on a standard staircase cost $2,400–$3,200 total.',
  },
  {
    question: 'How long does a staircase renovation take?',
    answer: 'Refinishing (sand & restain) takes 2–3 days including dry time. New tread installation takes 1–2 days. A complete renovation (new treads + rails + pickets) typically takes 3–5 days. You can usually walk on refinished stairs after 24–48 hours with socks.',
  },
  {
    question: 'Can I keep using the stairs during renovation?',
    answer: 'During tread installation, the staircase is unusable for 1–2 days. During refinishing, you can walk on the stairs with clean socks after each coat dries (typically 12–24 hours). For multi-story homes, we plan the work so you always have an alternate route.',
  },
  {
    question: 'Should I refinish or replace my stair treads?',
    answer: 'Refinish if: your existing treads are solid hardwood in good structural condition (no deep gouges, cracks, or warping). Replace if: treads are damaged, too thin to sand again, MDF/composite, or you want a different species or width. Refinishing costs about 68% less than replacement ($125 vs $185 per step).',
  },
  {
    question: 'What wood species is best for stairs?',
    answer: 'White oak is the most popular choice in 2026 — hard enough for heavy traffic (Janka 1360), takes stain beautifully, and matches modern home aesthetics. Red oak is a classic budget choice. Hickory (Janka 1820) is the hardest option for maximum durability. Maple offers a lighter, contemporary look.',
  },
  {
    question: 'Can you match my stair treads to my existing floor?',
    answer: 'Yes. Our stain-matching service ensures your new or refinished stair treads match your existing flooring. We carry custom staining options in all popular colours. For exact matches, we recommend doing stairs and adjacent floors in the same project.',
  },
  {
    question: 'Do you install vinyl stair caps?',
    answer: 'Yes. Vinyl stair caps (overlays) fit over your existing treads — they\'re waterproof, durable, budget-friendly, and come in colours that match your vinyl plank flooring. Popular for basements, rentals, and budget-conscious full-home renovations.',
  },
  {
    question: 'Are iron balusters better than wood?',
    answer: 'Iron (wrought iron or metal) balusters are the dominant trend in 2026. They\'re thinner than wood so they feel more open, require zero maintenance (no refinishing), and are structurally stronger. At $25/piece installed, they\'re a cost-effective upgrade. Wood balusters suit traditional or farmhouse styles.',
  },
  {
    question: 'Do you do spiral or curved staircases?',
    answer: 'We handle standard straight and L-shaped staircases. Spiral and dramatically curved staircases require specialized fabrication that we currently refer to specialist millwork shops. Contact us and we can assess your specific staircase.',
  },
  {
    question: 'What areas do you serve for staircase renovation?',
    answer: 'BBS Flooring provides staircase renovation across Markham, Toronto, Scarborough, Pickering, Ajax, Whitby, Oshawa, Richmond Hill, Vaughan, Stouffville, and the full GTA. Our showroom is at 6061 Highway 7, Unit B, Markham.',
  },
];

export const metadata = {
  title: 'Stair Renovation Guide 2026 | Costs, Options & What to Expect | BBS Flooring',
  description: 'Complete guide to stair renovation in Toronto & Markham. Refinishing from $125/step, new treads from $185/step. Carpet-to-hardwood, vinyl caps, railing upgrades. Free estimates.',
  alternates: { canonical: '/stair-renovation-guide' },
};

export default function StairRenovationGuidePage() {
  return (
    <>
      <JsonLd data={[localBusinessSchema(), faqSchema(faqItems)]} />
      <Suspense>
        <StairRenovationGuideClient />
      </Suspense>
    </>
  );
}
