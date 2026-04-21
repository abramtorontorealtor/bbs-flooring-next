// SEO data and helpers for BBS Flooring Next.js port
// Domain: https://bbsflooring.ca (new domain — no more shop. subdomain)

export const SEO_DATA = {
  home: {
    title: 'BBS Flooring | Markham, Toronto & Durham | Free Quote',
    description: 'Premium flooring in Markham, Toronto & Durham. Hardwood, vinyl, laminate. 600+ products, expert installation. Free measurements. Call (647) 428-1111!'
  },
  solidHardwood: {
    title: 'Solid Hardwood Flooring Markham, Toronto & Durham | BBS Flooring',
    description: 'Premium solid hardwood flooring in Markham. Oak, maple, walnut. Expert installation, free measurements. Visit our Highway 7 showroom today!'
  },
  engineeredHardwood: {
    title: 'Engineered Hardwood Markham, Toronto & Durham | BBS Flooring',
    description: 'Engineered hardwood flooring in Markham. Vidar, Triforest brands. Waterproof options, expert installation. Free measurements. Call (647) 428-1111!'
  },
  vinyl: {
    title: 'Vinyl Flooring Markham, Toronto & Durham | Waterproof LVP | BBS',
    description: 'Waterproof vinyl flooring in Markham. LVP, SPC, 6mm-11mm. Perfect for basements & kitchens. Free measurements. Visit our showroom on Highway 7!'
  },
  laminate: {
    title: 'Laminate Flooring Markham, Toronto & Durham | From $2.39/sqft | BBS',
    description: 'Affordable laminate flooring in Markham. Waterproof options from $2.39/sqft. 100+ styles, expert installation. Free measurements. Call today!'
  },
  stairs: {
    title: 'Staircase Renovation Markham, Toronto & Durham | BBS Flooring',
    description: 'Custom staircase renovations in Markham. Hardwood treads, vinyl caps, glass railings. Transform your stairs. Free quotes. Call (647) 428-1111!'
  },
  installation: {
    title: 'Flooring & Carpet Installation Markham, Toronto | From $1/sqft Removal | BBS',
    description: 'Hardwood, vinyl, laminate installation + carpet removal from $1/sqft in Markham, Toronto & Durham. Same-week booking, free in-home measurement. (647) 428-1111'
  },
  freeMeasurement: {
    title: 'Free Flooring Measurement | Markham, Toronto & Durham',
    description: 'Book your free in-home flooring measurement in Markham, Toronto & Durham. No obligation, honest quotes. Call (647) 428-1111 or book online!'
  },
  about: {
    title: 'About BBS Flooring | Family-Owned Since 2012 | Markham',
    description: 'Family-owned flooring contractor in Markham since 2012. 600+ products, expert installers, honest pricing. Serving GTA & Durham. Visit our showroom!'
  },
  contact: {
    title: 'Contact BBS Flooring | Markham Showroom | (647) 428-1111',
    description: 'Contact BBS Flooring in Markham. Call (647) 428-1111 or visit 6061 Highway 7. Mon-Fri 9-6, Sat 10-5. Free measurements in Markham, Toronto & Durham!'
  },
  gallery: {
    title: 'Flooring Gallery | Hardwood, Vinyl & Laminate | Markham',
    description: 'View our flooring installation gallery. Hardwood, vinyl, laminate projects in Markham, Toronto & Durham. Get inspired for your home renovation!'
  },
  location: {
    title: 'BBS Flooring Showroom | 6061 Highway 7, Markham',
    description: 'Visit our Markham showroom at 6061 Highway 7. See 600+ flooring products, get expert advice. Mon-Fri 9-6, Sat 10-5. Call (647) 428-1111!'
  },
  products: {
    title: 'Shop Flooring Products | Hardwood, Vinyl, Laminate | Markham',
    description: 'Shop 600+ flooring products online. Hardwood, vinyl, laminate, stairs. Vidar, Triforest brands. Free measurements in Markham, Toronto & Durham!'
  },
  quoteCalculator: {
    title: 'Flooring Quote Calculator | Instant Estimate | BBS Flooring',
    description: 'Calculate your flooring project cost instantly. Hardwood, vinyl, laminate pricing. Free tool from BBS Flooring. Get accurate estimate in seconds!'
  },
  blog: {
    title: 'Flooring Blog - Expert Tips & Trends | BBS Flooring',
    description: 'Expert flooring advice, installation guides, design trends, and maintenance tips from BBS Flooring.'
  },
  clearance: {
    title: 'Flooring Clearance Sale Markham | Up to 60% Off Hardwood & Vinyl | BBS',
    description: 'Discount hardwood, engineered wood & vinyl flooring on sale in Markham. Clearance from $1.49/sqft — limited stock. Free measurement + installation. (647) 428-1111'
  }
};

