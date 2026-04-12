'use client';

import AdLandingTemplate from '@/components/AdLandingTemplate';
import { waterproofFlooringData } from '@/data/landingPages';

export default function WaterproofFlooringClient({ initialProducts, serverGrid }) {
  return <AdLandingTemplate {...waterproofFlooringData} initialProducts={initialProducts} serverGrid={serverGrid} />;
}
