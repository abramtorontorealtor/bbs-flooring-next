import InstallationClient from '@/components/InstallationClient';
import { installationSchemas, faqSchema, JsonLd } from '@/lib/schemas';
import { INSTALLATION_FAQS } from '@/data/faqs';

export const metadata = {
  title: 'Professional Flooring Installation Markham & GTA 2026 | From $2.00/sqft — BBS Flooring',
  description: 'Expert flooring installation in Markham, Toronto & Durham. Hardwood $2.25/sqft, vinyl/laminate $2.00/sqft. WSIB insured, free in-home measurement. 12+ years experience. Call (647) 428-1111.',
  alternates: { canonical: '/installation' },
};

export default function InstallationPage() {
  return (
    <>
      <JsonLd data={[...installationSchemas(), faqSchema(INSTALLATION_FAQS)]} />
      <InstallationClient />
    </>
  );
}
