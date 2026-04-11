import { Suspense } from 'react';
import SolidHardwoodClient from '@/components/SolidHardwoodClient';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { SOLID_HARDWOOD_FAQS } from '@/data/faqs';
import { getProductsForGrid } from '@/lib/products-server';

export const revalidate = 300; // 5-minute ISR

export const metadata = {
  title: 'Solid Hardwood Flooring Markham | Red Oak, White Oak, Maple',
  description:
    'Shop solid hardwood flooring in Markham. Red oak, white oak, maple, hickory — ¾" nail-down hardwood from $5.69/sqft. Free measurements across the GTA. Call (647) 428-1111.',
  alternates: { canonical: '/solid-hardwood' },
};

export default async function SolidHardwoodPage() {
  const products = await getProductsForGrid({ category: 'solid_hardwood' });
  return (
    <>
      <JsonLd data={faqSchema(SOLID_HARDWOOD_FAQS)} />
      <Suspense><SolidHardwoodClient initialProducts={products} /></Suspense>
    </>
  );
}
