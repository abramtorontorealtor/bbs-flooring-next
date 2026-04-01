import { Suspense } from 'react';
import CompareClient from '@/components/CompareClient';

export const metadata = {
  title: 'Compare Products | BBS Flooring Markham',
  description:
    'Compare flooring products side-by-side. Engineered hardwood, vinyl, laminate, and solid hardwood — specs, pricing, and features at a glance. BBS Flooring Markham.',
  robots: { index: false, follow: true },
};

export default function ComparePage() {
  return <Suspense><CompareClient /></Suspense>;
}
