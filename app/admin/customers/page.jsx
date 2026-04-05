import AdminCustomersClient from '@/components/admin/AdminCustomersClient';

export const metadata = {
  title: 'Customer CRM',
  robots: { index: false, follow: false },
};

export default function AdminCustomersPage() {
  return <AdminCustomersClient />;
}
