import { Suspense } from 'react';
import { wickhamFlooringData } from '@/data/landingPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: wickhamFlooringData.title,
  description: wickhamFlooringData.description,
};

export default function WickhamFlooringPage() {
  return (
    <>
      <JsonLd data={faqSchema(wickhamFlooringData.faqItems)} />
      <Suspense><BrandLandingClient brandKey="wickham" /></Suspense>
    </>
  );
}
