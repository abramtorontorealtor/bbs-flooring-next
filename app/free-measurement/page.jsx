import FreeMeasurementClient from '@/components/FreeMeasurementClient';
import { freeMeasurementSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: 'Free In-Home Flooring Measurement | BBS Flooring Markham',
  description: 'Book a free, no-obligation in-home flooring measurement. Serving Markham, Toronto & Durham. Call (647) 428-1111.',
};

export default function FreeMeasurementPage() {
  return (
    <>
      <JsonLd data={freeMeasurementSchema()} />
      <FreeMeasurementClient />
    </>
  );
}
