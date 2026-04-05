import AdminProductEnrichmentClient from '@/components/admin/AdminProductEnrichmentClient';

export const metadata = {
  title: 'Product Enrichment',
  robots: { index: false, follow: false },
};

export default function AdminProductEnrichmentPage() {
  return <AdminProductEnrichmentClient />;
}
