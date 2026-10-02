// ─────────────────────────────────────────────────────────────────────────────
// lib/fulfilment.js — S4 (Sep 12 2026, memory/ACCESSORY-ATTACH-PLAN.md).
// Single source of truth for supplies-only checkout fulfilment behaviour.
// Client-safe: no server-only imports (no Supabase, no fs, no next/server) so
// this can be imported from client components (CheckoutClient, CartClient,
// SupplyBuyBox, SuppliesShopClient) AND server-side templates (lib/email.js,
// lib/telegram.js) without pulling in either bundle's dead weight.
//
// Business rule (owner-approved Sep 12 2026, CORRECTED Oct 2 2026 — do not
// reinterpret):
// A cart/order containing ONLY supplies/accessories (item_type 'accessory':
// adhesive, underlay, primer, generic baseboard/shoe, tools…) defaults to free
// showroom pickup, ready next business day.
// BRAND-MATCHED TRIMS (item_type 'transition' — the "Matches <collection>"
// T-moulding / reducer / stair nose added from a flooring PDP) are NOT showroom
// stock: they're ordered from the flooring brand and picked up at that brand's
// warehouse, exactly like the flooring itself. Order BBS-10064 (Oct 2) went out
// as "showroom pickup" for a NAF T-moulding — Abram: "Matching laminate and
// vinyl and hardwood trims are definitely warehouse pickup. Only Prosol stuff
// is showroom pickup." So a transition line flips the cart back to the normal
// Warehouse Pickup / delivery flow.
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
 * True when a cart/order is SHOWROOM-PICKUP eligible: at least one line, and
 * every line is an accessory (underlay, adhesive, quarter round, generic
 * baseboard, tools…). A brand-matched transition line (item_type 'transition')
 * or a flooring line (no item_type / 'product') flips this false and the cart
 * rides the normal Warehouse Pickup / delivery rules.
 */
export function isSuppliesOnlyCart(items) {
  if (!Array.isArray(items) || items.length === 0) return false;
  return items.every((it) => it && it.item_type === 'accessory');
}

/**
 * True when a cart/order has NO flooring line (every line is an accessory or a
 * matching transition). Cosmetic only — hides box/sq.ft totals and the
 * "sold in full boxes" note. Says nothing about where the order is picked up;
 * use isSuppliesOnlyCart for fulfilment decisions.
 */
export function hasNoFlooringLines(items) {
  if (!Array.isArray(items) || items.length === 0) return false;
  return items.every((it) => it && (it.item_type === 'accessory' || it.item_type === 'transition'));
}
