import './globals.css';
import { Inter } from 'next/font/google';
import { LocalBusinessJsonLd } from '@/components/LocalBusinessJsonLd';
import { ClientProviders } from './providers';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

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
        <link rel="preconnect" href="https://cdn.bbsflooring.ca" crossOrigin="anonymous" />
        <LocalBusinessJsonLd />
      </head>
      <body className={inter.className}>
        <ClientProviders>
          {children}
        </ClientProviders>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
