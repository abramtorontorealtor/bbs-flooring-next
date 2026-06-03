import { Suspense } from 'react';
import ClearanceClient from '@/components/ClearanceClient';

export const metadata = {
  title: 'Flooring Sale & Clearance Markham | Up to 60% Off',
  description:
    'Shop flooring sale and clearance in Markham. First-quality engineered hardwood, vinyl, and laminate — up to 60% off. Premium brands at better prices. Call (647) 428-1111.',
  alternates: { canonical: '/clearance' },
};

export default function ClearancePage() {
  return <Suspense><ClearanceClient /></Suspense>;
}
