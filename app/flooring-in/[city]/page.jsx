import { Suspense } from 'react';
import LocationClient from '@/components/LocationClient';
import { locationData } from '@/data/locationData';
import { cityLocalBusinessSchema, JsonLd } from '@/lib/schemas';

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
  const data = locationData[params.city] || locationData['markham'];
  return (
    <>
      <JsonLd data={cityLocalBusinessSchema(data.city, data.content)} />
      <Suspense><LocationClient citySlug={params.city} /></Suspense>
    </>
  );
}
