'use client';

import AdLandingTemplate from '@/components/AdLandingTemplate';
import { basementFlooringData } from '@/data/landingPages';

export default function BasementFlooringClient() {
  return <AdLandingTemplate {...basementFlooringData} />;
}
