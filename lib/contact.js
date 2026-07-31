/**
 * BBS Flooring — Contact channel constants & URL builders
 * Single source of truth for phone, SMS, and WhatsApp CTAs.
 *
 * Usage:
 *   import { PHONE_DISPLAY, callUrl, smsUrl, whatsappUrl } from '@/lib/contact';
 *
 * All three channels accept an optional `productName` string that pre-populates
 * the message so the customer arrives in the conversation already identified.
 */

export const PHONE_RAW      = '6474281111';          // digits only, for tel: links
export const PHONE_INTL     = '+16474281111';        // international, for wa.me
export const PHONE_DISPLAY  = '(647) 428-1111';

/** tel: link — one tap to call */
export const callUrl = () => `tel:${PHONE_RAW}`;

/**
 * Build a detailed, self-identifying enquiry line from either a plain product
 * name string OR a rich descriptor object. This is what makes the pre-filled
 * WhatsApp/SMS message actually useful — it carries the exact SKU + config so
 * Abram can price it without a back-and-forth.
 *
 * @param {string|object} [product] — product name, or
 *   { name, sku, variantSku, config, url } where `config` is e.g. "6 1/2\" · Select & Better".
 * @returns {string}
 */
export const buildEnquiryMessage = (product) => {
  if (!product) return `Hi, I'm interested in flooring from bbsflooring.ca. Can you help with pricing?`;
  if (typeof product === 'string') {
    return `Hi, I'm interested in the ${product} from bbsflooring.ca. Can you help with pricing?`;
  }
  const { name, sku, variantSku, config, url } = product;
  const parts = [];
  parts.push(`Hi, I'd like a price on this floor from bbsflooring.ca:`);
  if (name) parts.push(`• Product: ${name}`);
  if (config) parts.push(`• Options: ${config}`);
  const code = variantSku || sku;
  if (code) parts.push(`• SKU: ${code}`);
  if (url) parts.push(`• Link: ${url}`);
  parts.push(`Can you help with pricing?`);
  return parts.join('\n');
};

/**
 * sms: deep link — opens native SMS app with number + pre-filled body.
 * @param {string|object} [product] — product name string or rich descriptor (see buildEnquiryMessage)
 */
export const smsUrl = (product) => {
  return `sms:${PHONE_RAW}?body=${encodeURIComponent(buildEnquiryMessage(product))}`;
};

/**
 * WhatsApp deep link — opens WA directly with pre-filled message.
 * Works on mobile (native app) and desktop (web.whatsapp.com fallback).
 * @param {string} [productName]
 */
export const whatsappUrl = (product) => {
  return `https://wa.me/${PHONE_INTL.replace('+', '')}?text=${encodeURIComponent(buildEnquiryMessage(product))}`;
};
