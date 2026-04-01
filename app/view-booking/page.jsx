import { Suspense } from 'react';
import ViewBookingClient from '@/components/ViewBookingClient';

export const metadata = {
  title: 'Your Booking — BBS Flooring',
  robots: { index: false, follow: false },
};

export default function ViewBookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-slate-600">Loading...</div></div>}>
      <ViewBookingClient />
    </Suspense>
  );
}
