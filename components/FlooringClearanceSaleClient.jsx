'use client';

import AdLandingTemplate from '@/components/AdLandingTemplate';
import { flooringClearanceSaleData } from '@/data/landingPages';

export default function FlooringClearanceSaleClient() {
  return <AdLandingTemplate {...flooringClearanceSaleData} />;
}
