'use client';

import AdLandingTemplate from '@/components/AdLandingTemplate';
import { wickhamFlooringData } from '@/data/landingPages';

export default function WickhamFlooringClient() {
  return <AdLandingTemplate {...wickhamFlooringData} />;
}
