import { Suspense } from 'react';
import { flooringClearanceSaleData } from '@/data/landingPages';
import FlooringClearanceSaleClient from '@/components/FlooringClearanceSaleClient';

export const metadata = {
  title: flooringClearanceSaleData.title,
  description: flooringClearanceSaleData.description,
};

export default function FlooringClearanceSalePage() {
  return <Suspense><FlooringClearanceSaleClient /></Suspense>;
}
