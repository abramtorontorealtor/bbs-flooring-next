'use client';

import CategoryFilterGrid from '@/components/CategoryFilterGrid';
import * as brandData from '@/data/brandPages';
import { vidarFlooringData, wickhamFlooringData, basementFlooringData, waterproofFlooringData, whiteOakFlooringData, flooringClearanceSaleData, flooringShowroomMarkhamData } from '@/data/landingPages';

/**
 * BrandProductGrid — client island for brand landing pages.
 * Renders ONLY the interactive product grid with brand-specific filtering.
 * All SEO content is rendered server-side in BrandLandingServer.
 */

const BRAND_DATA_MAP = {
  naf: brandData.nafFlooringData,
  northernest: brandData.northernestFlooringData,
  woden: brandData.wodenFlooringData,
  falcon: brandData.falconFlooringData,
  'canadian-standard': brandData.canadianStandardFlooringData,
  triforest: brandData.triforestFlooringData,
  simba: brandData.simbaFlooringData,
  lee: brandData.leeFlooringData,
  tosca: brandData.toscaFlooringData,
  appalachian: brandData.appalachianFlooringData,
  evergreen: brandData.evergreenFlooringData,
  sherwood: brandData.sherwoodFlooringData,
  'golden-choice': brandData.goldenChoiceFlooringData,
  impressive: brandData.impressiveFlooringData,
  'canadian-made': brandData.canadianMadeFlooringData,
  'canadian-made-toronto': brandData.canadianMadeFlooringTorontoData,
  vidar: vidarFlooringData,
  wickham: wickhamFlooringData,
  // Keyword pages
  basement: basementFlooringData,
  waterproof: waterproofFlooringData,
  'white-oak': whiteOakFlooringData,
  'clearance-sale': flooringClearanceSaleData,
  showroom: flooringShowroomMarkhamData,
};

export default function BrandProductGrid({ brandKey, initialProducts, serverGrid }) {
  const data = BRAND_DATA_MAP[brandKey];
  if (!data) return null;

  return (
    <CategoryFilterGrid
      categoryFilter={data.productFilter}
      sessionKey={data.productSessionKey || 'landing'}
      queryKey={data.productQueryKey || 'products-landing'}
      hideBrand={data.hideBrandFilter}
      initialProducts={initialProducts}
      serverGrid={serverGrid}
    />
  );
}
