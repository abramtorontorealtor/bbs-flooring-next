'use client';

// Google Analytics 4 + Google Ads Conversion Helper Functions

const GOOGLE_ADS_ID = 'AW-700910775';

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
  gtag('config', GOOGLE_ADS_ID);
}

export function trackEvent(action, category, label = '') {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    timestamp: new Date().toISOString()
  });
}

export const Analytics = {
  trackEvent,

  trackPhoneClick: (location = 'header') => {
    trackEvent('click_call', 'contact', location);
  },

  trackQuoteSubmit: (productName = '', value = 0, currency = 'CAD') => {
    if (typeof window === 'undefined' || !window.gtag) return;
    window.gtag('event', 'submit_quote', {
      event_category: 'conversion',
      event_label: productName,
      value: value,
      currency: currency,
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
    if (typeof window === 'undefined' || !window.gtag) return;
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: total,
      currency: 'CAD',
      tax: tax,
      payment_type: paymentType,
      items: cartItems.map(item => ({
        item_id: item.product_id || item.sku,
        item_name: item.product_name,
        price: item.price_per_sqft,
        quantity: item.actual_sqft,
      })),
    });
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Purchase', {
        value: total,
        currency: 'CAD',
        content_type: 'product',
        num_items: cartItems.length,
      });
    }
  },
};

export default Analytics;
