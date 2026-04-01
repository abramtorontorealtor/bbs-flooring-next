'use client';

import AdLandingTemplate from '@/components/AdLandingTemplate';
import { vidarFlooringData } from '@/data/landingPages';

export default function VidarFlooringClient() {
  return <AdLandingTemplate {...vidarFlooringData} />;
}
