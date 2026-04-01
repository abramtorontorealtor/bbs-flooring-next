import { Suspense } from 'react';
import { carpetToHardwoodStairsData } from '@/data/landingPages';
import CarpetToHardwoodStairsClient from '@/components/CarpetToHardwoodStairsClient';

export const metadata = {
  title: carpetToHardwoodStairsData.title,
  description: carpetToHardwoodStairsData.description,
};

export default function CarpetToHardwoodStairsPage() {
  return <Suspense><CarpetToHardwoodStairsClient /></Suspense>;
}
