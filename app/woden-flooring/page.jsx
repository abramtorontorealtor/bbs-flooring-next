import { Suspense } from 'react';
import { wodenFlooringData } from '@/data/brandPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: wodenFlooringData.title,
  description: wodenFlooringData.description,
};

export default function WodenFlooringPage() {
  return (
    <>
      <JsonLd data={faqSchema(wodenFlooringData.faqItems)} />
      <Suspense><BrandLandingClient brandKey="woden" /></Suspense>
    </>
  );
}
