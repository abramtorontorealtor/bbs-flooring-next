import FreeMeasurementClient from '@/components/FreeMeasurementClient';
import { freeMeasurementSchema, faqSchema, JsonLd } from '@/lib/schemas';
import { FREE_MEASUREMENT_FAQS } from '@/data/faqs';

export const metadata = {
  title: 'Free In-Home Flooring Measurement Markham & GTA 2026 — BBS Flooring',
  description: 'Book a free, no-obligation in-home flooring measurement in Markham, Toronto & Durham. Accurate quotes for hardwood, vinyl, laminate & tile installation. Call (647) 428-1111.',
  alternates: { canonical: '/free-measurement' },
};

export default function FreeMeasurementPage() {
  return (
    <>
      <JsonLd data={[freeMeasurementSchema(), faqSchema(FREE_MEASUREMENT_FAQS)]} />
      <FreeMeasurementClient />
    </>
  );
}
