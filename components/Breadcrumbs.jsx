'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

function BreadcrumbJsonLd({ items }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.url ? { item: `https://bbsflooring.ca${item.url}` } : {}),
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function Breadcrumbs({ items }) {
  const handleBreadcrumbClick = () => { window.scrollTo(0, 0); };
  return (
    <>
      <BreadcrumbJsonLd items={items} />
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
