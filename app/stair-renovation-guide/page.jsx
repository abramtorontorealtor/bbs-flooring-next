import { Suspense } from 'react';
import StairRenovationGuideClient from '@/components/StairRenovationGuideClient';
import { faqSchema, JsonLd } from '@/lib/schemas';

const faqItems = [
  {
    question: 'How much does a staircase renovation cost in Toronto?',
    answer: 'At BBS Flooring: refinishing (sand & restain) is $125/step, new straight treads $185/step, pie/triangle/bullnose steps $225/step, new posts $150 each, iron or wood pickets $25/piece, railing refinish $25/lf, new railing $50/lf, stringers from $350/side, nosing from $20/lf. A full 13-step carpet-to-hardwood conversion with new treads runs $2,700–$3,200. A complete renovation with new rails, pickets, and posts runs $4,500–$6,000+.',
  },
  {
    question: 'How much does it cost to replace a banister in Toronto?',
    answer: 'Banister replacement at BBS Flooring: new posts $150 each, new railing $50/lf, new iron or wood pickets $25/piece. A typical banister upgrade on a 13-step staircase (2 posts + 26 pickets + 10 lf new railing) runs approximately $1,450–$1,700 installed. Refinishing an existing wood railing costs $25/lf — a 10 lf railing is $250.',
  },
  {
    question: 'What is a stringer on stairs and how much does it cost?',
    answer: 'The stringer is the angled side board that runs along the length of the staircase and supports the treads. BBS Flooring installs new stringers at $350/side (white painted) or $900/side (stained to match treads). Stained stringers are only available when installing new treads — refinishing mode locks stringers to white painted.',
  },
  {
    question: 'How much does a stair landing cost to install?',
    answer: 'Stair landing installation at BBS Flooring: small landing (3×3 ft) is $300, large landing (6×3 ft) is $600. We use hardwood stained on-site to match your treads.',
  },
  {
    question: 'How many pickets do I need for my staircase?',
    answer: 'Most residential staircases use 2–3 pickets per step, depending on tread width and Ontario Building Code requirements. A standard 13-step staircase typically needs 26–39 pickets. At $25/piece installed, that is $650–$975 for pickets alone. Iron and wood pickets are the same price at BBS Flooring.',
  },
  {
    question: 'How long does a staircase renovation take?',
    answer: 'Refinishing (sand & restain) takes 2–3 days. New tread installation takes 1–2 days. A complete renovation (new treads + rails + pickets) typically takes 3–5 days. Carpet removal + new treads + railing upgrade takes 4–6 days. You can walk on refinished stairs after 24–48 hours with socks.',
  },
  {
    question: 'Can I keep using the stairs during renovation?',
    answer: 'During tread installation, the staircase is unusable for 1–2 days. During refinishing, you can walk on the stairs with clean socks after each coat dries (typically 12–24 hours). For multi-story homes, we plan the work so you always have an alternate route.',
  },
  {
    question: 'Should I refinish or replace my stair treads?',
    answer: 'Refinish if: your existing treads are solid hardwood in good structural condition (no deep gouges, cracks, or warping). Replace if: treads are damaged, too thin to sand again, MDF/composite, or you want a different species. Refinishing costs $125/step vs $185/step for new treads — that is 32% less. If stairs are carpeted, we check what is underneath during the free in-home assessment.',
  },
  {
    question: 'What wood species is best for stairs?',
    answer: 'White oak is the most popular choice in 2026 — hard enough for heavy traffic (Janka 1360), takes stain beautifully, and matches modern home aesthetics. Red oak is a classic budget choice (our standard). Hickory (Janka 1820) is the hardest option for maximum durability. White oak and maple are available — contact us for pricing.',
  },
  {
    question: 'Can you match my stair treads to my existing floor?',
    answer: 'Yes. Our stain-matching service ensures your new or refinished stair treads match your existing flooring. For exact matches, we recommend doing stairs and adjacent floors in the same project, using the same stain batch.',
  },
  {
    question: 'Do you install vinyl stair caps?',
    answer: "Yes. Vinyl stair caps (overlays) fit over your existing treads — they're waterproof, durable, budget-friendly, and come in colours that match your vinyl plank flooring. Popular for basements, rentals, and budget-conscious full-home renovations.",
  },
  {
    question: 'Are iron balusters better than wood?',
    answer: "Iron (metal) balusters are the dominant trend in 2026. They're thinner than wood so they feel more open, require zero maintenance, and are structurally stronger. At $25/piece installed, they're the same price as wood at BBS Flooring. Wood balusters suit traditional or farmhouse styles.",
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
  title: 'Stair Renovation Cost in Toronto & GTA (2026) | From $125/Step',
  description: 'Staircase renovation costs in Toronto & Markham: treads from $125/step, new hardwood from $185/step, banister/railing from $25/lf, stringers from $350/side. Use our free stair cost calculator for an instant estimate.',
  alternates: { canonical: '/stair-renovation-guide' },
};

export default function StairRenovationGuidePage() {
  return (
    <>
      <JsonLd data={faqSchema(faqItems)} />
      <Suspense>
        <StairRenovationGuideClient />
      </Suspense>
    </>
  );
}
