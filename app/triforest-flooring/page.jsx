import { Suspense } from 'react';
import { triforestFlooringData } from '@/data/brandPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: triforestFlooringData.title,
  description: triforestFlooringData.description,
};

export default function TriforestFlooringPage() {
  return (
    <>
      <JsonLd data={faqSchema(triforestFlooringData.faqItems)} />
      <Suspense><BrandLandingClient brandKey="triforest" /></Suspense>
    </>
  );
}
