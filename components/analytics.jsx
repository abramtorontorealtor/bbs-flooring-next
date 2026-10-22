'use client';

// Google Analytics 4 + Google Ads Conversion Helper Functions

const GOOGLE_ADS_ID = 'AW-700910775';
const LEAD_CONVERSION_LABEL = 'AW-700910775/PQ1CCNmSn7ocELeZnM4C';
const PHONE_CONVERSION_LABEL = 'AW-700910775/ZUi8CIO8-NEaELeZnM4C';

/**
 * Initialize GA4 + Google Ads
 * Call this once in Layout component
 */
export function initGA4(measurementId) {
  if (!measurementId || typeof window === 'undefined') return;
  
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  
  gtag('js', new Date());
  gtag('config', measurementId);
  gtag('config', GOOGLE_ADS_ID, { allow_enhanced_conversions: true });
}

/** Normalise a North American phone number to E.164 (+1XXXXXXXXXX). Returns '' if unusable. */
export function toE164(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return '';
}

/** Split "First Last Name" on the first space. */
export function splitName(name) {
  const t = String(name || '').trim();
  if (!t) return { firstName: '', lastName: '' };
  const i = t.indexOf(' ');
  return i === -1
    ? { firstName: t, lastName: '' }
    : { firstName: t.slice(0, i), lastName: t.slice(i + 1).trim() };
}

/**
 * Google Ads Enhanced Conversions: set user_data (gtag hashes it) before the
 * Ads `conversion` event. No-op without gtag.
 */
export function setEnhancedUserData({ email, phone, firstName, lastName, street, city, region, postalCode } = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  const clean = (v) => (v == null ? '' : String(v).trim());
  const obj = {};
  const em = clean(email).toLowerCase();
  if (em) obj.email = em;
  const ph = toE164(phone);
  if (ph) obj.phone_number = ph;
  if (clean(firstName) && clean(lastName) && clean(postalCode)) {
    const address = {
      first_name: clean(firstName),
      last_name: clean(lastName),
      street: clean(street),
      city: clean(city),
      region: clean(region),
      postal_code: clean(postalCode),
      country: 'CA',
    };
    Object.keys(address).forEach((k) => { if (!address[k]) delete address[k]; });
    obj.address = address;
  }
  if (Object.keys(obj).length === 0) return;
  try { window.gtag('set', 'user_data', obj); } catch { /* analytics must never throw */ }
}

export function trackEvent(action, category, label = '') {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    timestamp: new Date().toISOString()
  });
}

function firePurchase(transactionId, { value, tax, items = [], paymentType = '' }) {
  if (typeof window === 'undefined') return;
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value,
      currency: 'CAD',
      tax,
      payment_type: paymentType,
      items,
    });
  }
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Purchase', {
      value,
      currency: 'CAD',
      content_type: 'product',
      num_items: items.length,
    });
  }
}

export const Analytics = {
  trackEvent,

  trackPhoneClick: (location = 'header') => {
    trackEvent('click_call', 'contact', location);
  },

  trackLeadConversion: (source = 'unknown', value = 50.0) => {
    if (typeof window === 'undefined' || !window.gtag) return;
    window.gtag('event', 'conversion', {
      send_to: LEAD_CONVERSION_LABEL,
      value: value,
      currency: 'CAD',
      event_label: source,
    });
  },

  trackQuoteSubmit: (productName = '', value = 0, currency = 'CAD') => {
    if (typeof window === 'undefined' || !window.gtag) return;
    window.gtag('event', 'submit_quote', {
      event_category: 'conversion',
      event_label: productName,
      value: value,
      currency: currency,
    });
    // Also fire direct Google Ads conversion
    window.gtag('event', 'conversion', {
      send_to: LEAD_CONVERSION_LABEL,
      value: value || 50.0,
      currency: 'CAD',
    });
  },

  trackBookingSubmit: (serviceType = '') => {
    trackEvent('submit_booking', 'lead', serviceType);
  },

  trackPDFView: (fileName = '') => {
    trackEvent('view_pdf', 'engagement', fileName);
  },

  trackProductView: (productName = '') => {
    trackEvent('view_product', 'engagement', productName);
  },

  trackViewItem: (product, displayPrice) => {
    if (typeof window === 'undefined' || !window.gtag) return;
    window.gtag('event', 'view_item', {
      currency: 'CAD',
      value: displayPrice,
      items: [{
        item_id: product.sku || product.id,
        item_name: product.name,
        item_category: product.category,
        item_brand: product.brand,
        price: displayPrice,
      }],
    });
  },

  trackViewItemList: (products, listName = 'Product Listing') => {
    if (typeof window === 'undefined' || !window.gtag) return;
    if (!products || products.length === 0) return;
    window.gtag('event', 'view_item_list', {
      item_list_name: listName,
      items: products.slice(0, 20).map((product, index) => ({
        item_id: product.sku || product.id,
        item_name: product.name,
        item_category: product.category,
        item_brand: product.brand,
        price: product.price_per_sqft || product.sale_price_per_sqft || 0,
        index: index,
      })),
    });
  },

  // Grid-card click -> PDP. `index` = 0-based position in the rendered list
  // (position-CTR for Showroom Sort); `listName` matches view_item_list.
  trackSelectItem: (product, index, listName = 'Product Listing') => {
    if (typeof window === 'undefined' || !window.gtag || !product) return;
    window.gtag('event', 'select_item', {
      item_list_name: listName,
      items: [{
        item_id: product.sku || product.id,
        item_name: product.name,
        item_category: product.category,
        item_brand: product.brand,
        price: product.price_per_sqft || product.sale_price_per_sqft || 0,
        index: typeof index === 'number' ? index : undefined,
      }],
    });
  },

  trackAddToCart: (productName = '', value = 0) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'add_to_cart', {
        event_category: 'ecommerce',
        event_label: productName,
        value: value
      });
    }
  },

  trackPurchase: (transactionId, total, tax, cartItems = [], paymentType = '') => {
    firePurchase(transactionId, {
      value: total,
      tax,
      paymentType,
      items: cartItems.map(item => ({
        item_id: item.product_id || item.sku,
        item_name: item.product_name,
        price: item.price_per_sqft,
        quantity: item.actual_sqft,
      })),
    });
  },

  // Fires `purchase` at most once per transactionId per browser (localStorage flag).
  // `items` must already be GA4-shaped ({item_id,item_name,price,quantity}).
  trackPurchaseOnce: (transactionId, { value, tax, items = [], paymentType = '' } = {}) => {
    if (typeof window === 'undefined' || !transactionId) return false;
    const key = `bbs_purchase_fired:${transactionId}`;
    try {
      if (window.localStorage.getItem(key)) return false;
      window.localStorage.setItem(key, '1');
    } catch { /* storage blocked: fall through and fire */ }
    firePurchase(transactionId, { value, tax, items, paymentType });
    return true;
  },

  setEnhancedUserData,
};

export default Analytics;
