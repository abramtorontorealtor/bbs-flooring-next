import AdminOrdersClient from '@/components/admin/AdminOrdersClient';

export const metadata = {
  title: 'Orders — BBS Flooring Admin',
  robots: { index: false, follow: false },
};

export default function AdminOrdersPage() {
  return <AdminOrdersClient />;
}
