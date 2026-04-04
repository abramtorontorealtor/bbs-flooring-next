import { Suspense } from 'react';
import { nafFlooringData } from '@/data/brandPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: nafFlooringData.title,
  description: nafFlooringData.description,
};

export default function NafFlooringPage() {
  return (
    <>
      <JsonLd data={faqSchema(nafFlooringData.faqItems)} />
      <Suspense><BrandLandingClient brandKey="naf" /></Suspense>
    </>
  );
}
