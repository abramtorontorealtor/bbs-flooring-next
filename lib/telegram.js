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

export function formatContactAlert({ name, email, phone, message, source }) {
  const src = source ? ` [${source.replace(/_/g, ' ')}]` : '';
  const preview = message ? `\n💬 <i>${message.substring(0, 200).replace(/</g, '&lt;').replace(/>/g, '&gt;')}${message.length > 200 ? '…' : ''}</i>` : '';
  return `${EMOJI.contact} <b>New Contact Lead${src}</b>\n👤 ${name}\n📧 ${email}\n📞 ${phone || 'N/A'}${preview}`;
}

export function formatBookingAlert({ customer_name, customer_email, customer_phone, preferred_date, preferred_time, flooring_type, service_type, square_footage, notes }) {
  const date = preferred_date ? `${preferred_date}${preferred_time ? ' @ ' + preferred_time : ''}` : 'TBD';
  const sqft = square_footage ? ` · ${square_footage} sqft` : '';
  const noteStr = notes ? `\n💬 <i>${notes.substring(0, 150).replace(/</g, '&lt;')}</i>` : '';
  return `${EMOJI.booking} <b>New Booking Request</b>\n👤 ${customer_name}\n📧 ${customer_email}\n📞 ${customer_phone || 'N/A'}\n📅 ${date}\n🏷 ${flooring_type || 'N/A'} · ${(service_type || '').replace(/_/g, ' ')}${sqft}${noteStr}`;
}

export function formatQuoteAlert({ customer_name, customer_email, customer_phone, product_name, square_footage, total, notes }) {
  const sqft = square_footage ? `${square_footage} sqft` : 'N/A';
  const totalStr = total ? ` · <b>$${Number(total).toFixed(2)}</b>` : '';
  const noteStr = notes ? `\n💬 <i>${notes.substring(0, 150).replace(/</g, '&lt;')}</i>` : '';
  return `${EMOJI.quote} <b>New Quote Request</b>\n👤 ${customer_name}\n📧 ${customer_email}\n📞 ${customer_phone || 'N/A'}\n📦 ${product_name || 'N/A'} · ${sqft}${totalStr}${noteStr}`;
}

export function formatContractorAlert({ contact_name, email, phone, company_name, trade_type, monthly_volume }) {
  return `${EMOJI.contractor} <b>New Contractor Registration</b>\n👤 ${contact_name}\n🏢 ${company_name || 'N/A'}\n📧 ${email}\n📞 ${phone || 'N/A'}\n🔨 ${trade_type || 'N/A'} · ${monthly_volume || 'N/A'}/mo`;
}

export function formatAbandonedCartAlert({ customerName, customerEmail, cartValue, cartItems }) {
  const items = Array.isArray(cartItems) ? cartItems.map(i => `  • ${i.name}`).join('\n') : '';
  return `${EMOJI.abandoned} <b>Abandoned Cart</b>\n👤 ${customerName}\n📧 ${customerEmail}\n💰 <b>$${Number(cartValue || 0).toFixed(2)}</b>\n${items}`;
}
