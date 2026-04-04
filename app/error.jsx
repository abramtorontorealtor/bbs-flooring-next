'use client';

import { useEffect } from 'react';

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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Something went wrong</h2>
        <p className="text-slate-600 mb-6">
          We hit an unexpected error. Please try again.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
