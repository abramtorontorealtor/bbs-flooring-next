import { Suspense } from 'react';
import { vidarFlooringData } from '@/data/landingPages';
import VidarFlooringClient from '@/components/VidarFlooringClient';
import { faqSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: vidarFlooringData.title,
  description: vidarFlooringData.description,
};

export default function VidarFlooringPage() {
  return (
    <>
      <JsonLd data={faqSchema(vidarFlooringData.faqItems)} />
      <Suspense><VidarFlooringClient /></Suspense>
    </>
  );
}
