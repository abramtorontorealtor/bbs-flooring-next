export function LocalBusinessJsonLd() {
  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://bbsflooring.ca/#business',
    name: 'BBS Flooring',
    description: 'Premium flooring installation and materials in Markham, Toronto, and Durham. Hardwood, vinyl, laminate, engineered flooring and staircase renovations.',
    url: 'https://bbsflooring.ca',
    telephone: '(647) 428-1111',
    email: 'info@bbsflooring.ca',
    image: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/bbs-logo-official-v2.png',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '6061 Highway 7, Unit B',
      addressLocality: 'Markham',
      addressRegion: 'ON',
      postalCode: 'L3P 3B2',
      addressCountry: 'CA'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '43.8591',
      longitude: '-79.3363'
    },
    areaServed: [
      { '@type': 'City', name: 'Markham' },
      { '@type': 'City', name: 'Stouffville' },
      { '@type': 'City', name: 'Richmond Hill' },
      { '@type': 'City', name: 'Pickering' },
      { '@type': 'City', name: 'Ajax' },
      { '@type': 'City', name: 'Whitby' },
      { '@type': 'City', name: 'Vaughan' },
      { '@type': 'City', name: 'Woodbridge' },
      { '@type': 'City', name: 'Newmarket' },
      { '@type': 'City', name: 'Aurora' }
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '10:00',
        closes: '17:00'
      }
    ],
    // aggregateRating removed — Google sees this on every page (including product pages)
    // which triggers "Review has multiple aggregate ratings" error.
    // Google pulls the 4.7★ rating directly from Google Maps reviews anyway.
  };

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://bbsflooring.ca/#organization',
    name: 'BBS Flooring',
    url: 'https://bbsflooring.ca',
    logo: 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/bbs-logo-official-v2.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-647-428-1111',
      contactType: 'sales',
      areaServed: 'CA',
      availableLanguage: 'English'
    },
    sameAs: [
      'https://www.facebook.com/bbsflooring',
      'https://www.instagram.com/bbsflooring'
    ]
  };

  const webSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://bbsflooring.ca/#website',
    name: 'BBS Flooring',
    url: 'https://bbsflooring.ca',
    publisher: { '@id': 'https://bbsflooring.ca/#organization' },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://bbsflooring.ca/products?search={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSite) }}
      />
    </>
  );
}
