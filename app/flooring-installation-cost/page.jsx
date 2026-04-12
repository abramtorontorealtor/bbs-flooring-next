import { Suspense } from 'react';
import FlooringInstallationCostClient from '@/components/FlooringInstallationCostClient';
import { faqSchema, localBusinessSchema, JsonLd } from '@/lib/schemas';

const FAQ_ITEMS_FOR_SCHEMA = [
  { question: 'How much does it cost to install 1,000 sqft of flooring?', answer: 'For 1,000 sqft, expect roughly $3,790–$7,250 for vinyl or laminate, $5,250–$9,500 for engineered hardwood (nail-down), or $7,250–$14,250 for solid hardwood. These ranges include material + professional installation. Call (647) 428-1111 for a free quote.' },
  { question: 'Does BBS Flooring offer free estimates?', answer: 'Yes. We provide free in-home measurements and quotes anywhere in the GTA — Markham, Toronto, Scarborough, Pickering, Ajax, Whitby, Richmond Hill, Vaughan, and surrounding areas. No obligation. Call (647) 428-1111 to book.' },
  { question: 'Is it cheaper to buy flooring and install yourself?', answer: 'DIY saves $2.00–$4.25/sqft on labour, but risks costly mistakes. Improper subfloor prep, wrong expansion gaps, and bad transitions can cause buckling, squeaking, or water damage within months — and there\'s no warranty. Our professional installation includes subfloor prep, moisture testing, trim, furniture moving, and warranty on both material and labour.' },
  { question: 'How long does flooring installation take?', answer: 'A typical 500 sqft room takes 1–2 days for vinyl or laminate, 2–3 days for hardwood. Larger homes (1,000+ sqft) usually take 3–5 days. This includes old floor removal if needed. We give you an exact timeline during your free measurement appointment.' },
  { question: 'Do you charge extra to move furniture?', answer: 'No. BBS Flooring moves standard household furniture at no extra charge. Heavy items like pianos, pool tables, or gun safes may require specialty movers, but regular beds, dressers, sofas — we handle it all.' },
  { question: 'What\'s included in the installation cost?', answer: 'Professional installation by our WSIB-insured crew, subfloor assessment, moisture testing for concrete, proper expansion gaps, transitions between rooms, furniture moving, and post-install cleanup. Material, delivery, old floor removal, and baseboards are separate line items — all quoted upfront with no hidden fees.' },
  { question: 'How does flooring installation pricing work in the GTA?', answer: 'GTA flooring installation is priced per square foot. Material cost varies by product ($1.79–$12.00/sqft). Labour ranges from $2.00/sqft (vinyl/laminate) to $4.25/sqft (herringbone). Total project cost = material + labour + removal (if needed) + trim + delivery. We itemize everything in your quote so you see exactly what you\'re paying for.' },
  { question: 'Can I supply my own material and have you install it?', answer: 'We prefer to supply and install together — it means we guarantee both the material and the workmanship. If you supply your own material, we\'ll install it but the material warranty is between you and your supplier. Labour warranty still applies.' },
];

export const metadata = {
  title: 'Flooring Installation Cost Markham & GTA | Price Guide 2026',
  description: 'How much does flooring installation cost in Markham? Hardwood $2.25/sqft, vinyl $2.00-2.25/sqft, laminate $2.00-2.25/sqft. Free cost calculator. Call (647) 428-1111.',
  alternates: { canonical: '/flooring-installation-cost' },
};

export default function FlooringInstallationCostPage() {
  const schemas = [
    faqSchema(FAQ_ITEMS_FOR_SCHEMA),
    localBusinessSchema(),
  ].filter(Boolean);

  return (
    <>
      <JsonLd data={schemas} />
      <Suspense><FlooringInstallationCostClient /></Suspense>
    </>
  );
}
