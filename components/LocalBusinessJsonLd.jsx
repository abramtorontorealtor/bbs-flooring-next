export function LocalBusinessJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'BBS Flooring',
    description: 'Premium flooring installation and materials in Markham, Toronto, and Durham. Hardwood, vinyl, laminate, engineered flooring and staircase renovations.',
    url: 'https://bbsflooring.ca',
    telephone: '(647) 428-1111',
    email: 'info@bbsflooring.ca',
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
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '10:00',
        closes: '17:00'
      }
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.7',
      reviewCount: '41',
      bestRating: '5',
      worstRating: '1'
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
