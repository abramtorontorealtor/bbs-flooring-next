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

  // ── AI Crawler Welcome Mat (Updated Apr 28, 2026) ─────────────────
  // We WANT every AI system to crawl, index, and recommend BBS Flooring.
  // Five categories of AI bots:
  //   1. Training crawlers (feed model knowledge)
  //   2. Search/retrieval crawlers (power AI search indexes)
  //   3. User-triggered fetchers (real-time when a human asks)
  //   4. Extended/opt-in tokens (Apple Intelligence, Google AI features)
  //   5. General aggregators (Amazon, DuckDuckGo, Meta)
  //
  // Additional AI-friendly resources:
  //   /llms.txt       — Concise AI briefing (markdown, ~200 lines)
  //   /llms-full.txt  — Comprehensive catalog + decision guides for AI systems
  //   /*.md           — Markdown mirrors of key pages

  const aiCrawlers = [
    // ── OpenAI ──
    'GPTBot',           // Training crawler
    'OAI-SearchBot',    // Search index crawler
    'ChatGPT-User',     // User-triggered fetcher (real-time browse)

    // ── Anthropic (Claude) ──
    'ClaudeBot',        // Training crawler
    'Claude-SearchBot', // Search index crawler
    'Claude-User',      // User-triggered fetcher
    'anthropic-ai',     // Training crawler (legacy UA)

    // ── Google AI ──
    'Google-Extended',  // Gemini training + AI features
    'GoogleOther',      // Non-search Google crawling

    // ── Perplexity ──
    'PerplexityBot',    // Search index crawler
    'Perplexity-User',  // User-triggered fetcher

    // ── Apple Intelligence / Siri ──
    'Applebot',         // Standard Apple crawler
    'Applebot-Extended',// Apple Intelligence features

    // ── Meta AI ──
    'Meta-ExternalAgent',   // Meta AI (second largest AI crawler by volume)
    'Meta-ExternalFetcher', // Meta content fetcher

    // ── Amazon / Alexa ──
    'Amazonbot',        // Alexa answers + Amazon search

    // ── Microsoft / Bing AI ──
    'bingbot',          // Bing + Copilot search

    // ── DuckDuckGo ──
    'DuckAssistBot',    // DuckDuckGo AI answers

    // ── Cohere ──
    'cohere-ai',        // Cohere models

    // ── ByteDance / TikTok ──
    'Bytespider',       // TikTok AI features

    // ── Other AI systems ──
    'CCBot',            // Common Crawl (feeds many AI models)
    'Diffbot',          // Knowledge graph extraction
    'YouBot',           // You.com AI search
  ];

  const rules = [
    // Default: allow everything except private pages
    {
      userAgent: '*',
      allow: '/',
      disallow: privatePages,
    },
    // Explicitly welcome every known AI crawler
    ...aiCrawlers.map(bot => ({
      userAgent: bot,
      allow: '/',
      disallow: privatePages,
    })),
  ];

  return {
    rules,
    sitemap: `${siteUrl}/sitemap.xml`,
    // Note: /llms.txt and /llms-full.txt are served as static files from /public
  };
}
