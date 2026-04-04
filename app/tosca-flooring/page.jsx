import { Suspense } from 'react';
import { toscaFlooringData } from '@/data/brandPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: toscaFlooringData.title,
  description: toscaFlooringData.description,
};

export default function ToscaFlooringPage() {
  return (
    <>
      <JsonLd data={faqSchema(toscaFlooringData.faqItems)} />
      <Suspense><BrandLandingClient brandKey="tosca" /></Suspense>
    </>
  );
}
