'use client';

import React, { useEffect } from 'react';
import { locationData } from '@/data/locationData';

/**
 * LocationProductGrid — lightweight client island for city pages.
 * The actual product cards and all SEO content are server-rendered in page.jsx.
 * This component only handles GA4 tracking on the client side.
 */
export default function LocationProductGrid({ citySlug, initialProducts }) {
  const data = locationData[citySlug] || locationData['markham'];

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item_list', { item_list_name: data.city });
    }
  }, [data.city]);

  return null; // No additional UI — everything is server-rendered
}
