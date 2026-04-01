import { Suspense } from 'react';
import { hardwoodRefinishingData } from '@/data/landingPages';
import HardwoodRefinishingClient from '@/components/HardwoodRefinishingClient';

export const metadata = {
  title: hardwoodRefinishingData.title,
  description: hardwoodRefinishingData.description,
};

export default function HardwoodRefinishingPage() {
  return <Suspense><HardwoodRefinishingClient /></Suspense>;
}
