'use client';

import AdLandingTemplate from '@/components/AdLandingTemplate';
import { whiteOakFlooringData } from '@/data/landingPages';

export default function WhiteOakFlooringClient({ initialProducts, serverGrid }) {
  return <AdLandingTemplate {...whiteOakFlooringData} initialProducts={initialProducts} serverGrid={serverGrid} />;
}
