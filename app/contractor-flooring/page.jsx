import { Suspense } from 'react';
import ContractorFlooringClient from '@/components/ContractorFlooringClient';
import { faqSchema, localBusinessSchema, JsonLd } from '@/lib/schemas';

const FAQ_ITEMS = [
  { question: 'Does BBS Flooring offer contractor pricing?', answer: 'Yes. Our Member Trade Program gives contractors exclusive pricing on our full catalog — hardwood, vinyl, laminate, and stair materials. No annual fees or minimum commitments. Call (647) 428-1111 or visit our showroom to register.' },
  { question: 'Can contractors buy material only without installation?', answer: 'Absolutely. Many of our contractor clients purchase material only for their own crews to install. We also offer our WSIB-insured installation team if you need additional labour for a project.' },
  { question: 'Do you offer bulk discounts for large projects?', answer: 'Yes. Multi-unit developments, condo projects, and large residential renovations qualify for additional volume discounts on top of member pricing. Contact us with your project details for a custom quote.' },
  { question: 'How quickly can I pick up material?', answer: 'In-stock products are available for same-day pickup at our Markham warehouse during business hours. For large orders, we stage material and have it ready — just call ahead. GTA-wide delivery is also available.' },
  { question: 'What areas do you serve?', answer: 'We supply contractors across the entire GTA: Markham, Toronto, Scarborough, North York, Richmond Hill, Vaughan, Stouffville, Pickering, Ajax, Whitby, Oshawa, and all of Durham Region. Delivery available to any job site.' },
  { question: 'Do you price match other flooring stores?', answer: 'Our prices are already contractor-direct — we\'re the source, not a middleman. If you find the exact same product cheaper elsewhere in the GTA, bring the quote and we\'ll talk. Most contractors find we\'re already the lowest once they compare apples to apples.' },
  { question: 'What brands do you carry?', answer: 'We stock 15+ brands including Vidar, Wickham, NAF, Triforest, Northernest, Woden, Falcon, Canadian Standard, and more. Over 600 products in stock at our Markham warehouse — engineered hardwood, SPC vinyl, laminate, and solid hardwood.' },
  { question: 'Is there a minimum order for contractor pricing?', answer: 'No minimum commitment and no annual fees. Your trade pricing is active from your very first order. Volume discounts kick in on larger projects — the more you buy, the better the rates.' },
];

export const metadata = {
  title: 'Contractor Flooring Markham | Trade Pricing & Bulk Orders | BBS Flooring 2026',
  description: 'GTA contractor flooring program — exclusive trade pricing, 600+ products in stock, same-day pickup, GTA-wide delivery. No annual fees, no minimums. Call (647) 428-1111.',
  alternates: { canonical: '/contractor-flooring' },
};

export default function ContractorFlooringPage() {
  const schemas = [
    faqSchema(FAQ_ITEMS),
    localBusinessSchema(),
  ].filter(Boolean);

  return (
    <>
      <JsonLd data={schemas} />
      <Suspense><ContractorFlooringClient /></Suspense>
    </>
  );
}
