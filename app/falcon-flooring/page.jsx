import { Suspense } from 'react';
import { falconFlooringData } from '@/data/brandPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: falconFlooringData.title,
  description: falconFlooringData.description,
};

export default function FalconFlooringPage() {
  return (
    <>
      <JsonLd data={faqSchema(falconFlooringData.faqItems)} />
      <Suspense><BrandLandingClient brandKey="falcon" /></Suspense>
    </>
  );
}
