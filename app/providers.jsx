'use client';

import React, { useEffect, useState, lazy, Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { AuthProvider } from '@/lib/auth-context';
import Header from '@/components/Header';
import { Toaster } from 'sonner';
import { usePathname } from 'next/navigation';
import { entities } from '@/lib/base44-compat';

// Lazy-load non-critical layout components
const StickyMobileCTA   = lazy(() => import('@/components/StickyMobileCTA'));
const WhatsAppButton    = lazy(() => import('@/components/WhatsAppButton'));
const ExitIntentPopup   = lazy(() => import('@/components/ExitIntentPopup'));
const CookieConsent     = lazy(() => import('@/components/CookieConsent'));

export function ClientProviders({ children }) {
  const queryClient = getQueryClient();
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const isHomePage = pathname === '/';

  // Track Meta Pixel PageView on route changes (script already loaded via next/script)
  useEffect(() => {
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
  }, [pathname]);

  // Load cart count from Supabase
  useEffect(() => {
    const loadCartCount = async () => {
      const sessionId = localStorage.getItem('bbs_session_id');
      if (!sessionId) return;
      try {
        const items = await entities.CartItem.filter({ session_id: sessionId });
        setCartCount(items.length);
      } catch {
        // Cart items table may not exist yet
      }
    };
    loadCartCount();

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
        <main className={`flex-1 ${isHomePage ? '' : 'pt-28'}`}>
          {children}
        </main>
        <Suspense fallback={null}>
          <StickyMobileCTA />
          <WhatsAppButton />
          <ExitIntentPopup />
          <CookieConsent />
        </Suspense>
        <Toaster richColors position="top-right" duration={4000} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
