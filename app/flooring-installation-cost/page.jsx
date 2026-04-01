import { Suspense } from 'react';
import { flooringInstallationCostData } from '@/data/landingPages';
import FlooringInstallationCostClient from '@/components/FlooringInstallationCostClient';

export const metadata = {
  title: flooringInstallationCostData.title,
  description: flooringInstallationCostData.description,
};

export default function FlooringInstallationCostPage() {
  return <Suspense><FlooringInstallationCostClient /></Suspense>;
}
