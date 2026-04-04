import { Suspense } from 'react';
import { northernestFlooringData } from '@/data/brandPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: northernestFlooringData.title,
  description: northernestFlooringData.description,
};

export default function NorthernestFlooringPage() {
  return (
    <>
      <JsonLd data={faqSchema(northernestFlooringData.faqItems)} />
      <Suspense><BrandLandingClient brandKey="northernest" /></Suspense>
    </>
  );
}
