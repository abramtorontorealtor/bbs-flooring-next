import AboutClient from '@/components/AboutClient';
import { JsonLd, localBusinessSchema } from '@/lib/schemas';

export const metadata = {
  title: 'About BBS Flooring | Family-Owned Since 2010 | Markham',
  description: 'Family-owned flooring company in Markham serving Toronto & Durham since 2010. 600+ products, expert installation. Visit our showroom.',
};

export default function AboutPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bbsflooring.ca/' },
      { '@type': 'ListItem', position: 2, name: 'About' },
    ],
  };

  return (
    <>
      <JsonLd data={[localBusinessSchema(), breadcrumbSchema]} />
      <AboutClient />
    </>
  );
}
