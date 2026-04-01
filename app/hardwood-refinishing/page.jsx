import { Suspense } from 'react';
import { hardwoodRefinishingData } from '@/data/landingPages';
import HardwoodRefinishingClient from '@/components/HardwoodRefinishingClient';
import { faqSchema, localBusinessSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: hardwoodRefinishingData.title,
  description: hardwoodRefinishingData.description,
  alternates: { canonical: '/hardwood-refinishing' },
};

export default function HardwoodRefinishingPage() {
  const schemas = [
    faqSchema(hardwoodRefinishingData.faqItems),
    hardwoodRefinishingData.schemaType !== 'product' && localBusinessSchema(),
  ].filter(Boolean);

  return (
    <>
      <JsonLd data={schemas} />
      <Suspense><HardwoodRefinishingClient /></Suspense>
    </>
  );
}
