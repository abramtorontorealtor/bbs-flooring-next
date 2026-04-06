import { Suspense } from 'react';
import SolidHardwoodGuideClient from '@/components/SolidHardwoodGuideClient';
import { faqSchema, localBusinessSchema, JsonLd } from '@/lib/schemas';

const faqItems = [
  {
    question: 'How much does solid hardwood flooring cost in Toronto?',
    answer: 'At BBS Flooring in Markham, solid hardwood ranges from $5.10–$7.25/sqft for material. Installation adds $2.25/sqft (nail-down) or $3.25/sqft (glue-down). For a typical 500 sqft project, total installed cost is approximately $3,675–$5,250. We offer free in-home measurements with detailed quotes.',
  },
  {
    question: 'What is the difference between solid and engineered hardwood?',
    answer: 'Solid hardwood is a single piece of wood (typically ¾" thick) that can be sanded and refinished 5–8 times over its lifetime. Engineered hardwood has a real wood veneer bonded to a plywood core — it\'s more dimensionally stable and can go in basements, but can only be refinished 1–3 times. Solid is the premium choice for main-floor living areas.',
  },
  {
    question: 'How long does solid hardwood flooring last?',
    answer: 'Solid hardwood floors last 75–100+ years with proper care. The ¾" thickness allows 5–8 refinishing cycles, each removing about 1/32" of wood. Many century-old Toronto homes still have their original solid hardwood floors in excellent condition.',
  },
  {
    question: 'Can solid hardwood be installed in a basement?',
    answer: 'No. Solid hardwood should never be installed below grade (basements). Wood absorbs moisture from concrete subfloors, causing cupping, buckling, and warping. For basements, use engineered hardwood (from $2.49/sqft) or waterproof vinyl (from $2.19/sqft) — both available at BBS Flooring.',
  },
  {
    question: 'What is the best wood species for solid hardwood floors?',
    answer: 'White oak is the most popular choice in 2026 — it\'s hard (Janka 1360), takes stain beautifully, and suits modern aesthetics. Red oak is the classic Canadian choice with warm tones. Hard maple (Janka 1450) is the hardest domestic option. At BBS Flooring, we carry all four species across 4 brands.',
  },
  {
    question: 'What do hardwood flooring grades mean?',
    answer: 'Grades describe the appearance, not quality. Select & Better (AB) has minimal knots and uniform colour — the cleanest look. Select (ABC) allows some character marks and colour variation. Character (ABCD) has the most natural variation including knots, mineral streaks, and colour range — the most popular grade in 2026 for its rustic, authentic aesthetic.',
  },
  {
    question: 'How do I maintain solid hardwood floors?',
    answer: 'Sweep or vacuum weekly (use hard-floor setting). Damp-mop with a hardwood-specific cleaner monthly — never use a soaking-wet mop. Keep indoor humidity between 35–55% (critical in Canadian winters). Place felt pads under furniture legs. Clean spills immediately. Avoid rubber-backed mats, which can trap moisture.',
  },
  {
    question: 'How long does solid hardwood installation take?',
    answer: 'A standard 500 sqft room takes 2–3 days: day 1 for subfloor prep and acclimation check, days 2–3 for nail-down installation. Larger projects scale proportionally. BBS Flooring handles old flooring removal, subfloor prep, baseboards, and transitions in the same project.',
  },
  {
    question: 'Does solid hardwood need to acclimate before installation?',
    answer: 'Yes. Solid hardwood must acclimate to your home\'s temperature and humidity for 3–7 days before installation. We deliver the flooring ahead of your install date and verify moisture levels with a meter on install day. Skipping acclimation is the #1 cause of post-install problems.',
  },
  {
    question: 'What brands of solid hardwood do you carry?',
    answer: 'BBS Flooring carries 81 solid hardwood products from 4 premium Canadian brands: Wickham Hardwood Flooring (29 options, $5.50–$7.25/sqft), Appalachian Flooring (18 options, $5.99–$6.39/sqft), Northernest (18 options, $5.10–$6.50/sqft), and Sherwood Forest Products (16 options, $5.99–$6.99/sqft). Visit our Markham showroom to see samples.',
  },
];

export const metadata = {
  title: 'Solid Hardwood Flooring Guide 2026 | Species, Grades & Pricing | BBS Flooring',
  description: 'Complete guide to solid hardwood flooring in Canada. Compare oak, maple, hickory species, understand grades, and see real 2026 pricing. 81 options from $5.10/sqft at BBS Flooring Markham.',
  alternates: { canonical: '/solid-hardwood-guide' },
};

export default function SolidHardwoodGuidePage() {
  return (
    <>
      <JsonLd data={[localBusinessSchema(), faqSchema(faqItems)]} />
      <Suspense>
        <SolidHardwoodGuideClient />
      </Suspense>
    </>
  );
}
