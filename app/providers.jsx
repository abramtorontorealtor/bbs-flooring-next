'use client';

import React, { useEffect, useState, lazy, Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { AuthProvider } from '@/lib/auth-context';
import Header from '@/components/Header';
import { usePathname } from 'next/navigation';

// Lazy-load non-critical layout components — none of these fire on initial render
const StickyMobileCTA = lazy(() => import('@/components/StickyMobileCTA'));
const WhatsAppButton = lazy(() => import('@/components/WhatsAppButton'));
const ExitIntentPopup = lazy(() => import('@/components/ExitIntentPopup'));
const CookieConsent = lazy(() => import('@/components/CookieConsent'));

// Sonner Toaster — no toasts fire on page load, safe to lazy-load
const LazyToaster = lazy(() => import('sonner').then(m => ({ default: m.Toaster })));

export function ClientProviders({ children }) {
  const queryClient = getQueryClient();
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [overlaysReady, setOverlaysReady] = useState(false);
  const isHomePage = pathname === '/';

  // Track Meta Pixel PageView on route changes (script already loaded via next/script)
  useEffect(() => {
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
  }, [pathname]);

  // Defer overlays + toaster — load 2s after hydration
  useEffect(() => {
    const id = setTimeout(() => setOverlaysReady(true), 2000);
    return () => clearTimeout(id);
  }, []);

  // Load cart count — deferred, uses fetch instead of importing heavy base44-compat
  useEffect(() => {
    const loadCartCount = async () => {
      const sessionId = localStorage.getItem('bbs_session_id');
      if (!sessionId) return;
      try {
        const res = await fetch(`/api/cart?session_id=${encodeURIComponent(sessionId)}`);
        if (res.ok) {
          const { count = 0 } = await res.json();
          setCartCount(count);
        }
      } catch {
        // Cart API may not exist yet
      }
    };

    // Defer cart count load — not needed for LCP
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadCartCount);
    } else {
      setTimeout(loadCartCount, 1000);
    }

    const handleCartUpdate = () => loadCartCount();
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  // Global tel: click → GA4 + Ads conversion tracking
  useEffect(() => {
    const handleTelClick = (e) => {
      const link = e.target.closest('a[href^="tel:"]');
      if (!link) return;
      const phoneNumber = link.getAttribute('href').replace('tel:', '');
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'click', { event_category: 'Contact', event_label: phoneNumber, event_action: 'phone_call', transport_type: 'beacon' });
        window.gtag('event', 'phone_call', { phone_number: phoneNumber, value: 25.00, currency: 'CAD' });
        window.gtag('event', 'conversion', { send_to: 'AW-700910775/ZUi8CIO8-NEaELeZnM4C', value: 25.00, currency: 'CAD' });
      }
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Contact', { content_name: 'phone_call', value: 25.00, currency: 'CAD' });
      }
    };
    document.addEventListener('click', handleTelClick);
    return () => document.removeEventListener('click', handleTelClick);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Header cartCount={cartCount} />
        <main className={`flex-1 ${isHomePage ? '' : 'pt-32'}`}>
          {children}
        </main>
        {overlaysReady && (
          <Suspense fallback={null}>
            <StickyMobileCTA />
            <WhatsAppButton />
            <ExitIntentPopup />
            <CookieConsent />
            <LazyToaster richColors position="top-right" duration={4000} />
          </Suspense>
        )}
      </AuthProvider>
    </QueryClientProvider>
  );
}
