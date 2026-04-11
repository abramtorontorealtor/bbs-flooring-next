'use client';

import AdLandingTemplate from '@/components/AdLandingTemplate';
import * as brandData from '@/data/brandPages';
import { vidarFlooringData, wickhamFlooringData } from '@/data/landingPages';

/**
 * Reusable brand landing page client component.
 * Accepts a `brandKey` that maps to an export in brandPages.js or landingPages.js.
 */

const BRAND_DATA_MAP = {
  // New brand pages (from brandPages.js)
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
  // Legacy brand pages (from landingPages.js)
  vidar: vidarFlooringData,
  wickham: wickhamFlooringData,
};

export default function BrandLandingClient({ brandKey, initialProducts }) {
  const data = BRAND_DATA_MAP[brandKey];
  if (!data) return null;
  return <AdLandingTemplate {...data} initialProducts={initialProducts} />;
}
