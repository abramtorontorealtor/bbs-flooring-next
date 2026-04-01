import { Suspense } from 'react';
import { flooringShowroomMarkhamData } from '@/data/landingPages';
import FlooringShowroomMarkhamClient from '@/components/FlooringShowroomMarkhamClient';

export const metadata = {
  title: flooringShowroomMarkhamData.title,
  description: flooringShowroomMarkhamData.description,
};

export default function FlooringShowroomMarkhamPage() {
  return <Suspense><FlooringShowroomMarkhamClient /></Suspense>;
}
