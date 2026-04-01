import StairsClient from '@/components/StairsClient';
import { stairsSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: 'Staircase Renovation & Installation | Markham, Toronto & Durham | BBS',
  description: 'Expert staircase renovation in Markham, Toronto & Durham. Refinishing from $125/step, new treads $185/step. WSIB insured. Call (647) 428-1111.',
  alternates: { canonical: '/stairs' },
};

export default function StairsPage() {
  return (
    <>
      <JsonLd data={stairsSchema()} />
      <StairsClient />
    </>
  );
}
