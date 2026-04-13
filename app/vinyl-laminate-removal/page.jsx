import RemovalServiceTemplate from '@/components/RemovalServiceTemplate';
import { vinylLaminateRemovalData } from '@/data/removalPages';
import { vinylLaminateRemovalSchemas, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: 'Vinyl & Laminate Removal | $1.50/sqft | Markham & GTA 2026',
  description: 'Professional vinyl & laminate floor removal in Markham, Toronto & Durham for $1.50/sqft + $75 haul-away. Click-lock & glue-down. WSIB insured. Fast turnaround. Call (647) 428-1111.',
  alternates: { canonical: '/vinyl-laminate-removal' },
};

export default function VinylLaminateRemovalPage() {
  return (
    <>
      <JsonLd data={vinylLaminateRemovalSchemas()} />
      <RemovalServiceTemplate config={vinylLaminateRemovalData} />
    </>
  );
}
