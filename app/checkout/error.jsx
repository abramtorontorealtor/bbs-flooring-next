'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Detect chunk load failures from stale deployments and auto-reload
    const msg = error?.message || '';
    if (
      msg.includes('ChunkLoadError') ||
      msg.includes('Loading chunk') ||
      msg.includes('Failed to fetch') ||
      msg.includes('Unexpected token') ||
      msg.includes('dynamically imported module')
    ) {
      // Force a full page reload to get fresh chunks
      window.location.reload();
      return;
    }
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">We hit a snag — your cart is safe</h2>
        <p className="text-slate-600 mb-6">
          Tap Try again, or call us at (647) 428-1111 and we&apos;ll finish your order by phone.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors"
          >
            Try again
          </button>
          <a
            href="tel:+16474281111"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition-colors"
          >
            Call (647) 428-1111
          </a>
          <Link
            href="/cart"
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition-colors"
          >
            Back to cart
          </Link>
        </div>
      </div>
    </div>
  );
}
