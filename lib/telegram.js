/**
 * Telegram alert utility for BBS Flooring.
 * Sends instant lead notifications to Abram's Telegram.
 * Uses TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID env vars.
 */

const EMOJI = {
  contact: '📩',
  booking: '📅',
  quote: '💰',
  contractor: '🔨',
  abandoned: '🛒',
  order: '📦',
};

export async function sendTelegramAlert(message) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn('[Telegram] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID — skipping alert');
    return { success: false, reason: 'no_credentials' };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[Telegram] Alert failed:', res.status, text);
      return { success: false, error: text };
    }

    return { success: true };
  } catch (err) {
    console.error('[Telegram] Send failed:', err.message);
    return { success: false, error: err.message };
  }
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function formatContactAlert({ name, email, phone, message, source }) {
  const src = source && source !== 'contact_form' ? ` [${source.replace(/_/g, ' ')}]` : '';
  const preview = message ? `\n💬 <i>${esc(message).substring(0, 1500)}${message.length > 1500 ? '…' : ''}</i>` : '';
  return `${EMOJI.contact} <b>New Contact Lead${src}</b>\n👤 ${esc(name)}\n📞 ${phone || 'N/A'}\n📧 ${esc(email)}${preview}`;
}

export function formatBookingAlert({ customer_name, customer_email, customer_phone, customer_address, postal_code, preferred_date, preferred_time, flooring_type, service_type, square_footage, product_name, quote_total, notes }) {
  const date = preferred_date ? `${preferred_date}${preferred_time ? ' @ ' + preferred_time : ''}` : 'TBD';
  const lines = [
    `${EMOJI.booking} <b>New Booking Request</b>`,
    `👤 ${esc(customer_name)}`,
    `📞 ${customer_phone || 'N/A'}`,
    `📧 ${esc(customer_email)}`,
    `📅 ${date}`,
    customer_address ? `📍 ${esc(customer_address)}${postal_code ? ' ' + esc(postal_code) : ''}` : null,
    flooring_type ? `🏷 ${esc(flooring_type)}${service_type ? ' · ' + service_type.replace(/_/g, ' ') : ''}` : null,
    square_footage ? `📐 ${square_footage} sqft` : null,
    product_name ? `📦 ${esc(product_name)}` : null,
    quote_total ? `💰 $${Number(quote_total).toFixed(2)}` : null,
    notes ? `💬 <i>${esc(notes).substring(0, 200)}</i>` : null,
  ].filter(Boolean);
  return lines.join('\n');
}

export function formatQuoteAlert({ customer_name, customer_email, customer_phone, customer_address, product_name, square_footage, price_per_sqft, removal_type, needs_baseboards, needs_shoe_moulding, delivery_cost, subtotal, tax, total, notes,
  stair_tread_count, stair_pie_count, stair_refinish, stair_posts, stair_pickets, stair_stringers, stair_nosing, stair_railing, stair_landing, stair_species
}) {
  const sqft = square_footage ? `${square_footage} sqft` : null;
  const ppSqft = price_per_sqft ? `@ $${Number(price_per_sqft).toFixed(2)}/sqft` : null;
  const trims = [needs_baseboards && 'Baseboards', needs_shoe_moulding && 'Shoe moulding'].filter(Boolean).join(', ');

  // Build stair breakdown lines
  const stairLines = [];
  const hasStairs = stair_tread_count > 0 || stair_pie_count > 0;
  if (hasStairs) {
    stairLines.push(`🪜 <b>Stairs:</b>`);
    if (stair_tread_count > 0) stairLines.push(`  • ${stair_tread_count} straight treads (${stair_refinish ? 'refinish' : 'new @ $185/step'})`);
    if (stair_pie_count > 0) stairLines.push(`  • ${stair_pie_count} pie/triangle treads @ $225/step`);
    if (stair_posts > 0) stairLines.push(`  • ${stair_posts} new post(s) @ $150/post`);
    if (stair_pickets > 0) stairLines.push(`  • ${stair_pickets} pickets @ $25/piece`);
    if (stair_stringers?.count > 0) stairLines.push(`  • ${stair_stringers.count} stringer(s) — ${stair_stringers.type}`);
    if (stair_nosing?.lf > 0) stairLines.push(`  • Nosing ${stair_nosing.lf}lf (${stair_nosing.type})`);
    if (stair_railing?.lf > 0) stairLines.push(`  • Railing ${stair_railing.lf}lf (${stair_railing.type})`);
    if (stair_landing) stairLines.push(`  • Landing: ${stair_landing.size}`);
    if (stair_species && stair_species !== 'red_oak') stairLines.push(`  • Species: ${esc(stair_species.replace('_', ' '))}`);
  }

  const lines = [
    `${EMOJI.quote} <b>New Quote — ${total ? '$' + Number(total).toFixed(2) : 'TBD'}</b>`,
    `👤 ${esc(customer_name)}`,
    `📞 ${customer_phone || 'N/A'}`,
    `📧 ${esc(customer_email)}`,
    customer_address ? `📍 ${esc(customer_address)}` : null,
    product_name && product_name !== 'Stair Renovation' ? `📦 ${esc(product_name)}` : null,
    (sqft || ppSqft) ? `📐 ${[sqft, ppSqft].filter(Boolean).join(' ')}` : null,
    removal_type && removal_type !== 'none' ? `🗑 Removal: ${esc(removal_type)}` : null,
    trims ? `🪵 Trims: ${trims}` : null,
    delivery_cost > 0 ? `🚚 Delivery included` : null,
    ...stairLines,
    total ? `💰 Subtotal $${Number(subtotal||0).toFixed(2)} + HST $${Number(tax||0).toFixed(2)} = <b>$${Number(total).toFixed(2)}</b>` : null,
  ].filter(Boolean);
  return lines.join('\n');
}

