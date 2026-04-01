import { Suspense } from 'react';
import QuoteBookingClient from '@/components/QuoteBookingClient';

export const metadata = {
  title: 'Book Your Free Measurement — BBS Flooring',
  description: 'Schedule a free in-home measurement with BBS Flooring. Our team will come to you.',
  alternates: { canonical: '/quote-booking' },
};

export default function QuoteBookingPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-12"><div className="h-96 bg-slate-100 rounded-2xl animate-pulse" /></div>}>
      <QuoteBookingClient />
    </Suspense>
  );
}
