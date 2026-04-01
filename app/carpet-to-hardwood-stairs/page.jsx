import { Suspense } from 'react';
import { carpetToHardwoodStairsData } from '@/data/landingPages';
import CarpetToHardwoodStairsClient from '@/components/CarpetToHardwoodStairsClient';
import { faqSchema, localBusinessSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: carpetToHardwoodStairsData.title,
  description: carpetToHardwoodStairsData.description,
  alternates: { canonical: '/carpet-to-hardwood-stairs' },
};

export default function CarpetToHardwoodStairsPage() {
  const schemas = [
    faqSchema(carpetToHardwoodStairsData.faqItems),
    carpetToHardwoodStairsData.schemaType !== 'product' && localBusinessSchema(),
  ].filter(Boolean);

  return (
    <>
      <JsonLd data={schemas} />
      <Suspense><CarpetToHardwoodStairsClient /></Suspense>
    </>
  );
}
