import { Suspense } from 'react';
import { vidarFlooringData } from '@/data/landingPages';
import VidarFlooringClient from '@/components/VidarFlooringClient';

export const metadata = {
  title: vidarFlooringData.title,
  description: vidarFlooringData.description,
};

export default function VidarFlooringPage() {
  return <Suspense><VidarFlooringClient /></Suspense>;
}
