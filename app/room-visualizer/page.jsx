import { Suspense } from 'react';
import RoomVisualizerClient from '@/components/RoomVisualizerClient';

export const metadata = {
  title: 'Room Visualizer | See Flooring in Your Space',
  description:
    'Upload a photo of your room and see exactly how our flooring looks — powered by AI. Try hardwood, vinyl, or laminate instantly. Free, no account needed.',
  robots: { index: false, follow: false },
};

export default function RoomVisualizerPage() {
  return (
    <Suspense>
      <RoomVisualizerClient />
    </Suspense>
  );
}