/**
 * Generate product meta title and description.
 * Returns { title, description, image }
 * When childVariants are provided, generates dynamic description from real variant data.
 */
export function generateProductMetaTags(product, category, childVariants = [], { hidePrice = false } = {}) {
  const categoryLabelMap = {
    solid_hardwood: 'Solid Hardwood',
    engineered_hardwood: 'Engineered Hardwood',
    laminate: 'Laminate',
    vinyl: 'Vinyl'
  };
  const categoryLabel = categoryLabelMap[category] || 'Flooring';

  let constructedTitle = '';
  if (product.brand) constructedTitle += product.brand + ' ';
  if (product.colour && !product.name.toLowerCase().includes(product.colour.toLowerCase())) {
    constructedTitle += product.colour + ' ';
  } else if (product.name) {
    constructedTitle += product.name + ' ';
  }
  if (product.species && (category === 'solid_hardwood' || category === 'engineered_hardwood') && !constructedTitle.toLowerCase().includes(product.species.toLowerCase())) {
    constructedTitle += product.species + ' ';
  }
  if (categoryLabel !== 'Flooring' && !constructedTitle.toLowerCase().includes(categoryLabel.toLowerCase())) {
    constructedTitle += categoryLabel + ' ';
  }
  constructedTitle = constructedTitle.replace(/\s+/g, ' ').trim();

  // Root layout template appends "| BBS Flooring" — don't duplicate it here
  const rawTitle = product.seo_title || `${constructedTitle} | Markham`;
  const title = rawTitle.replace(/\s*\|\s*BBS\s*Flooring\s*$/i, '').trim();

  let constructedDescription = '';
  if (childVariants.length > 0) {
    // Dynamic description from real variant data
    const prices = childVariants.map(v => v.sale_price_per_sqft || v.price_per_sqft).filter(p => p > 0);
    const grades = [...new Set(childVariants.map(v => v.grade).filter(Boolean))];
    const widths = [...new Set(childVariants.map(v => {
      const m = v.dimensions?.match(/^([\d½¼¾⅛⅜⅝⅞./]+(?:[\s-]*[\d½¼¾⅛⅜⅝⅞./]*)?)["″]/);
      return m ? m[1].trim() + '"' : null;
    }).filter(Boolean))];

    constructedDescription = product.brand ? product.brand + ' ' : '';
    constructedDescription += product.name + ' ' + categoryLabel + '. ';
    if (childVariants.length > 1) constructedDescription += `${childVariants.length} options`;
    if (widths.length > 1) constructedDescription += `: ${widths.join(', ')} widths`;
    else if (widths.length === 1) constructedDescription += ` in ${widths[0]} width`;
    if (grades.length > 1) constructedDescription += `, ${grades.join(', ')} grades`;
    else if (grades.length === 1) constructedDescription += `, ${grades[0]} grade`;
    constructedDescription += '. ';
    if (!hidePrice && prices.length) constructedDescription += `From $${Math.min(...prices).toFixed(2)}/sqft. `;
    constructedDescription += hidePrice
      ? 'Available at our Markham showroom. Call (647) 428-1111.'
      : 'Free measurement. (647) 428-1111';
  } else {
    if (product.brand) constructedDescription += product.brand + ' ';
    if (product.colour) constructedDescription += product.colour + ' ';
    else if (product.name) constructedDescription += product.name + ' ';
    if (product.species) constructedDescription += product.species + ' ';
    constructedDescription += `${categoryLabel} flooring in Markham. Professional installation. Free measurement. Call (647) 428-1111!`;
  }
  constructedDescription = constructedDescription.replace(/\s+/g, ' ').trim();

  const description = product.seo_description || constructedDescription;
  const finalDescription = description.length > 160 ? description.substring(0, 157) + '...' : description;

  return { title, description: finalDescription, image: product.image_url };
}

/**
 * Generate collection meta tags for category pages.
 */
export function generateCollectionMetaTags(category) {
  const collections = {
    solid_hardwood: {
      title: 'Solid Hardwood Flooring Markham & Toronto | Premium Selection | BBS Flooring',
      description: 'Shop solid hardwood flooring in Markham & Toronto. Premium brands, competitive pricing. Free measurement. Book your consultation today.'
    },
    engineered_hardwood: {
      title: 'Engineered Hardwood Flooring GTA | Durable & Affordable | BBS Flooring',
      description: 'Find engineered hardwood flooring in Markham, Toronto & Durham. Water-resistant options. Professional installation. Free quote today.'
    },
    laminate: {
      title: 'Laminate Flooring Toronto & Markham | Budget-Friendly Options | BBS Flooring',
      description: 'Durable laminate flooring in Toronto, Markham & GTA. Wood-look designs, easy maintenance. In-stock inventory. Free measurement.'
    },
    vinyl: {
      title: 'Waterproof Vinyl Flooring Markham | Luxury & Durable | BBS Flooring',
      description: 'Waterproof vinyl flooring in Markham, Toronto & Durham. Luxury vinyl plank (LVP) options. Professional installation. Book a free measurement.'
    },
    all: {
      title: 'Flooring Showroom Markham & Toronto | Hardwood, Vinyl, Laminate | BBS Flooring',
      description: 'Premium flooring options in Markham, Toronto & Durham. Hardwood, engineered, laminate & vinyl. Free measurement & installation quotes.'
    }
  };
  return collections[category] || collections.all;
}

// Shared shipping + return policy for all product offers.
// Warehouse pickup is free — shippingRate omitted entirely to avoid
// Google Merchant Listings "value must be positive" warning on $0 values.
// Garage ($140) and in-home ($200) delivery described on PDP UI, not in schema.
const SHIPPING_DETAILS = {
  '@type': 'OfferShippingDetails',
  shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'CA', addressRegion: 'ON' },
  deliveryTime: {
    '@type': 'ShippingDeliveryTime',
    handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 5, unitCode: 'DAY' },
    transitTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 0, unitCode: 'DAY' }
  }
};

