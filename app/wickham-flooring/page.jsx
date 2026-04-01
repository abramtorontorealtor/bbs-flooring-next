import { Suspense } from 'react';
import { wickhamFlooringData } from '@/data/landingPages';
import WickhamFlooringClient from '@/components/WickhamFlooringClient';

export const metadata = {
  title: wickhamFlooringData.title,
  description: wickhamFlooringData.description,
};

export default function WickhamFlooringPage() {
  return <Suspense><WickhamFlooringClient /></Suspense>;
}
