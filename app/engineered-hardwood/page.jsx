import { Suspense } from 'react';
import EngineeredHardwoodClient from '@/components/EngineeredHardwoodClient';

export const metadata = {
  title: 'Engineered Hardwood Flooring Markham | Vidar, Wickham & More | BBS Flooring',
  description:
    'Shop engineered hardwood flooring in Markham. Vidar, Wickham, wide-plank European oak. 100+ styles in stock. Free measurements across the GTA. Call (647) 428-1111.',
  alternates: { canonical: '/engineered-hardwood' },
};

export default function EngineeredHardwoodPage() {
  return <Suspense><EngineeredHardwoodClient /></Suspense>;
}
