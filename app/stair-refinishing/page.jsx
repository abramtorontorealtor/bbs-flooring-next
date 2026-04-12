import { Suspense } from 'react';
import { stairRefinishingData } from '@/data/landingPages';
import StairRefinishingClient from '@/components/StairRefinishingClient';
import { faqSchema, localBusinessSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: stairRefinishingData.title,
  description: stairRefinishingData.description,
  alternates: { canonical: '/stair-refinishing' },
};

export default function StairRefinishingPage() {
  const schemas = [
    faqSchema(stairRefinishingData.faqItems),
    stairRefinishingData.schemaType !== 'product' && localBusinessSchema(),
  ].filter(Boolean);

  return (
    <>
      <JsonLd data={schemas} />
      <Suspense><StairRefinishingClient /></Suspense>
    </>
  );
}
