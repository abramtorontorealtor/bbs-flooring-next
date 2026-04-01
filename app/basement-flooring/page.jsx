import { Suspense } from 'react';
import { basementFlooringData } from '@/data/landingPages';
import BasementFlooringClient from '@/components/BasementFlooringClient';
import { faqSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: basementFlooringData.title,
  description: basementFlooringData.description,
  alternates: { canonical: '/basement-flooring' },
};

export default function BasementFlooringPage() {
  return (
    <>
      <JsonLd data={faqSchema(basementFlooringData.faqItems)} />
      <Suspense><BasementFlooringClient /></Suspense>
    </>
  );
}
