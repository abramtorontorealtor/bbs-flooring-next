import { Suspense } from 'react';
import AdminCRMClient from '@/components/admin/AdminCRMClient';

export const metadata = {
  title: 'Lead Command Center',
  robots: { index: false, follow: false },
};

export default function AdminCRMPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><div className="h-96 bg-slate-100 rounded-2xl animate-pulse" /></div>}>
      <AdminCRMClient />
    </Suspense>
  );
}
