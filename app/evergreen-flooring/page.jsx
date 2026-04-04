import { Suspense } from 'react';
import { evergreenFlooringData } from '@/data/brandPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: evergreenFlooringData.title,
  description: evergreenFlooringData.description,
};

export default function EvergreenFlooringPage() {
  return (
    <>
      <JsonLd data={faqSchema(evergreenFlooringData.faqItems)} />
      <Suspense><BrandLandingClient brandKey="evergreen" /></Suspense>
    </>
  );
}
