'use client';

import AdLandingTemplate from '@/components/AdLandingTemplate';
import { flooringInstallationCostData } from '@/data/landingPages';

export default function FlooringInstallationCostClient() {
  return <AdLandingTemplate {...flooringInstallationCostData} />;
}
