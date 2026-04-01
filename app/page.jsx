import { Suspense } from 'react';
import HomeClient from '@/components/HomeClient';

export const metadata = {
  title: 'BBS Flooring | Markham, Toronto & Durham | Free Quote',
  description: 'Premium flooring in Markham, Toronto & Durham. Hardwood, vinyl, laminate. 600+ products, expert installation. Free measurements. Call (647) 428-1111!',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'BBS Flooring | Premium Flooring in Markham, Toronto & Durham',
    description: 'Premium flooring in Markham, Toronto & Durham. 600+ products, expert installation. Free measurements.',
    images: [
      {
        url: 'https://cdn.bbsflooring.ca/storage/v1/object/public/Base44/hero-optimized.webp',
        width: 1920,
        height: 1080,
        alt: 'BBS Flooring showroom and installation services in Markham',
      },
    ],
  },
};

export default function HomePage() {
  return <Suspense><HomeClient /></Suspense>;
}
