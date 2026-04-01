import { Suspense } from 'react';
import { whiteOakFlooringData } from '@/data/landingPages';
import WhiteOakFlooringClient from '@/components/WhiteOakFlooringClient';

export const metadata = {
  title: whiteOakFlooringData.title,
  description: whiteOakFlooringData.description,
};

export default function WhiteOakFlooringPage() {
  return <Suspense><WhiteOakFlooringClient /></Suspense>;
}
