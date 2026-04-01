import BlogClient from '@/components/BlogClient';
import { JsonLd } from '@/lib/schemas';

export const metadata = {
  title: 'Flooring Blog - Expert Tips & Trends | BBS Flooring',
  description: 'Expert flooring advice, installation guides, design trends, and maintenance tips from BBS Flooring.',
};

export default function BlogPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bbsflooring.ca/' },
      { '@type': 'ListItem', position: 2, name: 'Blog' },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <BlogClient />
    </>
  );
}
