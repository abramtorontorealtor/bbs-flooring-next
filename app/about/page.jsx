import AboutClient from '@/components/AboutClient';
import { JsonLd, localBusinessSchema, organizationSchema } from '@/lib/schemas';

export const metadata = {
  title: 'About Us | Family-Owned Flooring Since 2010 | Markham',
  description: 'Family-owned flooring company in Markham serving Toronto & Durham since 2010. 794+ products, expert installation. Visit our showroom at 6061 Highway 7.',
  alternates: { canonical: '/about' },
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
      <JsonLd data={[localBusinessSchema(), organizationSchema(), breadcrumbSchema]} />
      <AboutClient />
    </>
  );
}
