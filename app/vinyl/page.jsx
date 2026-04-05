import { Suspense } from 'react';
import VinylClient from '@/components/VinylClient';

export const metadata = {
  title: 'Vinyl Flooring Markham | LVP & SPC Waterproof',
  description:
    'Shop luxury vinyl plank (LVP) and SPC waterproof flooring in Markham. 100+ styles from $1.79/sqft. Perfect for basements, kitchens, bathrooms. Free measurements. Call (647) 428-1111.',
  alternates: { canonical: '/vinyl' },
};

export default function VinylPage() {
  return <Suspense><VinylClient /></Suspense>;
}
