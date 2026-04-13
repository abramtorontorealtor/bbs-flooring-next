import CarpetRemovalClient from '@/components/CarpetRemovalClient';
import { carpetRemovalSchemas, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: 'Carpet Removal Service Markham & GTA 2026 | $1.00/sqft',
  description: 'Professional carpet removal in Markham, Toronto & Durham for $1.00/sqft + $75 haul-away. 24-hr turnaround, install-ready subfloor guaranteed. WSIB insured. Call (647) 428-1111.',
  alternates: { canonical: '/carpet-removal' },
};

export default function CarpetRemovalPage() {
  return (
    <>
      <JsonLd data={carpetRemovalSchemas()} />
      <CarpetRemovalClient />
    </>
  );
}
