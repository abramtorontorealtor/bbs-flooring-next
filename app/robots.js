export const dynamic = 'force-dynamic';

export default function robots() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bbsflooring.ca';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/cart',
          '/checkout',
          '/account',
          '/verify-email',
          '/quote-booking',
          '/view-booking',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
