'use client';

import AdLandingTemplate from '@/components/AdLandingTemplate';
import { flooringClearanceSaleData } from '@/data/landingPages';

export default function FlooringClearanceSaleClient({ initialProducts, serverGrid }) {
  return <AdLandingTemplate {...flooringClearanceSaleData} initialProducts={initialProducts} serverGrid={serverGrid} />;
}
