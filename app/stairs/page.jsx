import StairsClient from '@/components/StairsClient';
import { stairsSchema, faqSchema, JsonLd } from '@/lib/schemas';
import { STAIRS_FAQS } from '@/data/faqs';

export const metadata = {
  title: 'Staircase Renovation & Installation | Markham, Toronto & Durham',
  description: 'Expert staircase renovation in Markham, Toronto & Durham. Refinishing from $125/step, new treads $185/step. WSIB insured. Call (647) 428-1111.',
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
