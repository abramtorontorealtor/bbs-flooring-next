import { Suspense } from 'react';
import PriceMatchClient from '@/components/PriceMatchClient';
import { faqSchema, JsonLd } from '@/lib/schemas';

export const faqItems = [
  {
    question: 'Does BBS Flooring really beat competitor prices?',
    answer: 'Yes. Our Best Price Guarantee means that if you find the same flooring — same brand and same product — for less at another local flooring business, we will beat that price. Message us on WhatsApp, text, or call (647) 428-1111 with the details and we will take care of you. On top of the price, you still get our Markham showroom, professional installation, and financing — things online-only resellers can not offer.',
  },
  {
    question: 'What do I need to claim the Best Price Guarantee?',
    answer: 'Just show us the price. A quote, a flyer, an ad, or a screenshot from the competitor helps us verify it quickly, but it is not strictly required — even a number you have been quoted gives us a starting point. The faster you get us the details, the faster we can beat it.',
  },
  {
    question: 'Which competitors qualify?',
    answer: 'Any legitimate local flooring business in the GTA or Ontario, on the identical in-stock product (same brand and SKU). We can not match used, clearance, liquidation, going-out-of-business, or marketplace listings (Kijiji, Facebook Marketplace, scratch-and-dent), because those are not the same new, warrantied product we supply.',
  },
  {
    question: 'Does the price match include installation?',
    answer: 'The Best Price Guarantee covers the product price. Installation, our in-home measurement, showroom service, and financing are the extras that make BBS worth choosing — and they are things an online-only or out-of-town seller simply can not provide. Think of the price match as the floor, and our local service as the ceiling.',
  },
  {
    question: 'How do I claim my price match?',
    answer: 'The fastest way is WhatsApp us at (647) 428-1111 — most people prefer it and we reply quickly. You can also text the same number, or call us during showroom hours (Mon–Sat, 10am–5pm). Tell us the product, the competitor, and the price, and we will beat it.',
  },
];

export const metadata = {
  title: 'Best Price Guarantee — We Beat Any Local Flooring Price | BBS Flooring',
  description: 'Found the same flooring cheaper at another local GTA store? BBS Flooring will beat it. Same brand, same product — we beat any local competitor price. Plus a real Markham showroom, pro installation, and financing. Message us on WhatsApp at (647) 428-1111.',
  alternates: { canonical: '/price-match' },
};

export default function Page() {
  return (
    <>
      <JsonLd data={faqSchema(faqItems)} />
      <Suspense>
        <PriceMatchClient />
      </Suspense>
    </>
  );
}
