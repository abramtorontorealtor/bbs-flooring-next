import { Suspense } from 'react';
import { waterproofFlooringData } from '@/data/landingPages';
import WaterproofFlooringClient from '@/components/WaterproofFlooringClient';

export const metadata = {
  title: waterproofFlooringData.title,
  description: waterproofFlooringData.description,
  alternates: { canonical: '/waterproof-flooring' },
};

export default function WaterproofFlooringPage() {
  return <Suspense><WaterproofFlooringClient /></Suspense>;
}
