/**
 * Shared JSON-LD schema generators for BBS Flooring.
 * Used by server-component page wrappers to inject structured data at build time.
 */

const BBS_BUSINESS = {
  '@type': 'LocalBusiness',
  name: 'BBS Flooring',
  telephone: '(647) 428-1111',
  url: 'https://bbsflooring.ca',
  image: 'https://bbsflooring.ca/logo.png',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '6061 Highway 7, Unit B',
    addressLocality: 'Markham',
    addressRegion: 'ON',
    postalCode: 'L3P 3B2',
    addressCountry: 'CA',
  },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '18:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '10:00', closes: '17:00' },
  ],
  priceRange: '$$',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.7',
    reviewCount: '41',
    bestRating: '5',
  },
};

const GTA_AREAS = [
  { '@type': 'City', name: 'Markham' },
  { '@type': 'City', name: 'Toronto' },
  { '@type': 'City', name: 'Durham' },
  { '@type': 'City', name: 'Richmond Hill' },
  { '@type': 'City', name: 'Vaughan' },
  { '@type': 'City', name: 'Stouffville' },
  { '@type': 'City', name: 'Scarborough' },
  { '@type': 'City', name: 'Pickering' },
  { '@type': 'City', name: 'Ajax' },
  { '@type': 'City', name: 'Whitby' },
];

function unitOffer(name, price, unit, description) {
  const offer = {
    '@type': 'Offer',
    name,
    price: String(price),
    priceCurrency: 'CAD',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: String(price),
      priceCurrency: 'CAD',
      unitText: unit,
    },
  };
  if (description) offer.description = description;
  return offer;
}

function catalogOffer(name, price, unit) {
  return {
    '@type': 'Offer',
    itemOffered: { '@type': 'Service', name },
    price: String(price),
    priceCurrency: 'CAD',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: String(price),
      priceCurrency: 'CAD',
      unitText: unit,
    },
  };
}

// ── Installation Service Schema (13 offers + HowTo) ─────────────────────────

export function installationSchemas() {
  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Professional Flooring Installation Services',
    provider: { ...BBS_BUSINESS },
    serviceType: 'Flooring Installation',
    areaServed: GTA_AREAS.slice(0, 5),
    offers: [
      unitOffer('Solid/Engineered Hardwood Installation (Nail Down)', '2.25', 'per square foot'),
      unitOffer('Engineered Hardwood Installation (Glue-Down)', '3.25', 'per square foot'),
      unitOffer('Herringbone Installation (Glue-Down)', '4.25', 'per square foot'),
      unitOffer('Laminate/Vinyl Flooring Installation', '2.00', 'per square foot'),
      unitOffer('Tile Installation', '10.00', 'per square foot'),
      unitOffer('Hardwood Removal', '1.50', 'per square foot'),
      unitOffer('Vinyl/Laminate Removal', '1.25', 'per square foot'),
      unitOffer('Carpet Removal', '1.00', 'per square foot'),
      unitOffer('Tile Removal', '3.00', 'per square foot'),
      unitOffer('Standard Baseboard Installation', '3.61', 'per linear foot'),
      unitOffer('Shoe Moulding Installation', '1.91', 'per linear foot'),
      unitOffer('Garage Delivery', '140.00', 'flat rate', 'Flat rate $140'),
      unitOffer('Inside Delivery', '200.00', 'flat rate', 'Required for installation jobs'),
    ],
  };

  const howTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Get Professional Flooring Installed by BBS Flooring',
    description: 'Our 6-step flooring installation process from free consultation to final walkthrough, serving Markham, Toronto, and Durham.',
    totalTime: 'P3D',
    estimatedCost: { '@type': 'MonetaryAmount', currency: 'CAD', value: '2.00' },
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Free Consultation', text: 'We discuss your needs, assess your space, and recommend the best flooring options for your home or business.' },
      { '@type': 'HowToStep', position: 2, name: 'Detailed Estimate', text: 'Get a clear, upfront quote with transparent pricing — no surprises or hidden fees.' },
      { '@type': 'HowToStep', position: 3, name: 'Preparation', text: 'We move furniture as needed, remove old flooring, and prepare the subfloor for a perfect installation.' },
      { '@type': 'HowToStep', position: 4, name: 'Expert Installation', text: 'Our experienced team installs your new flooring with precision and care, ensuring perfect results.' },
      { '@type': 'HowToStep', position: 5, name: 'Clean-Up', text: 'We leave your space spotless and ready to enjoy — all debris and materials are removed.' },
      { '@type': 'HowToStep', position: 6, name: 'Final Walkthrough', text: 'We review the finished work with you to ensure complete satisfaction before we leave.' },
    ],
  };

  return [service, howTo];
}

// ── Stairs Service Schema (7 offers via OfferCatalog) ────────────────────────

