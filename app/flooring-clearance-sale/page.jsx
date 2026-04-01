import { Suspense } from 'react';
import { flooringClearanceSaleData } from '@/data/landingPages';
import FlooringClearanceSaleClient from '@/components/FlooringClearanceSaleClient';
import { faqSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: flooringClearanceSaleData.title,
  description: flooringClearanceSaleData.description,
  alternates: { canonical: '/clearance' },
};

export default function FlooringClearanceSalePage() {
  return (
    <>
      <JsonLd data={faqSchema(flooringClearanceSaleData.faqItems)} />
      <Suspense><FlooringClearanceSaleClient /></Suspense>
    </>
  );
}
