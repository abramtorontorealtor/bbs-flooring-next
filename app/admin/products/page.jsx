import AdminProductsClient from '@/components/admin/AdminProductsClient';

export const metadata = {
  title: 'Products',
  robots: { index: false, follow: false },
};

export default function AdminProductsPage() {
  return <AdminProductsClient />;
}
