import AdminSEOClient from '@/components/admin/AdminSEOClient';

export const metadata = {
  title: 'SEO Optimization',
  robots: { index: false, follow: false },
};

export default function AdminSEOPage() {
  return <AdminSEOClient />;
}
