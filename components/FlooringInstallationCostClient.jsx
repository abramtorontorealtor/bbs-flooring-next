'use client';

import AdLandingTemplate from '@/components/AdLandingTemplate';
import { flooringInstallationCostData } from '@/data/landingPages';
import InstallCostCalculator from '@/components/InstallCostCalculator';

export default function FlooringInstallationCostClient() {
  return (
    <div>
      <AdLandingTemplate {...flooringInstallationCostData} />
      <div className="max-w-4xl mx-auto px-4 -mt-8 mb-16">
        <InstallCostCalculator />
      </div>
    </div>
  );
}
