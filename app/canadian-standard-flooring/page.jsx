import { Suspense } from 'react';
import { canadianStandardFlooringData } from '@/data/brandPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: canadianStandardFlooringData.title,
  description: canadianStandardFlooringData.description,
};

export default function CanadianStandardFlooringPage() {
  return (
    <>
      <JsonLd data={faqSchema(canadianStandardFlooringData.faqItems)} />
      <Suspense><BrandLandingClient brandKey="canadian-standard" /></Suspense>
    </>
  );
}
