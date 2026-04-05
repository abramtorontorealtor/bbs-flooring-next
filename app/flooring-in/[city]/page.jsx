import { Suspense } from 'react';
import LocationClient from '@/components/LocationClient';
import { locationData } from '@/data/locationData';
import { cityLocalBusinessSchema, JsonLd } from '@/lib/schemas';

// Generate static params for all cities
export function generateStaticParams() {
  return Object.keys(locationData).map(city => ({ city }));
}

export async function generateMetadata({ params }) {
  const { city } = await params;
  const data = locationData[city] || locationData['markham'];
  // Strip "| BBS Flooring" if present in data.title — root layout template adds it
  const title = data.title ? data.title.replace(/\s*\|\s*BBS\s*Flooring\s*$/i, '').trim() : data.title;
  return {
    title,
    description: data.description,
    alternates: {
      canonical: `/flooring-in/${city}`,
    },
  };
}

export default async function LocationPage({ params }) {
  const { city } = await params;
  const data = locationData[city] || locationData['markham'];
  return (
    <>
      <JsonLd data={cityLocalBusinessSchema(data.city, data.content)} />
      <Suspense><LocationClient citySlug={city} /></Suspense>
    </>
  );
}
