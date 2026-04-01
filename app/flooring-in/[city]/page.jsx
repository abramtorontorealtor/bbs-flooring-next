import { Suspense } from 'react';
import LocationClient from '@/components/LocationClient';
import { locationData } from '@/data/locationData';

// Generate static params for all cities
export function generateStaticParams() {
  return Object.keys(locationData).map(city => ({ city }));
}

export function generateMetadata({ params }) {
  const data = locationData[params.city] || locationData['markham'];
  return {
    title: data.title,
    description: data.description,
    alternates: {
      canonical: `https://bbsflooring.ca/flooring-in/${params.city}`,
    },
  };
}

export default function LocationPage({ params }) {
  return <Suspense><LocationClient citySlug={params.city} /></Suspense>;
}
