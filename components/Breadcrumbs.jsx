'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

function BreadcrumbJsonLd({ items, currentPath }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const isLast = index === items.length - 1;
      // Accept either `url` or `href` as the crumb path (defensive: both are used across callers)
      const crumbPath = item.url || item.href;
      // Google requires "item" on every ListItem including the last one
      const url = crumbPath
        ? `https://bbsflooring.ca${crumbPath}`
        : isLast && currentPath
          ? `https://bbsflooring.ca${currentPath}`
          : undefined;
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        ...(url ? { item: url } : {}),
      };
    }),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function Breadcrumbs({ items, variant = 'light' }) {
  const pathname = usePathname();
  const handleBreadcrumbClick = () => { window.scrollTo(0, 0); };
  const isDark = variant === 'dark';

  // Defensive: never crash a page (or the whole build via prerender) on a missing/malformed
  // breadcrumb trail. A crumb that isn't the last item but has no url/href renders as plain
  // text instead of a <Link href={undefined}> (which throws during static generation).
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  if (safeItems.length === 0) return null;

  return (
    <>
      <BreadcrumbJsonLd items={safeItems} currentPath={pathname} />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center flex-wrap gap-2 text-sm">
          {safeItems.map((item, index) => {
            const isLast = index === safeItems.length - 1;
            const crumbPath = item.url || item.href;
            const renderAsLink = !isLast && Boolean(crumbPath);
            return (
              <li key={index} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-500'}`} />}
                {renderAsLink ? (
                  <Link href={crumbPath} onClick={handleBreadcrumbClick} className={`transition-colors ${isDark ? 'text-slate-400 hover:text-amber-400' : 'text-slate-700 hover:text-amber-600'}`}>
                    {index === 0 && <Home className="w-4 h-4 inline mr-1" />}
                    {item.label}
                  </Link>
                ) : (
                  <span className={`${isLast ? 'font-medium' : ''} ${isDark ? (isLast ? 'text-white' : 'text-slate-400') : (isLast ? 'text-slate-900' : 'text-slate-700')}`}>
                    {index === 0 && <Home className="w-4 h-4 inline mr-1" />}
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
