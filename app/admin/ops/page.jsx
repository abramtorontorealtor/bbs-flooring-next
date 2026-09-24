import { Suspense } from 'react';
import AdminOpsClient from '@/components/admin/AdminOpsClient';

export const metadata = {
  title: 'Ops board',
  robots: { index: false, follow: false },
};

export default function AdminOpsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><div className="h-96 bg-slate-100 rounded-2xl animate-pulse" /></div>}>
      <AdminOpsClient />
    </Suspense>
  );
}
