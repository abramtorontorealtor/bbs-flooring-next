import InstallationClient from '@/components/InstallationClient';
import { installationSchemas, faqSchema, JsonLd } from '@/lib/schemas';
import { INSTALLATION_FAQS } from '@/data/faqs';
import AnswerBlock from '@/components/AnswerBlock';

export const metadata = {
  title: 'Professional Flooring Installation Markham & GTA 2026 | From $2.00/sqft',
  description: 'Expert flooring installation in Markham, Toronto & Durham. Hardwood $2.25/sqft, vinyl/laminate $2.00/sqft. WSIB insured, free in-home measurement. Serving the GTA since 2012. Call (647) 428-1111.',
  alternates: { canonical: '/installation' },
};

export default function InstallationPage() {
  return (
    <>
      <JsonLd data={[...installationSchemas(), faqSchema(INSTALLATION_FAQS)]} />
      <InstallationClient
        answerBlock={
          <AnswerBlock
            compact
            id="installation-cost-answer"
            question="How much does flooring installation cost in Markham and the GTA?"
            answer="At BBS Flooring, installation labour starts at $2.00/sqft for vinyl and laminate and $2.25/sqft for hardwood, with herringbone from $4.25/sqft. Material, delivery and old-floor removal are quoted as separate line items. BBS Flooring is a family-owned Markham flooring store (since 2012) that installs with its own crews and measures your home free of charge anywhere in the GTA."
          />
        }
      />
    </>
  );
}
