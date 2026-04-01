import { Suspense } from 'react';
import { contractorFlooringData } from '@/data/landingPages';
import ContractorFlooringClient from '@/components/ContractorFlooringClient';
import { faqSchema, localBusinessSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: contractorFlooringData.title,
  description: contractorFlooringData.description,
};

export default function ContractorFlooringPage() {
  const schemas = [
    faqSchema(contractorFlooringData.faqItems),
    contractorFlooringData.schemaType !== 'product' && localBusinessSchema(),
  ].filter(Boolean);

  return (
    <>
      <JsonLd data={schemas} />
      <Suspense><ContractorFlooringClient /></Suspense>
    </>
  );
}
