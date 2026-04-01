import { Suspense } from 'react';
import ClearanceClient from '@/components/ClearanceClient';

export const metadata = {
  title: 'Flooring Clearance Sale Markham | 30–60% Off | BBS Flooring',
  description:
    'Shop flooring clearance in Markham. First-quality hardwood, vinyl, and laminate at 30–60% off. Limited quantities — when it\'s gone, it\'s gone. Call (647) 428-1111.',
  alternates: { canonical: '/clearance' },
};

export default function ClearancePage() {
  return <Suspense><ClearanceClient /></Suspense>;
}
