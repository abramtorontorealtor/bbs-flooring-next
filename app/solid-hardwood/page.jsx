import { Suspense } from 'react';
import SolidHardwoodClient from '@/components/SolidHardwoodClient';

export const metadata = {
  title: 'Solid Hardwood Flooring Markham | Red Oak, White Oak, Maple | BBS Flooring',
  description:
    'Shop solid hardwood flooring in Markham. Red oak, white oak, maple, hickory — ¾" nail-down hardwood from $5.69/sqft. Free measurements across the GTA. Call (647) 428-1111.',
};

export default function SolidHardwoodPage() {
  return <Suspense><SolidHardwoodClient /></Suspense>;
}
