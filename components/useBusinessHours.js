'use client';

import { useEffect, useState } from 'react';
import { isShowroomOpen, nextOpenLabel } from '@/lib/business-hours';

/**
 * Hydration-safe open/closed state for time-aware CTAs.
 *
 * Returns `{ open: null }` until mounted (server + first client paint agree, so
 * ISR/SSR HTML never mismatches), then the live Toronto-clock answer, refreshed
 * every minute. Callers MUST render the default (open-hours) UI while `open === null`.
 */
export default function useBusinessHours() {
  const [state, setState] = useState({ open: null, nextOpen: '' });

  useEffect(() => {
    const tick = () => setState({ open: isShowroomOpen(), nextOpen: nextOpenLabel() });
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  return state;
}
