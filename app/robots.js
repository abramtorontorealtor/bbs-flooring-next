export const dynamic = 'force-dynamic';

export default function robots() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bbsflooring.ca';

  const privatePages = [
    '/admin/',
    '/api/',
    '/cart',
    '/checkout',
    '/account',
    '/verify-email',
    '/quote-booking',
    '/view-booking',
  ];

  return {
    rules: [
      // Default: allow everything except private pages
      {
        userAgent: '*',
        allow: '/',
        disallow: privatePages,
      },
      // Explicitly welcome AI crawlers
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: privatePages,
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: privatePages,
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: privatePages,
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: privatePages,
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: privatePages,
      },
      {
        userAgent: 'cohere-ai',
        allow: '/',
        disallow: privatePages,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
