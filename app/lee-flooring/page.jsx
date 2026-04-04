import { Suspense } from 'react';
import { leeFlooringData } from '@/data/brandPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: leeFlooringData.title,
  description: leeFlooringData.description,
};

export default function LeeFlooringPage() {
  return (
    <>
      <JsonLd data={faqSchema(leeFlooringData.faqItems)} />
      <Suspense><BrandLandingClient brandKey="lee" /></Suspense>
    </>
  );
}
