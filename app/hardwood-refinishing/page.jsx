import { Suspense } from 'react';
import HardwoodRefinishingClient from '@/components/HardwoodRefinishingClient';
import { faqSchema, localBusinessSchema, JsonLd } from '@/lib/schemas';

const FAQ_ITEMS = [
  { question: 'How much does hardwood floor refinishing cost in Markham?', answer: 'Sand & refinish (natural) is $5.25/sqft. Sand, stain & refinish is $6.25/sqft. A typical 1,000 sqft main floor runs $5,250–$6,250. Call (647) 428-1111 for a free in-home quote tailored to your specific floors.' },
  { question: 'How long does hardwood refinishing take?', answer: 'A typical 1,000 sqft floor takes 3–5 days: 1 day sanding, 1 day staining (if applicable), and 1–2 days for polyurethane coats with drying time between each. Water-based finishes dry faster (2–3 hours between coats) than oil-based (8–12 hours).' },
  { question: 'How dusty is the sanding process?', answer: 'We use HEPA-filtered vacuum attachments connected directly to the sander, which significantly reduces airborne dust compared to traditional sanding. That said, it\'s not dust-free — we seal off the work area and isolate rooms to keep the rest of your home clean. Expect some fine dust in the immediate work zone, but nothing like old-school sanding.' },
  { question: 'Can engineered hardwood be refinished?', answer: 'It depends on the wear layer thickness. Engineered hardwood with a 2mm+ wear layer can typically be sanded and refinished once. Premium products (like Vidar with 4mm wear layers) can be refinished 2–3 times. We measure your wear layer during the free assessment.' },
  { question: 'Oil-based vs water-based polyurethane — which is better?', answer: 'Oil-based adds a warm amber tone, is more durable, and costs slightly more. Water-based dries clear (no yellowing), dries faster (walk on it the same day), and has lower VOC. Most GTA homeowners choose water-based for lighter wood and oil-based for a classic warm look. We carry both.' },
  { question: 'How soon can I put furniture back after refinishing?', answer: 'Light foot traffic (socks only) is usually safe after 24 hours for water-based finish, or 48 hours for oil-based. Furniture can go back after 72 hours (water-based) or 5–7 days (oil-based). Area rugs should wait 2 weeks. We\'ll give you exact timelines based on your finish choice.' },
  { question: 'Do you refinish hardwood floors in Toronto and Durham?', answer: 'Yes. BBS Flooring refinishes hardwood floors across the GTA including Markham, Toronto, Scarborough, Pickering, Ajax, Whitby, Richmond Hill, Vaughan, and all of Durham Region. Free in-home assessments anywhere in our service area.' },
];

export const metadata = {
  title: 'Hardwood Floor Refinishing Markham & GTA | Sand & Stain — BBS Flooring',
  description: 'Professional hardwood floor refinishing from $5.25/sqft. Dust-contained sanding, custom staining, polyurethane finish. 60–75% cheaper than replacement. Free in-home assessment. Call (647) 428-1111.',
  alternates: { canonical: '/hardwood-refinishing' },
};

export default function HardwoodRefinishingPage() {
  const schemas = [
    faqSchema(FAQ_ITEMS),
    localBusinessSchema(),
  ].filter(Boolean);

  return (
    <>
      <JsonLd data={schemas} />
      <Suspense><HardwoodRefinishingClient /></Suspense>
    </>
  );
}
