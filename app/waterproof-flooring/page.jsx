import { Suspense } from 'react';
import { waterproofFlooringData } from '@/data/landingPages';
import WaterproofFlooringClient from '@/components/WaterproofFlooringClient';
import { faqSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: waterproofFlooringData.title,
  description: waterproofFlooringData.description,
  alternates: { canonical: '/waterproof-flooring' },
};

export default function WaterproofFlooringPage() {
  return (
    <>
      <JsonLd data={faqSchema(waterproofFlooringData.faqItems)} />
      <Suspense><WaterproofFlooringClient /></Suspense>
    </>
  );
}
