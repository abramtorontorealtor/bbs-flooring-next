/**
 * END-OF-LOT (exact-quantity clearance) — server helpers. Spec: workspace memory/END-OF-LOT-SPEC.md
 *
 * products.lot_boxes_left (int|null): NULL = not a counted lot (all legacy behaviour). N = boxes we can still sell.
 * Reserve happens when an order is CREATED (e-Transfer orders sit unpaid for hours; two buyers must not both hold
 * the last boxes). Release on cancel / Stripe expiry / payment failure / refund, and by the 24h e-Transfer timeout
 * cron (workspace scripts/lot-release.sh). Order line items carry `lot_reserved: n` + `lot_released: bool`.
 *
 * DB functions (scripts/sql/end-of-lot-2026-10-29.sql): lot_reserve(uuid,int) -> null | -1 | left,
 * lot_release(uuid,int), lot_release_order(uuid) -> released[], lot_reserve_order(uuid) -> shortfalls[].
 */

import { PHONE_DISPLAY } from '@/lib/contact';

/** Boxes for a line, server-side (never trust client boxes_required). */
export function boxesForLine(item, sqftPerBox) {
  const spb = Number(sqftPerBox) || 0;
  const sqft = Number(item?.actual_sqft || item?.sqft || item?.square_footage || 0);
  if (spb > 0 && sqft > 0) return Math.ceil(sqft / spb - 1e-9);
  const b = parseInt(item?.boxes_required, 10);
  return Number.isFinite(b) && b > 0 ? b : 0;
}

/** Human line for badges/pills/alerts. */
export function lotLabel(boxes, sqftPerBox) {
  const n = Number(boxes);
  if (!Number.isFinite(n) || n <= 0) return '';
  const sqft = sqftPerBox ? Math.floor(n * Number(sqftPerBox)) : null;
  return `Only ${n} ${n === 1 ? 'box' : 'boxes'} left — end of lot${sqft ? ` (≈${sqft} sqft)` : ''}`;
}

/**
 * Gate: compare each product line against lot_boxes_left. `products` = rows with id,name,sqft_per_box,lot_boxes_left.
 * Returns [] when fine, else [{ product_id, name, requested, max_boxes, max_sqft }].
 */
export function lotViolations(items, products) {
  const byId = new Map((products || []).map((p) => [p.id, p]));
  const out = [];
  for (const it of items || []) {
    const pid = it.product_id || it.id;
    const p = pid ? byId.get(pid) : null;
    if (!p || p.lot_boxes_left == null) continue;
    const n = boxesForLine(it, p.sqft_per_box);
    if (n > p.lot_boxes_left) {
      out.push({
        product_id: pid, name: p.name, requested: n, max_boxes: p.lot_boxes_left,
        max_sqft: p.sqft_per_box ? Math.floor(p.lot_boxes_left * Number(p.sqft_per_box)) : null,
      });
    }
  }
  return out;
}

export function lotViolationMessage(v) {
  return v.map((x) => `${x.name}: only ${x.max_boxes} ${x.max_boxes === 1 ? 'box' : 'boxes'}${x.max_sqft ? ` (≈${x.max_sqft} sqft)` : ''} left — this is the end of the lot`).join('; ')
    + '. Reduce the square footage or call us at ' + PHONE_DISPLAY + ' to check for more.';
}

/**
 * Reserve boxes for every counted-lot line. Returns { items, reserved: [{product_id,name,boxes,left}], failed: {...}|null }.
 * On a race (another order took the boxes between the gate and here) it rolls back the lines already reserved.
 */
export async function reserveLotLines(supabase, items, products) {
  const byId = new Map((products || []).map((p) => [p.id, p]));
  const reserved = [];
  const outItems = [];
  for (const it of items || []) {
    const pid = it.product_id || it.id;
    const p = pid ? byId.get(pid) : null;
    if (!p || p.lot_boxes_left == null) { outItems.push(it); continue; }
    const n = boxesForLine(it, p.sqft_per_box);
    if (n <= 0) { outItems.push(it); continue; }
    const { data, error } = await supabase.rpc('lot_reserve', { p_product_id: pid, p_boxes: n });
    if (error || data === -1) {
      for (const r of reserved) await supabase.rpc('lot_release', { p_product_id: r.product_id, p_boxes: r.boxes });
      return { items, reserved: [], failed: { product_id: pid, name: p.name, requested: n, error: error?.message || 'insufficient' } };
    }
    if (data == null) { outItems.push(it); continue; } // not a lot after all
    reserved.push({ product_id: pid, name: p.name, boxes: n, left: data });
    outItems.push({ ...it, lot_reserved: n, lot_released: false });
  }
  return { items: outItems, reserved, failed: null };
}

/** Give an order's reserved boxes back (idempotent). Returns released[]; never throws. */
export async function releaseLotForOrder(supabase, orderId) {
  try {
    const { data, error } = await supabase.rpc('lot_release_order', { p_order_id: orderId });
    if (error) { console.error('[lot] release failed', orderId, error.message); return []; }
    return Array.isArray(data) ? data : [];
  } catch (e) { console.error('[lot] release threw', orderId, e?.message); return []; }
}

/** Re-reserve after a late e-Transfer. Returns shortfalls[] (empty = all good); never throws. */
export async function rereserveLotForOrder(supabase, orderId) {
  try {
    const { data, error } = await supabase.rpc('lot_reserve_order', { p_order_id: orderId });
    if (error) { console.error('[lot] re-reserve failed', orderId, error.message); return []; }
    return Array.isArray(data) ? data : [];
  } catch (e) { console.error('[lot] re-reserve threw', orderId, e?.message); return []; }
}

export function lotAlertLine(reserved) {
  if (!reserved?.length) return '';
  return '\n🧯 End-of-lot: ' + reserved.map((r) => `${r.name} ${r.boxes} box${r.boxes === 1 ? '' : 'es'} → ${r.left} left`).join('; ');
}
