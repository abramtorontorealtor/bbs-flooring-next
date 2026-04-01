import { Suspense } from 'react';
import { contractorFlooringData } from '@/data/landingPages';
import ContractorFlooringClient from '@/components/ContractorFlooringClient';

export const metadata = {
  title: contractorFlooringData.title,
  description: contractorFlooringData.description,
};

export default function ContractorFlooringPage() {
  return <Suspense><ContractorFlooringClient /></Suspense>;
}
