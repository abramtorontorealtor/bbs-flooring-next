import RemovalServiceTemplate from '@/components/RemovalServiceTemplate';
import { tileRemovalData } from '@/data/removalPages';
import { tileRemovalSchemas, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: 'Tile Removal Service | $3.00/sqft | Markham & GTA 2026',
  description: 'Professional tile removal in Markham, Toronto & Durham for $3.00/sqft + $75 haul-away. Ceramic, porcelain & stone. Thinset grinding included. WSIB insured. Call (647) 428-1111.',
  alternates: { canonical: '/tile-removal' },
};

export default function TileRemovalPage() {
  return (
    <>
      <JsonLd data={tileRemovalSchemas()} />
      <RemovalServiceTemplate config={tileRemovalData} />
    </>
  );
}
