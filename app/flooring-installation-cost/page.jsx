import { Suspense } from 'react';
import { flooringInstallationCostData } from '@/data/landingPages';
import FlooringInstallationCostClient from '@/components/FlooringInstallationCostClient';
import { faqSchema, localBusinessSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: flooringInstallationCostData.title,
  description: flooringInstallationCostData.description,
};

export default function FlooringInstallationCostPage() {
  const schemas = [
    faqSchema(flooringInstallationCostData.faqItems),
    flooringInstallationCostData.schemaType !== 'product' && localBusinessSchema(),
  ].filter(Boolean);

  return (
    <>
      <JsonLd data={schemas} />
      <Suspense><FlooringInstallationCostClient /></Suspense>
    </>
  );
}