export function stairsSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Staircase Renovation and Installation Services',
    description: 'Professional staircase refinishing, hardwood stair tread installation, vinyl stair caps, railing installation, and complete staircase renovations in Markham, Toronto, and Durham Region.',
    provider: { ...BBS_BUSINESS },
    serviceType: 'Staircase Renovation and Installation',
    areaServed: GTA_AREAS.slice(0, 6),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Staircase Services',
      itemListElement: [
        catalogOffer('Stair Tread Refinishing (Sand & Restain)', '125.00', 'per step'),
        catalogOffer('New Straight Stair Treads', '185.00', 'per step'),
        catalogOffer('New Pie / Triangle / Bullnose Steps', '225.00', 'per step'),
        catalogOffer('Sand & Restain Rails', '25.00', 'per foot'),
        catalogOffer('New Iron or Wood Pickets (Installed with Material)', '25.00', 'per piece'),
        catalogOffer('Stair Nosing Refinish (Sand & Restain)', '25.00', 'per foot'),
        catalogOffer('New Stair Nosing', '30.00', 'per foot'),
      ],
    },
  };
}

// ── Free Measurement Service Schema ──────────────────────────────────────────

export function freeMeasurementSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Free In-Home Flooring Measurement',
    description: 'Book a free, no-obligation in-home flooring measurement. Our experts measure your space and provide a detailed quote for hardwood, vinyl, laminate, and tile installation.',
    provider: { ...BBS_BUSINESS },
    serviceType: 'Free Flooring Measurement',
    areaServed: GTA_AREAS.filter(a => ['Markham', 'Toronto', 'Durham', 'Ajax', 'Pickering', 'Whitby', 'Richmond Hill', 'Vaughan'].includes(a.name)),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CAD',
      description: 'Free in-home measurement and no-obligation quote',
    },
    isRelatedTo: {
      '@type': 'Service',
      name: 'Professional Flooring Installation',
      url: 'https://bbsflooring.ca/installation',
    },
  };
}

// ── Carpet Removal Service + FAQ Schema ──────────────────────────────────────

export function carpetRemovalSchemas() {
  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Carpet Removal Service',
    description: 'Professional carpet rip-out, haul-away, and subfloor preparation in Markham, Toronto, and Durham Region.',
    provider: { ...BBS_BUSINESS },
    serviceType: 'Carpet Removal',
    areaServed: GTA_AREAS.filter(a => ['Markham', 'Toronto', 'Durham', 'Ajax', 'Pickering', 'Whitby', 'Stouffville', 'Richmond Hill'].includes(a.name)),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'CAD',
      price: '1.00',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '1.00',
        priceCurrency: 'CAD',
        unitText: 'square foot',
        referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'FTK' },
      },
      description: '$1.00 per square foot for carpet removal. $75 flat fee for haul-away and disposal. Stairs require custom quote.',
    },
  };

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'How much does carpet removal cost in Markham and Toronto?', acceptedAnswer: { '@type': 'Answer', text: 'We charge a flat transparent rate of $1.00 per square foot for carpet removal, plus a $75 haul-away and disposal fee.' } },
      { '@type': 'Question', name: 'Do you remove carpet from stairs?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, we remove carpet and tack strips from all types of stairs. Because staircases vary, this requires a custom quote.' } },
      { '@type': 'Question', name: 'Do you prepare the subfloor after removing the carpet?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, our clean slate service ensures all staples, tack strips, and debris are removed so your subfloor is ready for new hardwood, vinyl, or laminate flooring.' } },
    ],
  };

  return [service, faq];
}

// ── FAQ Schema generator (for AdLandingTemplate pages) ───────────────────────

export function faqSchema(faqItems) {
  if (!faqItems || faqItems.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

// ── LocalBusiness schema (for service/showroom landing pages) ─────────────────

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    ...BBS_BUSINESS,
    areaServed: GTA_AREAS.map(a => a.name),
  };
}

// ── LocalBusiness schema for city pages ──────────────────────────────────────

export function cityLocalBusinessSchema(cityName, description) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `BBS Flooring - ${cityName}`,
    description: description || `Professional flooring supply and installation in ${cityName}. Visit our Markham showroom or book a free in-home measurement.`,
    telephone: '(647) 428-1111',
    url: 'https://bbsflooring.ca',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '6061 Highway 7, Unit B',
      addressLocality: 'Markham',
      addressRegion: 'ON',
      postalCode: 'L3P 3B2',
      addressCountry: 'CA',
    },
    areaServed: { '@type': 'City', name: cityName },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.7',
      reviewCount: '41',
      bestRating: '5',
    },
  };
}

// ── Helper: render JSON-LD scripts ───────────────────────────────────────────

export function JsonLd({ data }) {
  if (!data) return null;
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
