import FaqClient from './FaqClient';
import { faqSchema, JsonLd } from '@/lib/schemas';
import { ALL_GENERAL_FAQS } from '@/data/general-faqs';

export const metadata = {
  title: 'FAQ — Flooring Prices, Installation & Delivery',
  description:
    'Answers to the most common flooring questions: prices from $1.49/sqft, installation from $2.00/sqft, free in-home measurement, 1,000+ products from 15 brands. Markham showroom, GTA-wide service.',
  alternates: { canonical: '/faq' },
};

export default function FaqPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://bbsflooring.ca/',
      },
      { '@type': 'ListItem', position: 2, name: 'FAQ' },
    ],
  };

  return (
    <>
      <JsonLd data={[breadcrumbSchema, faqSchema(ALL_GENERAL_FAQS)]} />
      <FaqClient />
    </>
  );
}
