import './globals.css';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { LocalBusinessJsonLd } from '@/components/LocalBusinessJsonLd';
import { ClientProviders } from './providers';
import FooterServer from '@/components/FooterServer';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

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
        <LocalBusinessJsonLd />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50`}>

        {/* ── Google Analytics + Ads ── afterInteractive: loads after page is interactive, doesn't block render */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
            gtag('config', '${AW_ID}');
          `}
        </Script>

        {/* ── Meta Pixel ── lazyOnload: loads during idle time, lowest priority */}
        <Script id="meta-pixel" strategy="lazyOnload">
          {`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
            (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init','${META_PIXEL_ID}');
            fbq('track','PageView');
          `}
        </Script>

        <ClientProviders>
          {children}
        </ClientProviders>

        {/* Footer is a server component — zero client JS */}
        <FooterServer />

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
