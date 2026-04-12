'use client';

import AdLandingTemplate from '@/components/AdLandingTemplate';
import { basementFlooringData } from '@/data/landingPages';

export default function BasementFlooringClient({ initialProducts, serverGrid }) {
  return <AdLandingTemplate {...basementFlooringData} initialProducts={initialProducts} serverGrid={serverGrid} />;
}
