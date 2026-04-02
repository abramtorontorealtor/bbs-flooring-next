'use client';

import React, { useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { AuthProvider } from '@/lib/auth-context';
import { initGA4 } from '@/components/analytics';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StickyMobileCTA from '@/components/StickyMobileCTA';
import WhatsAppButton from '@/components/WhatsAppButton';
import ExitIntentPopup from '@/components/ExitIntentPopup';
import { Toaster } from 'sonner';
import { usePathname } from 'next/navigation';
import { entities } from '@/lib/base44-compat';

const GA_MEASUREMENT_ID = 'G-YN10E7FBP5';
const META_PIXEL_ID = '653350609943913';

export function ClientProviders({ children }) {
  const queryClient = getQueryClient();
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const isHomePage = pathname === '/';

  // Initialize GA4 + Meta Pixel (deferred for performance)
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        initGA4(GA_MEASUREMENT_ID);
        initMetaPixel();
      });
    } else {
      setTimeout(() => {
        initGA4(GA_MEASUREMENT_ID);
        initMetaPixel();
      }, 2000);
    }
  }, []);

  // Track Meta Pixel PageView on route changes
  useEffect(() => {
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
  }, [pathname]);

  // Scroll to top on navigation
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  }, [pathname]);

  // Load cart count
  useEffect(() => {
    const loadCartCount = async () => {
      const sessionId = localStorage.getItem('bbs_session_id');
      if (sessionId) {
        try {
          const items = await entities.CartItem.filter({ session_id: sessionId });
          setCartCount(items.length);
        } catch {
          // Cart items table may not exist yet
        }
      }
    };
    loadCartCount();

    const handleCartUpdate = () => loadCartCount();
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  // Global tel: click listener for GA4 + Ads conversion tracking
  useEffect(() => {
    const handleTelClick = (e) => {
      const link = e.target.closest('a[href^="tel:"]');
      if (link) {
        const phoneNumber = link.getAttribute('href').replace('tel:', '');
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'click', {
            event_category: 'Contact',
            event_label: phoneNumber,
            event_action: 'phone_call',
            transport_type: 'beacon'
          });
          window.gtag('event', 'phone_call', {
            phone_number: phoneNumber,
            value: 25.00,
            currency: 'CAD'
          });
          window.gtag('event', 'conversion', {
            send_to: 'AW-700910775/ZUi8CIO8-NEaELeZnM4C',
            value: 25.00,
            currency: 'CAD'
          });
        }
        if (typeof window.fbq === 'function') {
          window.fbq('track', 'Contact', { content_name: 'phone_call', value: 25.00, currency: 'CAD' });
        }
      }
    };

    document.addEventListener('click', handleTelClick);
    return () => document.removeEventListener('click', handleTelClick);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Header cartCount={cartCount} />
          <main className={`flex-1 ${isHomePage ? '' : 'pt-28'}`}>
            {children}
          </main>
          <Footer />
          <StickyMobileCTA />
          <WhatsAppButton />
          <ExitIntentPopup />
          <Toaster richColors position="top-right" duration={4000} />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function initMetaPixel() {
  if (typeof window === 'undefined' || window.fbq) return;
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
  (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
}
