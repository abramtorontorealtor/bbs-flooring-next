'use client';

import AdLandingTemplate from './AdLandingTemplate';
import { contractorFlooringData } from '@/data/landingPages';
import ContractorRegistrationForm from './ContractorRegistrationForm';

export default function ContractorFlooringClient() {
  return (
    <>
      <AdLandingTemplate {...contractorFlooringData} />
      <ContractorRegistrationForm />
    </>
  );
}
