import { Suspense } from 'react';
import { sherwoodFlooringData } from '@/data/brandPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: sherwoodFlooringData.title,
  description: sherwoodFlooringData.description,
};

export default function SherwoodFlooringPage() {
  return (
    <>
      <JsonLd data={faqSchema(sherwoodFlooringData.faqItems)} />
      <Suspense><BrandLandingClient brandKey="sherwood" /></Suspense>
    </>
  );
}
