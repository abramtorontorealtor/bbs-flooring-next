import { Suspense } from 'react';
import AdminCRMClient from '@/components/admin/AdminCRMClient';
import { resolveStoreMode } from '@/lib/booking/supabase-store';

export const metadata = {
  title: 'Lead Command Center',
  robots: { index: false, follow: false },
};

export default function AdminCRMPage() {
  // Server-side BOOKING_STORE_MODE. The amber "Calendar not verified" note shows only in 'full' mode (decision 10(2)).
  const bookingStoreMode = resolveStoreMode(process.env);
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><div className="h-96 bg-slate-100 rounded-2xl animate-pulse" /></div>}>
      <AdminCRMClient bookingStoreMode={bookingStoreMode} />
    </Suspense>
  );
}
