import AdminSEOClient from '@/components/admin/AdminSEOClient';

export const metadata = {
  title: 'SEO Optimization — BBS Flooring Admin',
  robots: { index: false, follow: false },
};

export default function AdminSEOPage() {
  return <AdminSEOClient />;
}
