import AdminProductsClient from '@/components/admin/AdminProductsClient';

export const metadata = {
  title: 'Products — BBS Flooring Admin',
  robots: { index: false, follow: false },
};

export default function AdminProductsPage() {
  return <AdminProductsClient />;
}
