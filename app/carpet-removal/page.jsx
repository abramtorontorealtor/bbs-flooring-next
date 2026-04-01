import CarpetRemovalClient from '@/components/CarpetRemovalClient';
import { carpetRemovalSchemas, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: 'Fast Carpet Removal Service | Markham, Toronto & Durham',
  description: 'Professional carpet rip-out, haul-away, and subfloor prep for $1.00/sqft. Get a clean slate for your new floors. Serving Markham, Toronto, and Durham.',
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
