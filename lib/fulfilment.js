// ─────────────────────────────────────────────────────────────────────────────
// lib/fulfilment.js — S4 (Sep 12 2026, memory/ACCESSORY-ATTACH-PLAN.md).
// Single source of truth for supplies-only checkout fulfilment behaviour.
// Client-safe: no server-only imports (no Supabase, no fs, no next/server) so
// this can be imported from client components (CheckoutClient, CartClient,
// SupplyBuyBox, SuppliesShopClient) AND server-side templates (lib/email.js,
// lib/telegram.js) without pulling in either bundle's dead weight.
//
// Business rule (owner-approved Sep 12 2026 — do not reinterpret):
// A cart/order containing ONLY supplies/accessories/transitions (no flooring
// product line) defaults to free showroom pickup, ready next business day.
// Supplies inside a flooring order ride the flooring delivery (unchanged).
// Supplies-only delivery still costs the existing $140 garage / $200 inside —
// no new fees, no new tiers.
// ─────────────────────────────────────────────────────────────────────────────

export const SHOWROOM_PICKUP_ADDRESS = 'BBS Flooring, 6061 Highway 7, Unit B, Markham, ON L3P 3B2';

// Exact lead-time sentence — never promise same-day. Reused verbatim in
// checkout copy, confirmation screens, and customer emails.
export const SUPPLIES_PICKUP_LEAD_COPY = "Ready for pickup next business day. We'll email you when it's ready.";

export const SUPPLIES_PICKUP_LABEL = 'Showroom Pickup (FREE)';

// One-line fulfilment strip for supply PDPs, hub and category pages.
export const SUPPLIES_FULFILMENT_STRIP = 'Free pickup in Markham (ready next business day) · GTA delivery $140';

// Admin / Telegram alert prefix for supplies-only pickup orders.
export const SUPPLIES_ONLY_ALERT_PREFIX = 'SUPPLIES-ONLY · prep 1 business day';

/**
 * True when a cart/order is supplies-only: at least one line, and every line
 * is an accessory (underlay, adhesive, quarter round, baseboard, tools…) or a
 * transition (reducer, T-mould, stair nosing…). Flooring product lines carry
 * no item_type (or item_type === 'product'), so a single flooring line flips
 * this false and the cart rides the normal flooring delivery rules.
 */
export function isSuppliesOnlyCart(items) {
  if (!Array.isArray(items) || items.length === 0) return false;
  return items.every((it) => it && (it.item_type === 'accessory' || it.item_type === 'transition'));
}
