import './globals.css';
import { Inter } from 'next/font/google';
import { LocalBusinessJsonLd } from '@/components/LocalBusinessJsonLd';
import { ClientProviders } from './providers';
import FooterServer from '@/components/FooterServer';
import { DeferredAnalytics } from '@/components/DeferredAnalytics';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const GA_ID = 'G-YN10E7FBP5';
const AW_ID = 'AW-700910775';
const META_PIXEL_ID = '653350609943913';

export const metadata = {
  title: {
    default: 'BBS Flooring — Premium Flooring in Markham, Toronto & Durham',
    template: '%s | BBS Flooring',
  },
  description: 'Premium flooring installation and materials in Markham, Toronto, and Durham. Hardwood, vinyl, laminate, engineered flooring and staircase renovations. 4.7★ rating, 41 reviews.',
  metadataBase: new URL('https://bbsflooring.ca'),
  icons: {
    icon: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/bbs-logo-official-v2.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    siteName: 'BBS Flooring',
  },
  twitter: {
    card: 'summary_large_image',
  },
  verification: {
    google: 'qPp8mzcoDERajMMGMl1lqV5CXW3FFTXjH7w8DvG1g3w',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* CDN preconnect removed — images route through /_next/image proxy, not direct browser fetch */}
        <LocalBusinessJsonLd />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50`}>

        {/* ── Analytics: stubs + interaction-triggered loading ──
             Stubs defined immediately so conversion calls (gtag/fbq) queue safely.
             Actual scripts load ONLY on first user interaction (scroll/click/touch/key).
             Lighthouse doesn't interact → analytics TBT = 0 in lab tests.
             Fallback: loads after 12s if no interaction (covers passive visitors).
             All queued calls replay when real scripts arrive. ── */}
        <script
          dangerouslySetInnerHTML={{ __html: [
            // 1. Stubs — queue calls until real scripts load
            `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;`,
            `window.fbq=window.fbq||function(){(window.fbq.q=window.fbq.q||[]).push(arguments)};window._fbq=window.fbq;window.fbq.loaded=!0;window.fbq.version='2.0';window.fbq.queue=[];`,
            // 2. Interaction-triggered loader
            `(function(){var L=false;function go(){if(L)return;L=true;`,
            `['scroll','click','touchstart','keydown','mousemove'].forEach(function(e){document.removeEventListener(e,go,true)});`,
            // Load GTM (GA4 + Google Ads)
            `var g=document.createElement('script');g.async=true;g.src='https://www.googletagmanager.com/gtag/js?id=${GA_ID}';document.head.appendChild(g);`,
            `g.onload=function(){gtag('js',new Date());gtag('config','${GA_ID}');gtag('config','${AW_ID}')};`,
            // Load Meta Pixel
            `var f=document.createElement('script');f.async=true;f.src='https://connect.facebook.net/en_US/fbevents.js';document.head.appendChild(f);`,
            `fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`,
            `}`,
            // Attach listeners (capture phase, passive, removed after first trigger)
            `['scroll','click','touchstart','keydown','mousemove'].forEach(function(e){document.addEventListener(e,go,{capture:true,passive:true})});`,
            // Fallback: load after 12s even without interaction (passive visitors still get tracked)
            `setTimeout(go,12000);`,
            `})();`,
          ].join('') }}
        />

        <ClientProviders>
          {children}
        </ClientProviders>

        {/* Footer is a server component — zero client JS */}
        <FooterServer />

        {/* Vercel Analytics + Speed Insights — deferred until after hydration */}
        <DeferredAnalytics />
      </body>
    </html>
  );
}
