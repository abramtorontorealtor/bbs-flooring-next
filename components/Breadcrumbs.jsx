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
      // Google requires "item" on every ListItem including the last one
      const url = item.url
        ? `https://bbsflooring.ca${item.url}`
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

export default function Breadcrumbs({ items }) {
  const pathname = usePathname();
  const handleBreadcrumbClick = () => { window.scrollTo(0, 0); };
  return (
    <>
      <BreadcrumbJsonLd items={items} currentPath={pathname} />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center flex-wrap gap-2 text-sm">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={index} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="w-4 h-4 text-slate-400" />}
                {isLast ? (
                  <span className="text-slate-900 font-medium">{item.label}</span>
                ) : (
                  <Link href={item.url} onClick={handleBreadcrumbClick} className="text-slate-600 hover:text-amber-600 transition-colors">
                    {index === 0 && <Home className="w-4 h-4 inline mr-1" />}
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
