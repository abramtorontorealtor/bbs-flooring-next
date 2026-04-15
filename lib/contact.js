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
 * sms: deep link — opens native SMS app with number + pre-filled body.
 * @param {string} [productName] — e.g. "Macaroon Oak 7½" Hardwood"
 */
export const smsUrl = (productName) => {
  const body = productName
    ? `Hi, I'm interested in the ${productName} from bbsflooring.ca. Can you help with pricing?`
    : `Hi, I'm interested in flooring from bbsflooring.ca.`;
  return `sms:${PHONE_RAW}?body=${encodeURIComponent(body)}`;
};

/**
 * WhatsApp deep link — opens WA directly with pre-filled message.
 * Works on mobile (native app) and desktop (web.whatsapp.com fallback).
 * @param {string} [productName]
 */
export const whatsappUrl = (productName) => {
  const text = productName
    ? `Hi, I'm interested in the ${productName} from bbsflooring.ca. Can you help with pricing?`
    : `Hi, I'm interested in flooring from bbsflooring.ca.`;
  return `https://wa.me/${PHONE_INTL.replace('+', '')}?text=${encodeURIComponent(text)}`;
};
