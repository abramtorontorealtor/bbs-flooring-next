import { Suspense } from 'react';
import { appalachianFlooringData } from '@/data/brandPages';
import BrandLandingClient from '@/components/BrandLandingClient';
import { faqSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: appalachianFlooringData.title,
  description: appalachianFlooringData.description,
};

export default function AppalachianFlooringPage() {
  return (
    <>
      <JsonLd data={faqSchema(appalachianFlooringData.faqItems)} />
      <Suspense><BrandLandingClient brandKey="appalachian" /></Suspense>
    </>
  );
}
