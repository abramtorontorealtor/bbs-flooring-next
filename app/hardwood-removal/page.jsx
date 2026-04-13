import RemovalServiceTemplate from '@/components/RemovalServiceTemplate';
import { hardwoodRemovalData } from '@/data/removalPages';
import { hardwoodRemovalSchemas, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: 'Hardwood Floor Removal | $1.50/sqft | Markham & GTA 2026',
  description: 'Professional hardwood floor removal in Markham, Toronto & Durham for $1.50/sqft + $75 haul-away. Nail-down & glue-down. WSIB insured. Subfloor prepped for new flooring. Call (647) 428-1111.',
  alternates: { canonical: '/hardwood-removal' },
};

export default function HardwoodRemovalPage() {
  return (
    <>
      <JsonLd data={hardwoodRemovalSchemas()} />
      <RemovalServiceTemplate config={hardwoodRemovalData} />
    </>
  );
}
