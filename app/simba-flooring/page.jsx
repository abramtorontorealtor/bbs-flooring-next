import { Suspense } from 'react';
import { simbaFlooringData } from '@/data/brandPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: simbaFlooringData.title,
  description: simbaFlooringData.description,
};

export default function SimbaFlooringPage() {
  return (
    <>
      <JsonLd data={faqSchema(simbaFlooringData.faqItems)} />
      <Suspense><BrandLandingClient brandKey="simba" /></Suspense>
    </>
  );
}
