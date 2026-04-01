import { Suspense } from 'react';
import { flooringShowroomMarkhamData } from '@/data/landingPages';
import FlooringShowroomMarkhamClient from '@/components/FlooringShowroomMarkhamClient';
import { faqSchema, localBusinessSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: flooringShowroomMarkhamData.title,
  description: flooringShowroomMarkhamData.description,
};

export default function FlooringShowroomMarkhamPage() {
  const schemas = [
    faqSchema(flooringShowroomMarkhamData.faqItems),
    localBusinessSchema(), // showroom page ALWAYS gets LocalBusiness
  ].filter(Boolean);

  return (
    <>
      <JsonLd data={schemas} />
      <Suspense><FlooringShowroomMarkhamClient /></Suspense>
    </>
  );
}
