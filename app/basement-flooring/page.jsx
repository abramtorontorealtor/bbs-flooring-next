import { Suspense } from 'react';
import { basementFlooringData } from '@/data/landingPages';
import BasementFlooringClient from '@/components/BasementFlooringClient';

export const metadata = {
  title: basementFlooringData.title,
  description: basementFlooringData.description,
  alternates: { canonical: '/basement-flooring' },
};

export default function BasementFlooringPage() {
  return <Suspense><BasementFlooringClient /></Suspense>;
}
