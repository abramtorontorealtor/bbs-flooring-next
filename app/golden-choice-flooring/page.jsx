import { Suspense } from 'react';
import { goldenChoiceFlooringData } from '@/data/brandPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: goldenChoiceFlooringData.title,
  description: goldenChoiceFlooringData.description,
};

export default function GoldenChoiceFlooringPage() {
  return (
    <>
      <JsonLd data={faqSchema(goldenChoiceFlooringData.faqItems)} />
      <Suspense><BrandLandingClient brandKey="golden-choice" /></Suspense>
    </>
  );
}
