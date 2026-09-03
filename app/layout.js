import './globals.css';
import { Inter } from 'next/font/google';
import { LocalBusinessJsonLd } from '@/components/LocalBusinessJsonLd';
import { ClientProviders } from './providers';
import FooterServer from '@/components/FooterServer';
import AfterHoursConcierge from '@/components/AfterHoursConcierge';
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
  description: 'Premium flooring installation and materials in Markham, Toronto, and Durham. Hardwood, vinyl, laminate, engineered flooring and staircase renovations. 4.7★ rated on Google.',
  metadataBase: new URL('https://bbsflooring.ca'),
  icons: {
    icon: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/bbs-logo-official-v2.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    siteName: 'BBS Flooring',
    images: [
      {
        url: 'https://cdn.bbsflooring.ca/storage/v1/object/public/Base44/hero-optimized-v2.webp',
        width: 1920,
        height: 1080,
        alt: 'BBS Flooring — Premium Flooring in Markham, Toronto & Durham',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://cdn.bbsflooring.ca/storage/v1/object/public/Base44/hero-optimized-v2.webp'],
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

        {/* Google tag (gtag.js) — loaded in <head> as Google Ads requires.
            The gtag.js script loads async so it doesn't block rendering.
            Conversion tracking (gtag('event','conversion',...)) works immediately
            because gtag() stubs queue calls until the script loads. */}
        <script
          dangerouslySetInnerHTML={{ __html:
            `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');gtag('config','${AW_ID}');`
          }}
        />
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50`}>

        {/* ── Meta Pixel: interaction-triggered loading ──
             Pixel stubs defined immediately so fbq() calls queue safely.
             Actual fbevents.js loads on first user interaction (scroll/click/touch/key).
             Fallback: loads after 12s if no interaction.
             GTM/gtag is now in <head> (required by Google Ads). ── */}
        <script
          dangerouslySetInnerHTML={{ __html: [
            // Meta Pixel stub
            `window.fbq=window.fbq||function(){(window.fbq.q=window.fbq.q||[]).push(arguments)};window._fbq=window.fbq;window.fbq.loaded=!0;window.fbq.version='2.0';window.fbq.queue=[];`,
            // Interaction-triggered loader (Meta Pixel only — gtag is in head)
            `(function(){var L=false;function go(){if(L)return;L=true;`,
            `['scroll','click','touchstart','keydown','mousemove'].forEach(function(e){document.removeEventListener(e,go,true)});`,
            // Load Meta Pixel
            `var f=document.createElement('script');f.async=true;f.src='https://connect.facebook.net/en_US/fbevents.js';document.head.appendChild(f);`,
            `fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`,
            `}`,
            // Attach listeners (capture phase, passive, removed after first trigger)
            `['scroll','click','touchstart','keydown','mousemove'].forEach(function(e){document.addEventListener(e,go,{capture:true,passive:true})});`,
            // Fallback: load after 12s even without interaction
            `setTimeout(go,12000);`,
            `})();`,
          ].join('') }}
        />

        <ClientProviders>
          {children}
        </ClientProviders>

        {/* After-hours Floor Finder nudge — desktop only, renders only when the showroom is closed (Mon–Sat 10–5 ET), dismissible per session */}
        <AfterHoursConcierge />

        {/* Footer is a server component — zero client JS */}
        <FooterServer />

        {/* Vercel Analytics + Speed Insights — deferred until after hydration */}
        <DeferredAnalytics />
      </body>
    </html>
  );
}
