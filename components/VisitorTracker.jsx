'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getVisitorId, track } from '@/lib/track';

/**
 * Mounted once in the root layout (inside a <Suspense> boundary because
 * useSearchParams requires one). Ensures a visitor id exists and fires a
 * `page_view` event on every pathname change. Skips /admin/* entirely.
 */
export function VisitorTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    getVisitorId();
  }, []);

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;
    track('page_view');
    // searchParams is included so UTM-bearing query strings on the same
    // pathname (e.g. ad landing redirects) still trigger a fresh page_view.
  }, [pathname, searchParams]);

  return null;
}

export default VisitorTracker;
