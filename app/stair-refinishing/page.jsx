import { Suspense } from 'react';
import { stairRefinishingData } from '@/data/landingPages';
import StairRefinishingClient from '@/components/StairRefinishingClient';

export const metadata = {
  title: stairRefinishingData.title,
  description: stairRefinishingData.description,
};

export default function StairRefinishingPage() {
  return <Suspense><StairRefinishingClient /></Suspense>;
}
