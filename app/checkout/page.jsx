import { Suspense } from 'react';
import CheckoutClient from '@/components/CheckoutClient';

export const metadata = {
  title: 'Checkout',
  description: 'Complete your flooring order with BBS Flooring.',
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    }>
      <CheckoutClient />
    </Suspense>
  );
}
