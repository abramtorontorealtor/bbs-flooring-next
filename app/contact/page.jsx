import ContactClient from '@/components/ContactClient';
import { JsonLd, localBusinessSchema } from '@/lib/schemas';

export const metadata = {
  title: 'Contact Us | Free Flooring Consultation | Markham',
  description: 'Contact BBS Flooring for a free consultation and quote. Visit our Markham showroom or call (647) 428-1111.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd data={localBusinessSchema()} />
      <ContactClient />
    </>
  );
}
