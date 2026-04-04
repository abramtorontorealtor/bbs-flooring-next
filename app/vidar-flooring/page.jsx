import { Suspense } from 'react';
import { vidarFlooringData } from '@/data/landingPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: vidarFlooringData.title,
  description: vidarFlooringData.description,
};

export default function VidarFlooringPage() {
  return (
    <>
      <JsonLd data={faqSchema(vidarFlooringData.faqItems)} />
      <Suspense><BrandLandingClient brandKey="vidar" /></Suspense>
    </>
  );
}
