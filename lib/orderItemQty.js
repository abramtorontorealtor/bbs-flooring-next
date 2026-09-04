/**
 * Human-readable quantity for an order/quote line item.
 *
 * Flooring products carry boxes_required + actual_sqft. Accessories (underpad,
 * adhesive…) and transitions (reducers, T-mould…) carry quantity /
 * transition_quantity and NO sqft — historically every surface rendered them
 * as "? boxes (? sqft)" / "0.0 sqft", which hid the piece count from Abram.
 *
 * Returns { qty, unit, label, sqft, unitPrice }.
 *   label     → "63 boxes (977 sqft)" | "2 pcs" | "5 rolls"
 *   unitPrice → per-sqft for flooring, per-piece for everything else (or null)
 */
export function describeItemQty(item = {}) {
  const type = item.item_type || (item.boxes_required != null ? 'product' : 'accessory');

  if (type === 'product') {
    const boxes = Number(item.boxes_required) || 0;
    const sqft = Number(item.actual_sqft) || 0;
    return {
      qty: boxes,
      unit: boxes === 1 ? 'box' : 'boxes',
      sqft,
      label: `${boxes || '?'} ${boxes === 1 ? 'box' : 'boxes'}${sqft ? ` (${sqft.toFixed(0)} sqft)` : ''}`,
      unitPrice: item.price_per_sqft != null ? { amount: Number(item.price_per_sqft), per: 'sqft' } : null,
    };
  }

  const qty = Math.max(0, parseInt(item.transition_quantity ?? item.quantity ?? 0, 10) || 0);
  const isRoll = /underpad|underlay|roll/i.test(`${item.sku || ''} ${item.product_name || ''}`);
  const unit = isRoll ? (qty === 1 ? 'roll' : 'rolls') : (qty === 1 ? 'pc' : 'pcs');
  const lineTotal = Number(item.line_total) || 0;
  return {
    qty,
    unit,
    sqft: 0,
    label: `${qty || '?'} ${unit}`,
    unitPrice: qty > 0 ? { amount: lineTotal / qty, per: 'ea' } : null,
  };
}

export function formatItemQty(item) {
  return describeItemQty(item).label;
}
