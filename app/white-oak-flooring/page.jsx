import { Suspense } from 'react';
import { whiteOakFlooringData } from '@/data/landingPages';
import WhiteOakFlooringClient from '@/components/WhiteOakFlooringClient';
import { faqSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: whiteOakFlooringData.title,
  description: whiteOakFlooringData.description,
};

export default function WhiteOakFlooringPage() {
  return (
    <>
      <JsonLd data={faqSchema(whiteOakFlooringData.faqItems)} />
      <Suspense><WhiteOakFlooringClient /></Suspense>
    </>
  );
}
