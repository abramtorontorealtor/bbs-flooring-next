import { Suspense } from 'react';
import CartClient from '@/components/CartClient';

export const metadata = {
  title: 'Your Cart — BBS Flooring',
  description: 'Review your flooring selections and proceed to checkout.',
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-100 rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <CartClient />
    </Suspense>
  );
}
