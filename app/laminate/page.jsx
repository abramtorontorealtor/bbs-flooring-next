import { Suspense } from 'react';
import LaminateClient from '@/components/LaminateClient';

export const metadata = {
  title: 'Laminate Flooring Markham | 12mm from $1.49/sqft',
  description:
    'Shop premium 12mm laminate flooring in Markham. AC4/AC5 rated, water-resistant, from $1.49/sqft. 500 sqft installed from $1,745. Free measurements. Call (647) 428-1111.',
  alternates: { canonical: '/laminate' },
};

export default function LaminatePage() {
  return <Suspense><LaminateClient /></Suspense>;
}