const RETURN_POLICY = {
  '@type': 'MerchantReturnPolicy',
  applicableCountry: 'CA',
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: 30,
  returnMethod: 'https://schema.org/ReturnInStore',
  returnFees: 'https://schema.org/ReturnShippingFees',
  returnShippingFeesAmount: {
    '@type': 'MonetaryAmount',
    value: '0',
    currency: 'CAD'
  },
  merchantReturnLink: 'https://bbsflooring.ca/return-policy'
};

const SELLER = { '@type': 'Organization', name: 'BBS Flooring', url: 'https://bbsflooring.ca' };

function buildOffer(product, siteUrl) {
  const price = product.sale_price_per_sqft || product.price_per_sqft || 0;
  // Google flags price "0.00" as "value must be positive" — skip the offer entirely
  if (price <= 0) return null;
  return {
    '@type': 'Offer',
    url: `${siteUrl}/products/${product.slug}`,
    priceCurrency: 'CAD',
    price: price.toFixed(2),
    priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    availability: product.in_stock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    shippingDetails: SHIPPING_DETAILS,
    hasMerchantReturnPolicy: RETURN_POLICY,
    seller: SELLER
  };
}

function buildAdditionalProperties(product) {
  const props = [];
  if (product.grade) props.push({ '@type': 'PropertyValue', name: 'Grade', value: product.grade });
  if (product.species) props.push({ '@type': 'PropertyValue', name: 'Species', value: product.species });
  if (product.dimensions) {
    // Extract width from dimensions like "7½\" x RL" or "5\" x 3/4\""
    const widthMatch = product.dimensions?.match(/^([\d½¼¾⅛⅜⅝⅞./]+(?:[\s-]*[\d½¼¾⅛⅜⅝⅞./]*)?)["″]/);
    if (widthMatch) props.push({ '@type': 'PropertyValue', name: 'Plank Width', value: widthMatch[1].trim() + '"', unitCode: 'INH' });
  }
  // Detect pattern from product name
  const nameLower = (product.name || '').toLowerCase();
  if (nameLower.includes('herringbone')) props.push({ '@type': 'PropertyValue', name: 'Pattern', value: 'Herringbone' });
  else if (nameLower.includes('chevron')) props.push({ '@type': 'PropertyValue', name: 'Pattern', value: 'Chevron' });
  if (product.colour) props.push({ '@type': 'PropertyValue', name: 'Color', value: product.colour });
  return props;
}

/**
 * Generate Product or ProductGroup JSON-LD schema object.
 * When childVariants are provided (parent product), outputs ProductGroup + hasVariant + AggregateOffer.
 * Otherwise outputs a single Product schema.
 */
export function generateProductSchema(product, siteUrl = 'https://bbsflooring.ca', childVariants = [], { hidePrice = false } = {}) {
  const isParent = product.is_parent_product && childVariants.length > 0;

  if (isParent) {
    // --- ProductGroup with hasVariant (Google Merchant / Rich Results) ---
    const prices = childVariants
      .map(v => v.sale_price_per_sqft || v.price_per_sqft)
      .filter(p => p && p > 0);
    const lowPrice = prices.length ? Math.min(...prices) : (product.price_per_sqft || 0);
    const highPrice = prices.length ? Math.max(...prices) : lowPrice;

    const schema = {
      '@context': 'https://schema.org/',
      '@type': 'ProductGroup',
      name: product.name,
      description: product.specifications || `Premium ${product.category?.replace('_', ' ')} flooring — available in ${childVariants.length} options`,
      url: `${siteUrl}/products/${product.slug}`,
      image: product.image_url,
      brand: { '@type': 'Brand', name: product.brand || 'BBS Flooring' },
      productGroupID: product.sku || product.slug || product.id,
      // Properties that vary across variants
      vpiDimensionType: ['width', 'grade'].filter(Boolean),
      hasVariant: childVariants.map(v => {
        const variantSchema = {
          '@type': 'Product',
          name: v.name,
          sku: v.sku,
          image: v.image_url || product.image_url,
          description: v.specifications || `${v.name} — ${v.grade || ''} grade ${v.species || product.species || ''} flooring`.trim(),
          ...(!hidePrice && buildOffer(v, siteUrl) ? { offers: buildOffer(v, siteUrl) } : {}),
        };
        const addlProps = buildAdditionalProperties(v);
        if (addlProps.length) variantSchema.additionalProperty = addlProps;
        return variantSchema;
      }),
      ...(!hidePrice ? {
        offers: {
          '@type': 'AggregateOffer',
          lowPrice: lowPrice.toFixed(2),
          highPrice: highPrice.toFixed(2),
          priceCurrency: 'CAD',
          offerCount: childVariants.length,
          availability: 'https://schema.org/InStock',
        },
      } : {}),
    };

    const parentProps = buildAdditionalProperties(product);
    if (parentProps.length) schema.additionalProperty = parentProps;

    if (product.review_rating && product.review_count > 0) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: product.review_rating,
        ratingCount: product.review_count
      };
    }

    return schema;
  }

  // --- Single Product (non-parent or no child variants) ---
  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.specifications || `Premium ${product.category?.replace('_', ' ')} flooring`,
    image: product.image_url,
    brand: { '@type': 'Brand', name: product.brand || 'BBS Flooring' },
    sku: product.sku,
    ...(!hidePrice && buildOffer(product, siteUrl) ? { offers: buildOffer(product, siteUrl) } : {}),
  };

  const addlProps = buildAdditionalProperties(product);
  if (addlProps.length) schema.additionalProperty = addlProps;

  if (product.review_rating && product.review_count > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.review_rating,
      ratingCount: product.review_count
    };
  }

  return schema;
}

/**
 * Generate FAQ JSON-LD schema object.
 */
export function generateFAQSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer }
    }))
  };
}

/**
 * Generate BreadcrumbList JSON-LD schema object.
 */
export function generateBreadcrumbSchema(items, currentPath, siteUrl = 'https://bbsflooring.ca') {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const isLast = index === items.length - 1;
      const url = item.url
        ? `${siteUrl}${item.url}`
        : isLast && currentPath
          ? `${siteUrl}${currentPath}`
          : undefined;
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        ...(url ? { item: url } : {}),
      };
    })
  };
}
