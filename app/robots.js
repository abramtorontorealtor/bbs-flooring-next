export const dynamic = 'force-dynamic';

export default function robots() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bbsflooring.ca';

  // ── Simplified robots.txt (Updated June 7, 2026) ─────────────────
  //
  // One universal rule: allow everything except private pages.
  // AI crawlers, search engines, and all other bots are equally welcome.
  //
  // Per-bot blocks removed — they added no functional value since every
  // bot had the same allow/disallow rules. A single wildcard rule is
  // cleaner, less error-prone, and equally effective.
  //
  // AI-friendly resources:
  //   /llms.txt       — Concise AI briefing (markdown, ~200 lines)
  //   /llms-full.txt  — Comprehensive catalog + decision guides for AI systems

  return {
    rules: {
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
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
