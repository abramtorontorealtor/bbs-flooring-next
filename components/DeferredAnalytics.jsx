'use client';

import { lazy, Suspense, useEffect, useState } from 'react';

const Analytics = lazy(() => import('@vercel/analytics/next').then(m => ({ default: m.Analytics })));
const SpeedInsights = lazy(() => import('@vercel/speed-insights/next').then(m => ({ default: m.SpeedInsights })));

/**
 * Deferred Vercel Analytics + Speed Insights.
 * Loads after a 3s delay so it never impacts LCP or TBT.
 */
export function DeferredAnalytics() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 3000);
    return () => clearTimeout(id);
  }, []);

  if (!ready) return null;

  return (
    <Suspense fallback={null}>
      <Analytics />
      <SpeedInsights />
    </Suspense>
  );
}
