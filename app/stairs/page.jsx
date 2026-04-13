import StairsClient from '@/components/StairsClient';
import { stairsSchema, faqSchema, JsonLd } from '@/lib/schemas';
import { STAIRS_FAQS } from '@/data/faqs';

export const metadata = {
  title: 'Staircase Renovation & Installation Markham & GTA 2026 | From $125/Step',
  description: 'Expert staircase renovation in Markham, Toronto & Durham. Refinishing from $125/step, new treads from $185/step, specialty steps $225/step. WSIB insured, free assessment. Call (647) 428-1111.',
  alternates: { canonical: '/stairs' },
};

export default function StairsPage() {
  return (
    <>
      <JsonLd data={[stairsSchema(), faqSchema(STAIRS_FAQS)]} />
      <StairsClient />
    </>
  );
}
