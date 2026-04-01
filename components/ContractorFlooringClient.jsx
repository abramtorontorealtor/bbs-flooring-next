'use client';

import AdLandingTemplate from '@/components/AdLandingTemplate';
import { contractorFlooringData } from '@/data/landingPages';

export default function ContractorFlooringClient() {
  return <AdLandingTemplate {...contractorFlooringData} />;
}
