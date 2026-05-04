import { Suspense } from 'react';
import { flooringShowroomMarkhamData } from '@/data/landingPages';
import FlooringShowroomMarkhamClient from '@/components/FlooringShowroomMarkhamClient';
import { faqSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: flooringShowroomMarkhamData.title,
  description: flooringShowroomMarkhamData.description,
};

export default function FlooringShowroomMarkhamPage() {
  const schemas = [
    faqSchema(flooringShowroomMarkhamData.faqItems),
  ].filter(Boolean);

  return (
    <>
      <JsonLd data={schemas} />
      <Suspense><FlooringShowroomMarkhamClient /></Suspense>
    </>
  );
}