export function formatContractorAlert({ contact_name, email, phone, company_name, trade_type, monthly_volume }) {
  return [
    `${EMOJI.contractor} <b>New Contractor Registration</b>`,
    `👤 ${esc(contact_name)}`,
    `🏢 ${esc(company_name) || 'N/A'}`,
    `📞 ${phone || 'N/A'}`,
    `📧 ${esc(email)}`,
    trade_type ? `🔨 ${esc(trade_type)}` : null,
    monthly_volume ? `📦 Volume: ${esc(monthly_volume)}/mo` : null,
  ].filter(Boolean).join('\n');
}

export function formatAbandonedCartAlert({ customerName, customerEmail, cartValue, cartItems }) {
  const items = Array.isArray(cartItems)
    ? cartItems.map(i => `  • ${esc(i.product_name || i.name)}${i.actual_sqft ? ' — ' + Number(i.actual_sqft).toFixed(0) + ' sqft' : ''}${i.line_total ? ' — $' + Number(i.line_total).toFixed(2) : ''}`).join('\n')
    : '';
  return [
    `${EMOJI.abandoned} <b>Abandoned Cart — $${Number(cartValue || 0).toFixed(2)}</b>`,
    `👤 ${esc(customerName)}`,
    `📧 ${esc(customerEmail)}`,
    items,
  ].filter(Boolean).join('\n');
}

export function formatOrderAlert({ order }) {
  const isEtransfer = order.payment_method !== 'credit_card';
  const paymentLabel = isEtransfer ? '🏦 E-Transfer (PENDING)' : '💳 Credit Card';
  const deliveryMap = {
    pickup: '🏭 Warehouse Pickup (FREE)',
    delivery: '🚚 Delivery',
    inside: '🏠 Inside Delivery ($200)',
    garage: '🚪 Garage Delivery ($140)',
    custom_freight: '🚛 Custom Freight Delivery',
  };
  const deliveryLabel = deliveryMap[order.delivery_preference] || `📦 ${order.delivery_preference || 'Unknown'}`;
  const items = (order.items || []).map(i =>
    `  • ${esc(i.product_name || 'Item')} — ${i.boxes_required || '?'} boxes (${i.actual_sqft ? Number(i.actual_sqft).toFixed(0) : '?'} sqft) — $${(i.line_total || 0).toFixed(2)}`
  ).join('\n');
  const fraudFlag = order.fraud_flag ? '\n🚨 <b>FRAUD FLAG — ADDRESS MISMATCH — verify before capture</b>' : '';
  const lines = [
    `${EMOJI.order} <b>New Order ${order.order_number} — $${Number(order.total || 0).toFixed(2)}</b>${fraudFlag}`,
    `👤 ${esc(order.customer_name)}`,
    `📞 ${order.customer_phone || 'N/A'}`,
    `📧 ${esc(order.customer_email)}`,
    order.shipping_address ? `📍 ${esc(order.shipping_address)}, ${esc(order.shipping_city || '')} ${esc(order.shipping_postal_code || '')}` : null,
    deliveryLabel,
    paymentLabel,
    items,
    order.notes ? `💬 <i>${esc(order.notes).substring(0, 200)}</i>` : null,
  ].filter(Boolean);
  return lines.join('\n');
}
