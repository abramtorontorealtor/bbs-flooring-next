import { describeItemQty, formatItemQty } from './orderItemQty';
/**
 * Brevo (formerly Sendinblue) email utility for BBS Flooring.
 * Server-side only — uses BREVO_API_KEY env var.
 * Switched from SendGrid on May 7, 2026 (SendGrid credits exhausted).
 *
 * Three email types:
 * 1. Contact form → admin notification + customer confirmation
 * 2. Quote → customer quote breakdown + admin notification
 * 3. Booking → customer confirmation + admin notification
 */

/** Escape HTML special characters to prevent XSS in email templates. */
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const FROM_EMAIL = 'info@bbsflooring.ca';
const FROM_NAME = 'BBS Flooring';

/**
 * Resolve delivery_preference into human-readable labels.
 * Values in DB: 'pickup', 'delivery', 'inside', 'garage', 'custom_freight'
 */
function getDeliveryLabel(pref, { emoji = true } = {}) {
  const map = {
    pickup:         emoji ? '🏪 Warehouse Pickup (FREE)' : 'Warehouse Pickup',
    delivery:       emoji ? '🚚 Delivery' : 'Delivery',
    inside:         emoji ? '🏠 Inside Delivery ($200)' : 'Inside Delivery',
    garage:         emoji ? '🚪 Garage Delivery ($140)' : 'Garage Delivery',
    custom_freight: emoji ? '🚛 Custom Freight Delivery' : 'Custom Freight Delivery',
  };
  return map[pref] || (emoji ? '📦 ' + (pref || 'Unknown') : (pref || 'Unknown'));
}

function isPickupOrder(pref) {
  return pref === 'pickup';
}

function isDeliveryOrder(pref) {
  return pref !== 'pickup';
}
const ADMIN_EMAIL = 'info@bbsflooring.ca';
const PHONE = '(647) 428-1111';

async function sendEmail({ to, subject, html, replyTo }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn('[Email] BREVO_API_KEY not set — skipping email send');
    return { success: false, reason: 'no_api_key' };
  }

  const payload = {
    sender: { email: FROM_EMAIL, name: FROM_NAME },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };

  if (replyTo) {
    payload.replyTo = { email: replyTo };
  }

  try {
    const res = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[Email] Brevo error:', res.status, text);
      return { success: false, status: res.status, error: text };
    }

    return { success: true };
  } catch (err) {
    console.error('[Email] Send failed:', err.message);
    return { success: false, error: err.message };
  }
}

// ── Email wrapper ───────────────────────────────────────────────

function emailWrapper(title, body) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:linear-gradient(135deg,#1e293b,#334155);color:white;padding:24px 32px;border-radius:16px 16px 0 0;">
      <h1 style="margin:0;font-size:24px;font-weight:800;color:#f59e0b;">BBS</h1>
      <p style="margin:4px 0 0;font-size:12px;letter-spacing:2px;color:#94a3b8;">FLOORING</p>
    </div>
    <div style="background:white;padding:32px;border-radius:0 0 16px 16px;border:1px solid #e2e8f0;border-top:none;">
      <h2 style="margin:0 0 16px;font-size:20px;color:#1e293b;">${title}</h2>
      ${body}
    </div>
    <div style="text-align:center;padding:16px;color:#94a3b8;font-size:12px;">
      <p>BBS Flooring · 6061 Highway 7, Unit B · Markham, ON L3P 3B2</p>
      <p>${PHONE} · <a href="https://bbsflooring.ca" style="color:#f59e0b;">bbsflooring.ca</a></p>
    </div>
  </div>
</body>
</html>`;
}

// ── Contact form emails ─────────────────────────────────────────

export async function sendContactAdminNotification({ name, email, phone, message, source, smsConsent }) {
  const html = emailWrapper('New Contact Form Submission', `
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;width:100px;">Name</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#1e293b;">${esc(name)}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Email</td><td style="padding:8px 0;font-size:14px;"><a href="mailto:${esc(email)}" style="color:#f59e0b;">${esc(email)}</a></td></tr>
      ${phone ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Phone</td><td style="padding:8px 0;font-size:14px;"><a href="tel:${esc(phone)}" style="color:#f59e0b;">${esc(phone)}</a></td></tr>` : ''}
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Source</td><td style="padding:8px 0;font-size:14px;color:#64748b;">${esc(source) || 'contact_form'}</td></tr>
      ${smsConsent ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">SMS Opt-in</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#16a34a;">✅ Yes</td></tr>` : ''}
    </table>
    <div style="margin-top:16px;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
      <p style="margin:0;font-size:14px;color:#334155;white-space:pre-wrap;">${esc(message)}</p>
    </div>
    <p style="margin-top:16px;font-size:13px;color:#94a3b8;">Reply directly to this email to respond to the customer.</p>
  `);

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `🏠 New Contact: ${name} — ${source === 'contractor_inquiry' ? 'Contractor' : 'Customer'}`,
    html,
    replyTo: email,
  });
}

export async function sendContactCustomerConfirmation({ name, email }) {
  const html = emailWrapper('Thanks for Reaching Out!', `
    <p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${esc(name)},</p>
    <p style="font-size:15px;color:#334155;line-height:1.6;">We received your message and our team will get back to you <strong>within 2 business hours</strong>.</p>
    <p style="font-size:15px;color:#334155;line-height:1.6;">Need an answer sooner? Give us a call:</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="tel:+16474281111" style="display:inline-block;background:#f59e0b;color:#1e293b;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:16px;">📞 Call ${PHONE}</a>
    </div>
    <p style="font-size:14px;color:#64748b;">Or visit our showroom at 6061 Highway 7, Unit B, Markham. Mon–Sat 10am–5pm.</p>
  `);

  return sendEmail({
    to: email,
    subject: 'BBS Flooring — We Got Your Message ✓',
    html,
  });
}

// ── Contractor registration emails ──────────────────────────────

export async function sendContractorCustomerConfirmation({ name, email, company_name }) {
  const html = emailWrapper('Contractor Application Received!', `
    <p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${esc(name)},</p>
    <p style="font-size:15px;color:#334155;line-height:1.6;">Thanks for applying to the BBS Flooring Contractor & Trade Program${company_name ? ` on behalf of <strong>${esc(company_name)}</strong>` : ''}!</p>
    <p style="font-size:15px;color:#334155;line-height:1.6;">Our team will review your application and <strong>get back to you within 1 business day</strong> with your contractor account details and pricing access.</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:16px 0;">
      <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#1e293b;">What You'll Get:</p>
      <ul style="margin:0;padding-left:20px;font-size:14px;color:#334155;line-height:2;">
        <li>Member trade pricing on 1,000+ products</li>
        <li>Bulk order discounts</li>
        <li>Priority scheduling &amp; same-day pickup</li>
        <li>Dedicated account rep</li>
        <li>GTA-wide delivery</li>
      </ul>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://bbsflooring.ca/products" style="display:inline-block;background:#f59e0b;color:#1e293b;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:16px;">Browse Our Catalog →</a>
    </div>
    <p style="font-size:14px;color:#64748b;">Need something sooner? Call us directly at <a href="tel:+16474281111" style="color:#f59e0b;">${PHONE}</a>.</p>
  `);

  return sendEmail({
    to: email,
    subject: 'BBS Flooring — Contractor Application Received ✓',
    html,
  });
}

// ── Removal estimator emails ────────────────────────────────────

export async function sendRemovalEstimateCustomerConfirmation({ name, email, removalType, sqft, haulAway, total }) {
  const html = emailWrapper(`Your ${esc(removalType)} Estimate`, `
    <p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${esc(name)},</p>
    <p style="font-size:15px;color:#334155;line-height:1.6;">Thanks for getting an estimate! Here's a summary of your ${esc(removalType.toLowerCase())} project:</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:16px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">🏠 Service</td><td style="padding:6px 0;font-weight:600;font-size:14px;">${esc(removalType)}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">📐 Area</td><td style="padding:6px 0;font-weight:600;font-size:14px;">${sqft} sq ft</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">🚛 Haul-Away</td><td style="padding:6px 0;font-weight:600;font-size:14px;">${haulAway ? 'Yes (included)' : 'No'}</td></tr>
      </table>
    </div>
    <div style="background:#1e293b;border-radius:12px;padding:20px;margin:16px 0;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;color:#94a3b8;">ESTIMATED TOTAL</p>
      <p style="margin:0;font-size:28px;font-weight:800;color:#f59e0b;">$${total} CAD</p>
    </div>
    <p style="font-size:14px;color:#334155;line-height:1.6;">A flooring specialist will contact you <strong>within 1 business hour</strong> to confirm your removal date and go over the details.</p>
    <div style="background:#ecfdf5;border:1px solid #6ee7b7;border-radius:12px;padding:16px 20px;margin:16px 0;">
      <p style="margin:0;font-size:14px;color:#065f46;">🎁 <strong>Your $100 Floor Replacement Credit has been reserved.</strong> Apply it toward any new flooring installation.</p>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://bbsflooring.ca/free-measurement" style="display:inline-block;background:#f59e0b;color:#1e293b;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:16px;">Book Free Measurement →</a>
    </div>
    <p style="font-size:14px;color:#64748b;">Questions? Call us at <a href="tel:+16474281111" style="color:#f59e0b;">${PHONE}</a>.</p>
  `);

  return sendEmail({
    to: email,
    subject: `BBS Flooring — Your ${removalType} Estimate ($${total})`,
    html,
  });
}

export async function sendRemovalEstimateAdminNotification({ name, email, phone, removalType, sqft, haulAway, total, source }) {
  const html = emailWrapper(`New ${esc(removalType)} Estimate`, `
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;width:100px;">Name</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#1e293b;">${esc(name)}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Email</td><td style="padding:8px 0;font-size:14px;"><a href="mailto:${esc(email)}" style="color:#f59e0b;">${esc(email)}</a></td></tr>
      ${phone ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Phone</td><td style="padding:8px 0;font-size:14px;"><a href="tel:${esc(phone)}" style="color:#f59e0b;">${esc(phone)}</a></td></tr>` : ''}
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Source</td><td style="padding:8px 0;font-size:14px;color:#64748b;">${esc(source)}</td></tr>
    </table>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:16px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">Service</td><td style="padding:6px 0;font-weight:600;font-size:14px;">${esc(removalType)}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">Area</td><td style="padding:6px 0;font-weight:600;font-size:14px;">${sqft} sq ft</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">Haul-Away</td><td style="padding:6px 0;font-weight:600;font-size:14px;">${haulAway ? 'Yes' : 'No'}</td></tr>
        <tr style="border-top:2px solid #1e293b;"><td style="padding:10px 0;font-size:16px;font-weight:700;color:#1e293b;">Estimate</td><td style="padding:10px 0;font-size:20px;font-weight:800;color:#f59e0b;">$${total} CAD</td></tr>
      </table>
    </div>
    <p style="margin-top:12px;font-size:13px;color:#94a3b8;">Reply directly to this email to respond to the customer.</p>
  `);

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `🗑️ ${removalType} Estimate: $${total} — ${esc(name)}`,
    html,
    replyTo: email,
  });
}

// ── Quote emails ────────────────────────────────────────────────

// Stair pricing — keep in sync with components/StairCalculatorWidget.jsx (P constants)
const STAIR_P = {
  tread_refinish: 125, tread_straight: 185, tread_pie: 225, post: 150, picket: 25,
  stringer_white: 350, stringer_stained: 900, nosing_refinish: 20, nosing_new: 25,
  railing_refinish: 25, railing_new: 50, landing_small: 300, landing_large: 600,
};

// Rebuild the itemized stair quote (with amounts) from the stored stair_* fields,
// so the customer's emailed quote carries the full breakdown (on-screen shows total only).
function buildStairCustomerBreakdown(quote) {
  const rows = [];
  const straight = quote.stair_tread_count || 0;
  const pie = quote.stair_pie_count || 0;
  const refinish = !!quote.stair_refinish;
  if (straight > 0) {
    if (refinish) rows.push({ label: `Refinish treads (${straight})`, amount: straight * STAIR_P.tread_refinish });
    else rows.push({ label: `New straight treads (${straight})`, amount: straight * STAIR_P.tread_straight });
  }
  if (!refinish && pie > 0) rows.push({ label: `Pie/triangle treads (${pie})`, amount: pie * STAIR_P.tread_pie });
  if (quote.stair_posts > 0) rows.push({ label: `New posts 3\u00bc\u2033 (${quote.stair_posts})`, amount: quote.stair_posts * STAIR_P.post });
  if (quote.stair_pickets > 0) rows.push({ label: `Pickets (${quote.stair_pickets})`, amount: quote.stair_pickets * STAIR_P.picket });
  const stringers = quote.stair_stringers;
  if (stringers?.count > 0) {
    const st = stringers.type === 'stained' ? 'stained' : 'white';
    rows.push({ label: `Stringers ${st} (${stringers.count} side${stringers.count > 1 ? 's' : ''})`, amount: stringers.count * (stringers.type === 'stained' ? STAIR_P.stringer_stained : STAIR_P.stringer_white) });
  }
  const nosing = quote.stair_nosing;
  if (nosing?.lf > 0) {
    const nt = nosing.type === 'refinish' ? 'sand & restain' : 'new';
    rows.push({ label: `Nosing ${nt} (${nosing.lf} lf)`, amount: nosing.lf * (nosing.type === 'refinish' ? STAIR_P.nosing_refinish : STAIR_P.nosing_new) });
  }
  const railing = quote.stair_railing;
  if (railing?.lf > 0) {
    const rt = railing.type === 'refinish' ? 'sand & restain' : 'new';
    rows.push({ label: `Handrail ${rt} (${railing.lf} lf)`, amount: railing.lf * (railing.type === 'refinish' ? STAIR_P.railing_refinish : STAIR_P.railing_new) });
  }
  if (quote.stair_landing) {
    const ls = quote.stair_landing.size === 'large' ? 'large (6\u00d73 ft)' : 'small (3\u00d73 ft)';
    rows.push({ label: `Landing ${ls}`, amount: quote.stair_landing.size === 'large' ? STAIR_P.landing_large : STAIR_P.landing_small });
  }
  return rows;
}

export async function sendQuoteToCustomer({ quote, isMember }) {
  if (!quote?.customer_email) return { success: false, reason: 'no_email' };

  const sqft = quote.square_footage || 0;
  const priceSqft = quote.price_per_sqft ? Number(quote.price_per_sqft).toFixed(2) : null;

  // Build detailed cost breakdown rows
  const breakdownRows = [];
  if (quote.flooring_cost > 0) {
    breakdownRows.push({
      label: `${esc(quote.product_name) || 'Flooring Material'}`,
      detail: `${sqft} sqft${priceSqft ? ` × $${priceSqft}/sqft` : ''}`,
      amount: quote.flooring_cost,
    });
  }
  if (quote.installation_cost > 0) {
    const installRate = sqft > 0 ? (quote.installation_cost / sqft).toFixed(2) : null;
    breakdownRows.push({
      label: 'Professional Installation',
      detail: installRate ? `${sqft} sqft × $${installRate}/sqft` : '',
      amount: quote.installation_cost,
    });
  }
  if (quote.removal_cost > 0) {
    const removalRate = sqft > 0 ? (quote.removal_cost / sqft).toFixed(2) : null;
    const removalLabel = quote.removal_type && quote.removal_type !== 'none'
      ? `${quote.removal_type.charAt(0).toUpperCase() + quote.removal_type.slice(1)} Removal`
      : 'Old Floor Removal';
    breakdownRows.push({
      label: removalLabel,
      detail: removalRate ? `${sqft} sqft × $${removalRate}/sqft` : '',
      amount: quote.removal_cost,
    });
  }
  if (quote.baseboard_cost > 0) {
    breakdownRows.push({
      label: 'Baseboards (material + install)',
      detail: 'Estimated linear footage based on room layout',
      amount: quote.baseboard_cost,
    });
  }
  if (quote.shoe_moulding_cost > 0) {
    breakdownRows.push({
      label: 'Shoe Moulding (material + install)',
      detail: '',
      amount: quote.shoe_moulding_cost,
    });
  }
  if (quote.delivery_cost > 0) {
    breakdownRows.push({
      label: 'Delivery (in-home, 48h before install)',
      detail: '',
      amount: quote.delivery_cost,
    });
  }

  // Stair quotes carry no flooring_cost — rebuild the itemized stair lines here.
  const isStairQuote = !!(quote.stair_tread_count || quote.stair_pie_count || quote.stair_posts ||
    quote.stair_pickets || quote.stair_stringers || quote.stair_nosing || quote.stair_railing || quote.stair_landing);
  if (isStairQuote) {
    buildStairCustomerBreakdown(quote).forEach(r => breakdownRows.push({ label: r.label, detail: '', amount: r.amount }));
  }

  const rowsHtml = breakdownRows.map(r => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#334155;">
        <div>${r.label}</div>
        ${r.detail ? `<div style="font-size:12px;color:#94a3b8;margin-top:2px;">${r.detail}</div>` : ''}
      </td>
      <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-size:14px;text-align:right;font-weight:600;white-space:nowrap;vertical-align:top;">$${(r.amount || 0).toFixed(2)}</td>
    </tr>
  `).join('');

  // Project summary block
  const projectSummary = `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:16px 0;">
      <table style="width:100%;border-collapse:collapse;">
        ${quote.product_name ? `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;">🏠 Product</td><td style="padding:6px 0;font-weight:600;font-size:14px;">${esc(quote.product_name)}</td></tr>` : ''}
        ${sqft ? `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;">📐 Area</td><td style="padding:6px 0;font-weight:600;font-size:14px;">${sqft} sq ft</td></tr>` : ''}
        ${priceSqft ? `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;">💰 Price/sqft</td><td style="padding:6px 0;font-weight:600;font-size:14px;">$${priceSqft}/sqft${isMember ? ' <span style="color:#059669;">(Member)</span>' : ''}</td></tr>` : ''}
        ${quote.removal_type && quote.removal_type !== 'none' ? `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;">🗑️ Removal</td><td style="padding:6px 0;font-weight:600;font-size:14px;">${quote.removal_type.charAt(0).toUpperCase() + quote.removal_type.slice(1)}</td></tr>` : ''}
        ${quote.needs_baseboards ? `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;">📏 Baseboards</td><td style="padding:6px 0;font-weight:600;font-size:14px;">Yes — 5″ standard</td></tr>` : `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;">📏 Baseboards</td><td style="padding:6px 0;font-size:14px;color:#94a3b8;">No</td></tr>`}
        ${quote.needs_shoe_moulding ? `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;">📏 Shoe Moulding</td><td style="padding:6px 0;font-weight:600;font-size:14px;">Yes</td></tr>` : `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;">📏 Shoe Moulding</td><td style="padding:6px 0;font-size:14px;color:#94a3b8;">No</td></tr>`}
      </table>
    </div>`;

  const stairSpeciesLabel = quote.stair_species && quote.stair_species !== 'red_oak'
    ? quote.stair_species.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'Red Oak (Standard)';
  const stairSummary = `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:16px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">🪜 Project</td><td style="padding:6px 0;font-weight:600;font-size:14px;">Staircase Renovation</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">🪵 Wood Species</td><td style="padding:6px 0;font-weight:600;font-size:14px;">${esc(stairSpeciesLabel)}</td></tr>
      </table>
    </div>`;

  const html = emailWrapper('Your Flooring Quote', `
    <p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${esc(quote.customer_name) || 'there'},</p>
    <p style="font-size:15px;color:#334155;line-height:1.6;">Here's the detailed quote you requested:</p>
    ${isStairQuote ? stairSummary : projectSummary}
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <thead>
        <tr style="background:#f8fafc;">
          <th style="padding:10px 8px;text-align:left;font-size:13px;color:#64748b;border-bottom:2px solid #e2e8f0;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Description</th>
          <th style="padding:10px 8px;text-align:right;font-size:13px;color:#64748b;border-bottom:2px solid #e2e8f0;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Amount</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    <table style="width:100%;border-collapse:collapse;margin:0 0 16px;">
      <tr><td style="padding:6px 8px;font-size:14px;color:#64748b;">Subtotal</td><td style="padding:6px 8px;font-size:14px;text-align:right;color:#334155;">$${(quote.subtotal || 0).toFixed(2)}</td></tr>
      <tr><td style="padding:6px 8px;font-size:14px;color:#64748b;">HST (13%)</td><td style="padding:6px 8px;font-size:14px;text-align:right;color:#334155;">$${(quote.tax || 0).toFixed(2)}</td></tr>
      <tr style="border-top:2px solid #1e293b;">
        <td style="padding:14px 8px;font-size:16px;font-weight:700;color:#1e293b;">Estimated Total</td>
        <td style="padding:14px 8px;text-align:right;font-size:22px;font-weight:800;color:#f59e0b;">$${(quote.total || 0).toFixed(2)}</td>
      </tr>
    </table>
    <p style="font-size:13px;color:#94a3b8;">This is an estimate. Final pricing confirmed after free in-home measurement.</p>
    <div style="background:#ecfdf5;border:1px solid #6ee7b7;border-radius:12px;padding:16px 20px;margin:16px 0;">
      <p style="margin:0;font-size:14px;color:#065f46;">✅ <strong>We beat any written quote from a competitor by 5%.</strong> Bring us a competing quote and we'll match it — guaranteed.</p>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://bbsflooring.ca/free-measurement" style="display:inline-block;background:#f59e0b;color:#1e293b;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:16px;">Book Free Measurement →</a>
    </div>
    ${quote.resume_token ? `
    <div style="text-align:center;margin:16px 0 24px;">
      <a href="https://bbsflooring.ca/quote-calculator?resume=${quote.resume_token}" style="display:inline-block;background:#f1f5f9;color:#475569;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;font-size:14px;border:1px solid #e2e8f0;">📋 View & Edit Your Quote</a>
    </div>
    <p style="font-size:12px;color:#94a3b8;text-align:center;">Bookmark this link to return to your quote anytime.</p>
    ` : ''}
    ${!isMember ? `
    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:16px 20px;margin:16px 0;text-align:center;">
      <p style="margin:0 0 8px;font-size:14px;color:#166534;font-weight:600;">💡 Want to keep this quote handy?</p>
      <p style="margin:0 0 12px;font-size:13px;color:#15803d;">Create a free BBS account to save your quotes and track your orders in one place.</p>
      <a href="https://bbsflooring.ca/verify-email" style="display:inline-block;background:#166534;color:#ffffff;font-weight:600;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:14px;">Create Free Account</a>
    </div>
    ` : ''}
  `);

  return sendEmail({
    to: quote.customer_email,
    subject: `Your BBS Flooring Quote — $${(quote.total || 0).toFixed(2)}`,
    html,
  });
}

export async function sendQuoteAdminNotification({ quote, isMember }) {
  const sqft = quote.square_footage || 0;
  const priceSqft = quote.price_per_sqft ? Number(quote.price_per_sqft).toFixed(2) : null;

  // Build stair details section
  const hasStairs = quote.stair_tread_count > 0 || quote.stair_pie_count > 0;
  const stairRows = [];
  if (hasStairs) {
    if (quote.stair_tread_count > 0) stairRows.push({ label: `Treads (${quote.stair_tread_count})`, detail: quote.stair_refinish ? 'refinish @ $125/step' : 'new @ $185/step' });
    if (quote.stair_pie_count > 0) stairRows.push({ label: `Pie treads (${quote.stair_pie_count})`, detail: 'new @ $225/step' });
    if (quote.stair_posts > 0) stairRows.push({ label: `Posts (${quote.stair_posts})`, detail: '$150/post' });
    if (quote.stair_pickets > 0) stairRows.push({ label: `Pickets (${quote.stair_pickets})`, detail: '$25/piece' });
    if (quote.stair_stringers?.count > 0) stairRows.push({ label: `Stringers (${quote.stair_stringers.count} side${quote.stair_stringers.count > 1 ? 's' : ''})`, detail: quote.stair_stringers.type });
    if (quote.stair_nosing?.lf > 0) stairRows.push({ label: `Nosing (${quote.stair_nosing.lf} lf)`, detail: quote.stair_nosing.type });
    if (quote.stair_railing?.lf > 0) stairRows.push({ label: `Railing (${quote.stair_railing.lf} lf)`, detail: quote.stair_railing.type });
    if (quote.stair_landing) stairRows.push({ label: `Landing`, detail: quote.stair_landing.size });
    if (quote.stair_species && quote.stair_species !== 'red_oak') stairRows.push({ label: 'Species', detail: quote.stair_species.replace('_', ' ') });
  }
  const stairHtml = hasStairs ? `
    <tr><td colspan="2" style="padding:10px 8px 4px;font-size:13px;font-weight:700;color:#92400e;background:#fffbeb;border-top:2px solid #f59e0b;">🪜 Stair Configuration</td></tr>
    ${stairRows.map(r => `<tr><td style="padding:4px 8px;font-size:12px;color:#64748b;background:#fffbeb;">${r.label}</td><td style="padding:4px 8px;font-size:12px;font-weight:600;background:#fffbeb;">${r.detail}</td></tr>`).join('')}
  ` : '';

  // Build line items for admin
  const lineItems = [];
  if (quote.flooring_cost > 0) lineItems.push({ label: 'Material', detail: `${sqft} sqft${priceSqft ? ` × $${priceSqft}` : ''}`, amount: quote.flooring_cost });
  if (quote.installation_cost > 0) lineItems.push({ label: 'Installation', detail: sqft > 0 ? `$${(quote.installation_cost / sqft).toFixed(2)}/sqft` : '', amount: quote.installation_cost });
  if (quote.removal_cost > 0) lineItems.push({ label: `Removal (${esc(quote.removal_type) || 'standard'})`, detail: '', amount: quote.removal_cost });
  if (quote.baseboard_cost > 0) lineItems.push({ label: 'Baseboards', detail: '', amount: quote.baseboard_cost });
  if (quote.shoe_moulding_cost > 0) lineItems.push({ label: 'Shoe Moulding', detail: '', amount: quote.shoe_moulding_cost });
  if (quote.delivery_cost > 0) lineItems.push({ label: 'Delivery', detail: '', amount: quote.delivery_cost });

  const lineItemsHtml = lineItems.map(r => `
    <tr>
      <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#334155;">${r.label}${r.detail ? ` <span style="color:#94a3b8;">(${r.detail})</span>` : ''}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;font-size:13px;text-align:right;font-weight:600;">$${(r.amount || 0).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = emailWrapper('New Quote Generated', `
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Customer</td><td style="padding:8px 0;font-weight:600;">${esc(quote.customer_name) || '—'}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Email</td><td style="padding:8px 0;"><a href="mailto:${esc(quote.customer_email)}" style="color:#f59e0b;">${esc(quote.customer_email)}</a></td></tr>
      ${quote.customer_phone ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Phone</td><td style="padding:8px 0;"><a href="tel:${esc(quote.customer_phone)}" style="color:#f59e0b;">${esc(quote.customer_phone)}</a></td></tr>` : ''}
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Member</td><td style="padding:8px 0;">${isMember ? '✅ Yes' : '❌ No'}</td></tr>
    </table>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:12px 0;">
      <table style="width:100%;border-collapse:collapse;">
        ${quote.product_name ? `<tr><td style="padding:4px 0;color:#64748b;font-size:13px;">Product</td><td style="padding:4px 0;font-weight:600;font-size:13px;">${esc(quote.product_name)}</td></tr>` : ''}
        ${sqft ? `<tr><td style="padding:4px 0;color:#64748b;font-size:13px;">Area</td><td style="padding:4px 0;font-weight:600;font-size:13px;">${sqft} sqft${priceSqft ? ` @ $${priceSqft}/sqft` : ''}</td></tr>` : ''}
        ${quote.removal_type && quote.removal_type !== 'none' ? `<tr><td style="padding:4px 0;color:#64748b;font-size:13px;">Removal</td><td style="padding:4px 0;font-weight:600;font-size:13px;">${esc(quote.removal_type.charAt(0).toUpperCase() + quote.removal_type.slice(1))}</td></tr>` : ''}
        ${quote.needs_baseboards ? `<tr><td style="padding:4px 0;color:#64748b;font-size:13px;">Baseboards</td><td style="padding:4px 0;font-weight:600;font-size:13px;">Yes</td></tr>` : `<tr><td style="padding:4px 0;color:#64748b;font-size:13px;">Baseboards</td><td style="padding:4px 0;font-size:13px;color:#94a3b8;">No</td></tr>`}
        ${quote.needs_shoe_moulding ? `<tr><td style="padding:4px 0;color:#64748b;font-size:13px;">Shoe Moulding</td><td style="padding:4px 0;font-weight:600;font-size:13px;">Yes</td></tr>` : `<tr><td style="padding:4px 0;color:#64748b;font-size:13px;">Shoe Moulding</td><td style="padding:4px 0;font-size:13px;color:#94a3b8;">No</td></tr>`}
        ${stairHtml}
      </table>
    </div>
    <table style="width:100%;border-collapse:collapse;margin:12px 0;">
      <thead><tr style="background:#f8fafc;"><th style="padding:6px 8px;text-align:left;font-size:12px;color:#64748b;border-bottom:2px solid #e2e8f0;">Item</th><th style="padding:6px 8px;text-align:right;font-size:12px;color:#64748b;border-bottom:2px solid #e2e8f0;">Amount</th></tr></thead>
      <tbody>${lineItemsHtml}</tbody>
    </table>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:4px 8px;font-size:13px;color:#64748b;">Subtotal</td><td style="padding:4px 8px;font-size:13px;text-align:right;">$${(quote.subtotal || 0).toFixed(2)}</td></tr>
      <tr><td style="padding:4px 8px;font-size:13px;color:#64748b;">HST (13%)</td><td style="padding:4px 8px;font-size:13px;text-align:right;">$${(quote.tax || 0).toFixed(2)}</td></tr>
      <tr style="border-top:2px solid #1e293b;">
        <td style="padding:10px 8px;font-size:16px;font-weight:700;color:#1e293b;">Total</td>
        <td style="padding:10px 8px;text-align:right;font-size:20px;font-weight:800;color:#f59e0b;">$${(quote.total || 0).toFixed(2)}</td>
      </tr>
    </table>
    <div style="text-align:center;margin:24px 0;">
      <a href="${SITE_URL}/admin/quotes" style="display:inline-block;background:#1e40af;color:#ffffff;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:16px;">View in Admin →</a>
    </div>
    <p style="margin-top:12px;font-size:13px;color:#94a3b8;">Reply to this email to contact the customer.</p>
  `);

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `💰 New Quote: $${(quote.total || 0).toFixed(2)} — ${esc(quote.product_name) || 'Unknown Product'} — ${quote.customer_name || 'Unknown'}`,
    html,
    replyTo: quote.customer_email,
  });
}

// ── Booking emails ──────────────────────────────────────────────

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bbsflooring.ca';

function bookingDetailsBlock(booking) {
  const date = booking.preferred_date ? new Date(booking.preferred_date + 'T12:00:00').toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD';
  const address = [booking.customer_address || booking.address, booking.postal_code].filter(Boolean).join(', ');
  const project = booking.flooring_type || booking.project_type;
  const serviceLabel = booking.service_type ? booking.service_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : null;
  return `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:16px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">📅 Date</td><td style="padding:6px 0;font-weight:600;font-size:14px;">${date}</td></tr>
        ${booking.preferred_time ? `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;">🕐 Time</td><td style="padding:6px 0;font-weight:600;font-size:14px;">${esc(booking.preferred_time)}</td></tr>` : ''}
        ${address ? `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;">📍 Address</td><td style="padding:6px 0;font-weight:600;font-size:14px;">${esc(address)}</td></tr>` : ''}
        ${project ? `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;">🏠 Flooring</td><td style="padding:6px 0;font-weight:600;font-size:14px;">${esc(project)}</td></tr>` : ''}
        ${serviceLabel ? `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;">🔧 Service</td><td style="padding:6px 0;font-weight:600;font-size:14px;">${esc(serviceLabel)}</td></tr>` : ''}
        ${booking.square_footage ? `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;">📐 Area</td><td style="padding:6px 0;font-weight:600;font-size:14px;">${booking.square_footage} sqft</td></tr>` : ''}
        ${booking.product_name ? `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;">📦 Product</td><td style="padding:6px 0;font-weight:600;font-size:14px;">${esc(booking.product_name)}</td></tr>` : ''}
        ${booking.notes ? `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;">📝 Notes</td><td style="padding:6px 0;font-size:14px;">${esc(booking.notes)}</td></tr>` : ''}
      </table>
    </div>`;
}

function bookingManageLink(booking) {
  if (!booking.lookup_token) return '';
  const url = `${SITE_URL}/view-booking?token=${booking.lookup_token}`;
  return `
    <div style="text-align:center;margin:24px 0;">
      <a href="${url}" style="display:inline-block;background:#f59e0b;color:#1e293b;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:16px;">Manage Your Booking</a>
    </div>
    <p style="font-size:13px;color:#94a3b8;text-align:center;">You can reschedule or cancel your appointment using this link.</p>`;
}

/** Sent immediately when customer submits the form. Booking is PENDING. */
export async function sendBookingRequestReceived({ booking }) {
  if (!booking?.customer_email) return { success: false, reason: 'no_email' };

  const html = emailWrapper('We Received Your Booking Request!', `
    <p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${esc(booking.customer_name) || 'there'},</p>
    <p style="font-size:15px;color:#334155;line-height:1.6;">Thanks for requesting a free in-home measurement! We've received your booking and <strong>will confirm it within a few hours</strong>.</p>
    ${bookingDetailsBlock(booking)}
    <p style="font-size:14px;color:#334155;line-height:1.6;"><strong>What happens next:</strong></p>
    <ol style="font-size:14px;color:#334155;line-height:2;padding-left:20px;">
      <li>Our team reviews your request and confirms the appointment</li>
      <li>You'll receive a <strong>confirmation email</strong> with the finalized details</li>
      <li>Our flooring expert visits your home — free, no obligation</li>
    </ol>
    ${bookingManageLink(booking)}
    <p style="font-size:14px;color:#64748b;">Have questions? Call us at <a href="tel:+16474281111" style="color:#f59e0b;">${PHONE}</a>.</p>
  `);

  return sendEmail({
    to: booking.customer_email,
    subject: '📋 Booking Request Received — BBS Flooring',
    html,
  });
}

/** Sent when admin CONFIRMS the booking. */
export async function sendBookingCustomerConfirmation({ booking }) {
  if (!booking?.customer_email) return { success: false, reason: 'no_email' };

  const date = booking.preferred_date ? new Date(booking.preferred_date + 'T12:00:00').toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD';

  const html = emailWrapper('Your Measurement Is Confirmed! ✅', `
    <p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${esc(booking.customer_name) || 'there'},</p>
    <p style="font-size:15px;color:#334155;line-height:1.6;">Great news — your free in-home measurement has been <strong>confirmed</strong>. We'll see you soon!</p>
    ${bookingDetailsBlock(booking)}
    <p style="font-size:14px;color:#334155;line-height:1.6;"><strong>What to expect:</strong> Our flooring expert will measure your space, discuss options, and provide a detailed quote — all free, no obligation.</p>
    <div style="background:#ecfdf5;border:1px solid #6ee7b7;border-radius:12px;padding:16px 20px;margin:16px 0;">
      <p style="margin:0;font-size:14px;color:#065f46;"><strong>💡 Tip:</strong> Have your rooms cleared of loose items if possible — it helps us measure faster and more accurately.</p>
    </div>
    ${bookingManageLink(booking)}
    <p style="font-size:14px;color:#64748b;">Need to reschedule? Use the link above or call us at <a href="tel:+16474281111" style="color:#f59e0b;">${PHONE}</a>.</p>
  `);

  return sendEmail({
    to: booking.customer_email,
    subject: `✅ Measurement Confirmed — ${date}`,
    html,
  });
}

/** Sent when booking is rescheduled (by admin or customer). */
export async function sendBookingRescheduled({ booking, oldDate, oldTime }) {
  if (!booking?.customer_email) return { success: false, reason: 'no_email' };

  const newDate = booking.preferred_date ? new Date(booking.preferred_date + 'T12:00:00').toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD';
  const prevDate = oldDate ? new Date(oldDate + 'T12:00:00').toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

  const html = emailWrapper('Your Measurement Has Been Rescheduled', `
    <p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${esc(booking.customer_name) || 'there'},</p>
    <p style="font-size:15px;color:#334155;line-height:1.6;">Your measurement appointment has been rescheduled. Here are the updated details:</p>
    ${bookingDetailsBlock(booking)}
    <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:12px 16px;margin:16px 0;">
      <p style="margin:0;font-size:13px;color:#92400e;">Previous appointment: ${prevDate}${oldTime ? ` at ${esc(oldTime)}` : ''}</p>
    </div>
    ${bookingManageLink(booking)}
    <p style="font-size:14px;color:#64748b;">Questions? Call us at <a href="tel:+16474281111" style="color:#f59e0b;">${PHONE}</a>.</p>
  `);

  return sendEmail({
    to: booking.customer_email,
    subject: `📅 Measurement Rescheduled — ${newDate}`,
    html,
  });
}

/** Sent when booking is cancelled (by admin or customer). */
export async function sendBookingCancelled({ booking, reason, cancelledByCustomer = false }) {
  if (!booking?.customer_email) return { success: false, reason: 'no_email' };

  const html = emailWrapper('Measurement Appointment Cancelled', `
    <p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${esc(booking.customer_name) || 'there'},</p>
    <p style="font-size:15px;color:#334155;line-height:1.6;">${cancelledByCustomer
      ? 'Your measurement appointment has been cancelled as requested.'
      : 'Unfortunately, your measurement appointment has been cancelled.'}</p>
    ${reason ? `<p style="font-size:14px;color:#64748b;">Reason: ${esc(reason)}</p>` : ''}
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:16px 0;">
      <p style="margin:0;font-size:14px;color:#334155;">If you'd like to rebook, we're here to help — it only takes 30 seconds:</p>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="${SITE_URL}/free-measurement" style="display:inline-block;background:#f59e0b;color:#1e293b;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:16px;">Book a New Appointment</a>
    </div>
    <p style="font-size:14px;color:#64748b;">Or call us at <a href="tel:+16474281111" style="color:#f59e0b;">${PHONE}</a> — we're happy to help.</p>
  `);

  return sendEmail({
    to: booking.customer_email,
    subject: 'Measurement Appointment Cancelled — BBS Flooring',
    html,
  });
}

/** Admin notification — new booking request, reschedule, or cancellation. */
export async function sendBookingAdminNotification({ booking, isReschedule = false, isCancellation = false }) {
  const date = booking.preferred_date ? new Date(booking.preferred_date + 'T12:00:00').toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD';
  const address = booking.customer_address || booking.address;
  const project = booking.flooring_type || booking.project_type;

  const titlePrefix = isCancellation ? '❌ Booking Cancelled' : isReschedule ? '🔄 Booking Rescheduled' : '📐 New Booking Request';
  const statusBanner = isCancellation
    ? `<div style="background:#fef2f2;border:2px solid #fca5a5;border-radius:8px;padding:12px 16px;margin:0 0 16px;">
        <p style="margin:0;color:#991b1b;font-size:14px;font-weight:700;">CUSTOMER CANCELLED — No action needed.</p>
      </div>`
    : isReschedule
    ? `<div style="background:#fef3c7;border:2px solid #fcd34d;border-radius:8px;padding:12px 16px;margin:0 0 16px;">
        <p style="margin:0;color:#92400e;font-size:14px;font-weight:700;">CUSTOMER RESCHEDULED — Please review and confirm in CRM.</p>
      </div>`
    : `<div style="background:#eff6ff;border:2px solid #93c5fd;border-radius:8px;padding:12px 16px;margin:0 0 16px;">
        <p style="margin:0;color:#1e40af;font-size:14px;font-weight:700;">⏳ PENDING CONFIRMATION — Review and confirm in CRM.</p>
      </div>`;

  const html = emailWrapper(titlePrefix, `
    ${statusBanner}
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Customer</td><td style="padding:8px 0;font-weight:600;">${esc(booking.customer_name) || '—'}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Email</td><td style="padding:8px 0;"><a href="mailto:${esc(booking.customer_email)}" style="color:#f59e0b;">${esc(booking.customer_email)}</a></td></tr>
      ${booking.customer_phone ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Phone</td><td style="padding:8px 0;"><a href="tel:${esc(booking.customer_phone)}" style="color:#f59e0b;">${esc(booking.customer_phone)}</a></td></tr>` : ''}
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Date</td><td style="padding:8px 0;font-weight:600;">${date}</td></tr>
      ${booking.preferred_time ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Time</td><td style="padding:8px 0;">${booking.preferred_time}</td></tr>` : ''}
      ${address ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Address</td><td style="padding:8px 0;">${esc(address)}</td></tr>` : ''}
      ${project ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Project</td><td style="padding:8px 0;">${esc(project)}</td></tr>` : ''}
      ${booking.postal_code ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Postal</td><td style="padding:8px 0;">${esc(booking.postal_code)}</td></tr>` : ''}
      ${booking.notes ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Notes</td><td style="padding:8px 0;">${esc(booking.notes)}</td></tr>` : ''}
    </table>
    <div style="text-align:center;margin:24px 0;">
      <a href="${SITE_URL}/admin/crm" style="display:inline-block;background:#1e40af;color:#ffffff;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:16px;">Open CRM →</a>
    </div>
    <p style="margin-top:12px;font-size:13px;color:#94a3b8;">Reply to this email to contact the customer.</p>
  `);

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `${titlePrefix}: ${esc(booking.customer_name) || 'Unknown'} — ${date}`,
    html,
    replyTo: booking.customer_email,
  });
}

// ── Order emails ────────────────────────────────────────────────

/** Shared 4-column items table matching old site format: Product, Qty, Unit Price, Total */
function buildOrderItemsTable(items) {
  const rows = (items || []).map(item => `
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:10px 8px;font-size:14px;color:#1e293b;">
        <div style="font-weight:600;">${esc(item.product_name) || 'Product'}</div>
        ${item.sku ? `<div style="color:#94a3b8;font-size:12px;">SKU: ${esc(item.sku)}</div>` : ''}
      </td>
      <td style="padding:10px 8px;text-align:center;font-size:14px;color:#334155;">
        ${describeItemQty(item).qty || '—'} ${describeItemQty(item).unit}
        <br/><span style="color:#94a3b8;font-size:12px;">${describeItemQty(item).sqft ? describeItemQty(item).sqft.toFixed(1) + ' sq.ft' : ''}</span>
      </td>
      <td style="padding:10px 8px;text-align:center;font-size:14px;color:#334155;">${(() => { const u = describeItemQty(item).unitPrice; return u ? `$${u.amount.toFixed(2)}/${u.per}` : '—'; })()}</td>
      <td style="padding:10px 8px;text-align:right;font-size:14px;font-weight:600;color:#1e293b;">$${(item.line_total || 0).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <thead>
        <tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0;">
          <th style="padding:8px;text-align:left;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Product</th>
          <th style="padding:8px;text-align:center;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Qty</th>
          <th style="padding:8px;text-align:center;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Unit Price</th>
          <th style="padding:8px;text-align:right;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

/** Shared totals block */
function buildOrderTotals(order) {
  return `
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:6px 0;font-size:14px;color:#64748b;">Subtotal</td><td style="padding:6px 0;font-size:14px;text-align:right;color:#334155;">$${(order.subtotal || 0).toFixed(2)}</td></tr>
      <tr><td style="padding:6px 0;font-size:14px;color:#64748b;">Tax (HST)</td><td style="padding:6px 0;font-size:14px;text-align:right;color:#334155;">$${(order.tax || 0).toFixed(2)}</td></tr>
      ${order.delivery_fee > 0 ? `<tr><td style="padding:6px 0;font-size:14px;color:#64748b;">Delivery</td><td style="padding:6px 0;font-size:14px;text-align:right;color:#334155;">$${(order.delivery_fee).toFixed(2)}</td></tr>` : ''}
      ${order.processing_fee > 0 ? `<tr><td style="padding:6px 0;font-size:14px;color:#64748b;">Processing fee (2.9%)</td><td style="padding:6px 0;font-size:14px;text-align:right;color:#334155;">$${(order.processing_fee).toFixed(2)}</td></tr>` : ''}
      <tr style="border-top:2px solid #e2e8f0;">
        <td style="padding:12px 0 6px;font-size:16px;font-weight:700;color:#1e293b;">Total</td>
        <td style="padding:12px 0 6px;font-size:20px;font-weight:800;text-align:right;color:#f59e0b;">$${(order.total || 0).toFixed(2)}</td>
      </tr>
    </table>
  `;
}

/** Order number block */
function buildOrderNumberBlock(orderNumber) {
  return `
    <div style="background:#f8fafc;border:2px solid #f59e0b;border-radius:12px;padding:16px 20px;margin:20px 0;text-align:center;">
      <p style="margin:0;font-size:13px;color:#64748b;letter-spacing:1px;text-transform:uppercase;">Order Number</p>
      <p style="margin:6px 0 0;font-size:22px;font-weight:800;color:#1e293b;">${esc(orderNumber)}</p>
    </div>
  `;
}

export async function sendOrderCustomerConfirmation({ order }) {
  if (!order?.customer_email) return { success: false, reason: 'no_email' };

  const isEtransfer = order.payment_method !== 'credit_card';
  const deliveryLabel = getDeliveryLabel(order.delivery_preference);

  // E-transfer orders get "Action Required" — NOT "Order Confirmed"
  if (isEtransfer) {
    const html = emailWrapper('Complete Your Payment', `
      <p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${esc(order.customer_name) || 'there'},</p>
      <p style="font-size:15px;color:#334155;line-height:1.6;">Thank you for your order! To complete your purchase, please send an Interac e-Transfer for the amount below:</p>
      ${buildOrderNumberBlock(order.order_number)}
      <div style="background:#eff6ff;padding:20px 24px;border-radius:12px;margin:24px 0;border:1px solid #bfdbfe;">
        <h3 style="color:#1e40af;margin:0 0 12px;font-size:17px;">📧 E-Transfer Payment Instructions</h3>
        <p style="margin:10px 0;font-size:15px;color:#1e293b;"><strong>Amount:</strong> <span style="font-size:22px;color:#1e40af;font-weight:800;">$${(order.total || 0).toFixed(2)}</span></p>
        <p style="margin:10px 0;font-size:15px;color:#1e293b;"><strong>Send to:</strong> <span style="color:#1e40af;font-weight:600;">info@bbsflooring.ca</span></p>
        <p style="margin:10px 0;font-size:15px;color:#1e293b;"><strong>Reference/Memo:</strong> <code style="background:#e2e8f0;padding:3px 8px;border-radius:4px;color:#dc2626;font-weight:700;font-size:15px;">${esc(order.order_number)}</code></p>
        <div style="background:#fef3c7;border:2px solid #f59e0b;padding:12px 16px;border-radius:8px;margin:16px 0 8px;">
          <p style="margin:0;color:#92400e;font-size:14px;"><strong>⚠️ IMPORTANT:</strong> Include "<strong>${esc(order.order_number)}</strong>" in the memo/message field so we can match your payment.</p>
        </div>
        <div style="background:#e0f2fe;padding:14px 16px;border-radius:8px;margin:12px 0 0;border:1px solid #7dd3fc;">
          <h4 style="color:#0c4a6e;margin:0 0 6px;font-size:14px;">Exceeding Daily Bank Limits?</h4>
          <p style="margin:0;color:#0c4a6e;font-size:13px;line-height:1.6;">
            Most banks limit e-Transfers to $3,000 per day. <strong>This is normal.</strong><br/>
            You can send your payment in <strong>installments over multiple days</strong>.<br/>
            <em>We will confirm receipt of each installment via email and hold your stock.</em>
          </p>
        </div>
      </div>
      <h3 style="color:#1e293b;font-size:16px;margin:24px 0 8px;">Order Summary</h3>
      ${buildOrderItemsTable(order.items)}
      ${buildOrderTotals(order)}
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;margin:16px 0;">
        <p style="margin:0 0 8px;font-size:14px;color:#64748b;">🚛 <strong style="color:#334155;">Delivery method:</strong> ${deliveryLabel}</p>
        <p style="margin:0;font-size:14px;color:#64748b;">💳 <strong style="color:#334155;">Payment:</strong> E-Transfer — awaiting payment</p>
      </div>
      <p style="font-size:15px;color:#334155;line-height:1.6;margin-top:20px;">Once we receive your e-Transfer, we'll confirm your order and arrange ${isPickupOrder(order.delivery_preference) ? 'pickup' : 'delivery'}.</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="tel:+16474281111" style="display:inline-block;background:#f59e0b;color:#1e293b;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:16px;">Questions? Call ${PHONE}</a>
      </div>
      <p style="font-size:14px;color:#94a3b8;text-align:center;">Thank you for choosing BBS Flooring!</p>
    `);

    return sendEmail({
      to: order.customer_email,
      subject: `Action Required: Complete Payment — ${esc(order.order_number)} | BBS Flooring`,
      html,
    });
  }

  // Credit card orders — payment AUTHORIZED only, not captured yet (stock check first)
  const firstName = esc(order.customer_name?.split(' ')[0] || 'there');
  const isPickup = isPickupOrder(order.delivery_preference);

  const html = emailWrapper('We\'ve Got Your Order! 🎉', `
    <p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${firstName},</p>
    <p style="font-size:15px;color:#334155;line-height:1.6;">Thank you for your order — we're excited to get your new flooring to you! Your card has been <strong>authorized but not charged</strong>. We only charge once we've confirmed everything is in stock.</p>
    ${buildOrderNumberBlock(order.order_number)}

    <div style="background:#eff6ff;padding:24px;border-radius:16px;margin:24px 0;border:1px solid #bfdbfe;">
      <h3 style="color:#1e40af;margin:0 0 16px;font-size:17px;">📋 Here's What Happens Next</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:12px 16px;vertical-align:top;width:44px;">
            <div style="width:32px;height:32px;background:#dbeafe;border-radius:50%;display:flex;align-items:center;justify-content:center;text-align:center;line-height:32px;font-weight:700;color:#1e40af;font-size:14px;">1</div>
          </td>
          <td style="padding:12px 0;">
            <strong style="color:#1e293b;">Stock verification</strong><br/>
            <span style="color:#64748b;font-size:14px;">Our team checks that your exact products are in stock and ready.</span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 16px;vertical-align:top;">
            <div style="width:32px;height:32px;background:#dbeafe;border-radius:50%;display:flex;align-items:center;justify-content:center;text-align:center;line-height:32px;font-weight:700;color:#1e40af;font-size:14px;">2</div>
          </td>
          <td style="padding:12px 0;">
            <strong style="color:#1e293b;">Payment confirmed</strong><br/>
            <span style="color:#64748b;font-size:14px;">Once verified, we charge your card and send a confirmation email.</span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 16px;vertical-align:top;">
            <div style="width:32px;height:32px;background:#dbeafe;border-radius:50%;display:flex;align-items:center;justify-content:center;text-align:center;line-height:32px;font-weight:700;color:#1e40af;font-size:14px;">3</div>
          </td>
          <td style="padding:12px 0;">
            <strong style="color:#1e293b;">${isPickup ? 'Pickup details' : 'Delivery scheduled'}</strong><br/>
            <span style="color:#64748b;font-size:14px;">${isPickup ? 'We\'ll email you the warehouse pickup address and your pickup date.' : 'We\'ll email you to schedule a delivery date that works for you.'}</span>
          </td>
        </tr>
      </table>
    </div>

    <h3 style="color:#1e293b;font-size:16px;margin:24px 0 8px;">Your Order</h3>
    ${buildOrderItemsTable(order.items)}
    ${buildOrderTotals(order)}

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;margin:16px 0;">
      <p style="margin:0 0 8px;font-size:14px;color:#64748b;">🚛 <strong style="color:#334155;">Delivery method:</strong> ${deliveryLabel}</p>
      <p style="margin:0 0 8px;font-size:14px;color:#64748b;">💳 <strong style="color:#334155;">Payment:</strong> Authorized — you'll see <strong>"BBS FLOORING"</strong> on your statement</p>
      <p style="margin:0;font-size:14px;color:#64748b;">📍 <strong style="color:#334155;">Location:</strong> ${esc(order.shipping_address ? `${order.shipping_address}, ${order.shipping_city} ${order.shipping_postal_code}` : (isPickup ? 'Warehouse pickup' : 'Address on file'))}</p>
    </div>

    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:16px 20px;margin:16px 0;">
      <p style="margin:0;font-size:14px;color:#065f46;">🛡️ <strong>Your protection:</strong> Your card is only charged after we verify stock. If anything is unavailable, we'll contact you immediately — no charge, no hassle.</p>
    </div>

    <div style="text-align:center;margin:28px 0;">
      <a href="tel:+16474281111" style="display:inline-block;background:#f59e0b;color:#1e293b;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:16px;">Questions? Call ${PHONE}</a>
    </div>
    <p style="font-size:14px;color:#94a3b8;text-align:center;">Thank you for choosing BBS Flooring, ${firstName}! 🙏</p>
  `);

  return sendEmail({
    to: order.customer_email,
    subject: `Order Received — ${esc(order.order_number)} | BBS Flooring`,
    html,
  });
}

/** Sent when admin confirms payment (e-transfer or CC capture) via CRM */
export async function sendOrderPaymentConfirmed({ order }) {
  if (!order?.customer_email) return { success: false, reason: 'no_email' };

  const isCC = order.payment_method === 'credit_card';
  const deliveryLabel = getDeliveryLabel(order.delivery_preference);
  const isPickup = isPickupOrder(order.delivery_preference);
  const paymentMsg = isCC
    ? 'Your credit card payment has been processed successfully. Your order is now confirmed and we\'re getting it ready.'
    : 'We\'ve received your e-Transfer payment. Your order is now confirmed and we\'re getting it ready.';

  const html = emailWrapper('Payment Received — Order Confirmed!', `
    <p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${esc(order.customer_name) || 'there'},</p>
    <p style="font-size:15px;color:#334155;line-height:1.6;">Great news! ${paymentMsg}</p>
    ${buildOrderNumberBlock(order.order_number)}
    ${buildOrderItemsTable(order.items)}
    ${buildOrderTotals(order)}
    <div style="background:#ecfdf5;border:1px solid #6ee7b7;border-radius:12px;padding:16px 20px;margin:16px 0;">
      <p style="margin:0 0 8px;font-size:14px;color:#065f46;">✅ <strong>Payment:</strong> Received</p>
      <p style="margin:0;font-size:14px;color:#065f46;">🚛 <strong>Delivery method:</strong> ${deliveryLabel}</p>
      ${isPickup ? (order.pickup_address
        ? `<p style="margin:8px 0 0;font-size:14px;color:#065f46;">📍 <strong>Pickup at:</strong> ${esc(order.pickup_address)}</p>`
        : '<p style="margin:8px 0 0;font-size:14px;color:#065f46;">📍 <strong>Pickup location:</strong> We\'ll confirm the pickup address shortly.</p>'
      ) : ''}
    </div>
    <p style="font-size:15px;color:#334155;line-height:1.6;">We'll contact you to arrange ${isPickup ? 'your pickup time' : 'a delivery date'}.</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="tel:+16474281111" style="display:inline-block;background:#f59e0b;color:#1e293b;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:16px;">Questions? Call ${PHONE}</a>
    </div>
    <p style="font-size:14px;color:#94a3b8;text-align:center;">Thank you for choosing BBS Flooring!</p>
  `);

  return sendEmail({
    to: order.customer_email,
    subject: `Payment Received — ${esc(order.order_number)} Confirmed! | BBS Flooring`,
    html,
  });
}

export async function sendOrderAdminNotification({ order }) {
  const isEtransfer = order.payment_method !== 'credit_card';
  const paymentLabel = isEtransfer ? 'E-Transfer' : 'Credit Card';
  const deliveryLabel = getDeliveryLabel(order.delivery_preference, { emoji: false });
  
  const fraudBanner = order.fraud_flag
    ? `<div style="background:#fef2f2;border:3px solid #dc2626;border-radius:8px;padding:16px;margin:0 0 16px;">
        <p style="margin:0 0 8px;color:#991b1b;font-size:16px;font-weight:800;">🚨 FRAUD FLAG — ADDRESS MISMATCH</p>
        <p style="margin:0;color:#7f1d1d;font-size:14px;">Billing address doesn't match shipping. <strong>Verify identity before capturing payment.</strong></p>
        ${order.billing_address ? `<p style="margin:8px 0 0;font-size:13px;color:#991b1b;">Billing: ${esc(order.billing_address)}, ${esc(order.billing_city)} ${esc(order.billing_postal_code)} ${esc(order.billing_country)}</p>` : ''}
        <p style="margin:4px 0 0;font-size:13px;color:#991b1b;">Shipping: ${esc(order.shipping_address || 'N/A')}, ${esc(order.shipping_city || '')} ${esc(order.shipping_postal_code || '')}</p>
      </div>`
    : '';

  const urgencyBanner = isEtransfer
    ? `<div style="background:#fef3c7;border:2px solid #f59e0b;border-radius:8px;padding:12px 16px;margin:0 0 16px;">
        <p style="margin:0;color:#92400e;font-size:14px;font-weight:700;">🏦 AWAITING E-TRANSFER — Confirm payment in CRM before marking confirmed.</p>
      </div>`
    : '';

  const itemsList = (order.items || []).map(item =>
    `${item.product_name || 'Item'} — ${formatItemQty(item)} — $${(item.line_total || 0).toFixed(2)}`
  ).join('\n');

  const html = emailWrapper('New Order Received', `
    ${fraudBanner}
    ${urgencyBanner}
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Customer</td><td style="padding:8px 0;font-weight:600;">${esc(order.customer_name) || '—'}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Email</td><td style="padding:8px 0;"><a href="mailto:${esc(order.customer_email)}" style="color:#f59e0b;">${esc(order.customer_email)}</a></td></tr>
      ${order.customer_phone ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Phone</td><td style="padding:8px 0;"><a href="tel:${esc(order.customer_phone)}" style="color:#f59e0b;">${esc(order.customer_phone)}</a></td></tr>` : ''}
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Order #</td><td style="padding:8px 0;font-weight:700;color:#1e293b;">${esc(order.order_number)}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Payment</td><td style="padding:8px 0;font-weight:600;color:${isEtransfer ? '#dc2626' : '#16a34a'};">${paymentLabel}${isEtransfer ? ' — PENDING' : ' — Authorized'}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Delivery</td><td style="padding:8px 0;">${deliveryLabel}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Items</td><td style="padding:8px 0;">${(order.items || []).length} product${(order.items || []).length !== 1 ? 's' : ''}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Total</td><td style="padding:8px 0;font-size:18px;font-weight:700;color:#f59e0b;">$${(order.total || 0).toFixed(2)}</td></tr>
    </table>
    <pre style="background:#f8fafc;padding:12px;border-radius:8px;font-size:13px;color:#334155;white-space:pre-wrap;margin:16px 0;">${esc(itemsList)}</pre>
    ${order.notes ? `<p style="font-size:14px;color:#64748b;"><strong>Notes:</strong> ${esc(order.notes)}</p>` : ''}
    <div style="text-align:center;margin:20px 0;">
      <a href="${SITE_URL}/admin/crm?source=order" style="display:inline-block;background:#1e40af;color:#ffffff;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:16px;">Open in CRM →</a>
    </div>
    <p style="margin-top:12px;font-size:13px;color:#94a3b8;">Reply to this email to contact the customer.</p>
  `);

  const subjectPrefix = order.fraud_flag ? '🚨 [FRAUD FLAG]' : isEtransfer ? '🏦 [PENDING E-TRANSFER]' : '💳 [NEW ORDER]';
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `${subjectPrefix} ${esc(order.order_number)} — $${(order.total || 0).toFixed(2)}`,
    html,
    replyTo: order.customer_email,
  });
}

/** Sent when admin cancels an order (out of stock, customer request, etc.) */
export async function sendOrderCancelled({ order, reason }) {
  if (!order?.customer_email) return { success: false, reason: 'no_email' };

  const isOutOfStock = reason === 'out_of_stock';
  const isCustomerRequest = reason === 'customer_request';
  const isCreditCard = order.payment_method === 'credit_card';

  const reasonMessages = {
    out_of_stock: {
      heading: 'Unfortunately, one or more items in your order are currently out of stock.',
      detail: 'We sincerely apologize for the inconvenience. Our inventory moves fast, and the items you selected became unavailable before we could fulfill your order.',
    },
    customer_request: {
      heading: 'Your order has been cancelled as requested.',
      detail: 'If you change your mind, we\'d love to help you find the perfect flooring. Our full selection is always available online or at our showroom.',
    },
    other: {
      heading: 'Unfortunately, we\'re unable to fulfill your order at this time.',
      detail: 'We sincerely apologize for the inconvenience.',
    },
  };

  const msg = reasonMessages[reason] || reasonMessages.other;

  const paymentNote = isCreditCard
    ? `<div style="background:#ecfdf5;border:1px solid #6ee7b7;border-radius:8px;padding:14px 16px;margin:16px 0;">
        <p style="margin:0;color:#065f46;font-size:14px;">✅ <strong>No charge to your credit card.</strong> The authorization hold has been released and will disappear from your statement within 3-5 business days.</p>
      </div>`
    : order.payment_status === 'paid' || order.payment_status === 'completed'
      ? `<div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:8px;padding:14px 16px;margin:16px 0;">
          <p style="margin:0;color:#92400e;font-size:14px;">💰 <strong>Your e-Transfer payment will be refunded.</strong> You'll receive the refund within 1-2 business days. If you don't see it, please contact us.</p>
        </div>`
      : '';

  const html = emailWrapper('Order Cancelled', `
    <p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${esc(order.customer_name) || 'there'},</p>
    <p style="font-size:15px;color:#334155;line-height:1.6;">${msg.heading}</p>
    ${buildOrderNumberBlock(order.order_number)}
    <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:12px;padding:20px 24px;margin:20px 0;">
      <p style="margin:0 0 8px;font-size:14px;color:#991b1b;font-weight:600;">Status: Cancelled</p>
      <p style="margin:0;font-size:14px;color:#7f1d1d;line-height:1.6;">${msg.detail}</p>
    </div>
    ${paymentNote}
    ${buildOrderItemsTable(order.items)}
    ${buildOrderTotals(order)}
    ${isOutOfStock ? `
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px 24px;margin:20px 0;">
      <h3 style="color:#1e40af;margin:0 0 10px;font-size:16px;">🔔 Want to be notified when it's back?</h3>
      <p style="margin:0;color:#334155;font-size:14px;line-height:1.6;">Give us a call or reply to this email and we'll let you know as soon as your items are restocked. We can also help you find a similar product that's available now.</p>
    </div>
    ` : ''}
    <div style="text-align:center;margin:24px 0;">
      <a href="https://bbsflooring.ca/products" style="display:inline-block;background:#f59e0b;color:#1e293b;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:16px;margin-right:12px;">Browse Products</a>
      <a href="tel:+16474281111" style="display:inline-block;background:#1e293b;color:#ffffff;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:16px;">Call ${PHONE}</a>
    </div>
    <p style="font-size:15px;color:#334155;line-height:1.6;text-align:center;margin-top:16px;">We appreciate your business and hope to serve you in the future.</p>
  `);

  return sendEmail({
    to: order.customer_email,
    subject: `Order Cancelled — ${esc(order.order_number)} | BBS Flooring`,
    html,
  });
}

/** Abandoned cart recovery — sent when Stripe checkout session expires without payment. */
export async function sendAbandonedCartRecovery({ order }) {
  if (!order?.customer_email) return { success: false, reason: 'no_email' };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bbsflooring.ca';
  const resumeUrl = `${siteUrl}/checkout?resume_order=${encodeURIComponent(order.order_number)}`;

  const html = emailWrapper('Your Order Is Waiting!', `
    <p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${esc(order.customer_name) || 'there'},</p>
    <p style="font-size:15px;color:#334155;line-height:1.6;">You were so close! It looks like you started an order but didn't finish checking out. No worries — your items are still here.</p>

    ${buildOrderNumberBlock(order.order_number)}

    <h3 style="color:#1e293b;font-size:16px;margin:24px 0 8px;">Your Items</h3>
    ${buildOrderItemsTable(order.items)}
    ${buildOrderTotals(order)}

    <div style="text-align:center;margin:32px 0;">
      <a href="${resumeUrl}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#1e293b;font-weight:800;padding:16px 40px;border-radius:12px;text-decoration:none;font-size:18px;box-shadow:0 4px 12px rgba(245,158,11,0.4);">Complete Your Order →</a>
    </div>

    <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:12px;padding:16px 20px;margin:16px 0;">
      <p style="margin:0;color:#92400e;font-size:14px;">
        <strong>💡 Why complete now?</strong> Flooring stock moves fast — especially clearance items. 
        We can't guarantee availability if you wait too long.
      </p>
    </div>

    <p style="font-size:14px;color:#64748b;line-height:1.6;margin-top:20px;">
      Prefer to pay by e-Transfer instead? No problem — just 
      <a href="tel:+16474281111" style="color:#f59e0b;font-weight:600;">call us at ${PHONE}</a> 
      and we'll switch your payment method.
    </p>

    <p style="font-size:14px;color:#64748b;line-height:1.6;">
      Have questions about your order? Reply to this email or call us — we're happy to help.
    </p>

    <div style="text-align:center;margin:24px 0;">
      <a href="tel:+16474281111" style="display:inline-block;background:#1e293b;color:#f59e0b;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:16px;">Questions? Call ${PHONE}</a>
    </div>
    <p style="font-size:12px;color:#94a3b8;text-align:center;">If you've already completed your purchase or no longer need these items, you can safely ignore this email.</p>
  `);

  return sendEmail({
    to: order.customer_email,
    subject: `You left something behind — ${esc(order.order_number)} | BBS Flooring`,
    html,
    replyTo: ADMIN_EMAIL,
  });
}

/** Status update email — sent when admin moves order to processing/shipped/delivered. */
export async function sendOrderStatusUpdate({ order, oldStatus }) {
  if (!order?.customer_email) return { success: false, reason: 'no_email' };

  const statusMessages = {
    processing: {
      title: 'Your Order Is Being Prepared!',
      subject: `Order Update — We're Preparing Your Order`,
      body: `Great news! Your order is now being prepared for ${isPickupOrder(order.delivery_preference) ? 'pickup' : 'delivery'}.`,
      detail: isPickupOrder(order.delivery_preference)
        ? (order.pickup_address
          ? `<strong>Pickup at:</strong> ${esc(order.pickup_address)}<br/>We'll let you know when it's ready.`
          : `We're confirming the pickup location and will email you shortly.`)
        : `We're getting everything ready and will contact you to schedule delivery.`,
    },
    shipped: {
      title: isPickupOrder(order.delivery_preference) ? 'Ready for Pickup!' : 'Your Order Has Been Shipped!',
      subject: isPickupOrder(order.delivery_preference)
        ? `Ready for Pickup — ${esc(order.order_number)}`
        : `Order Shipped — ${esc(order.order_number)}`,
      body: isPickupOrder(order.delivery_preference)
        ? `Your order is ready for pickup!`
        : `Your order is on its way!`,
      detail: isPickupOrder(order.delivery_preference)
        ? (() => {
            let d = '';
            if (order.scheduled_date) {
              const dateStr = new Date(order.scheduled_date + 'T12:00:00').toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
              d += `<div style="background:#fffbeb;border:2px solid #f59e0b;border-radius:12px;padding:16px;text-align:center;margin-bottom:16px;">
                <p style="font-size:13px;color:#92400e;margin:0 0 4px;font-weight:600;">Pickup Date</p>
                <p style="font-size:22px;font-weight:800;color:#1e293b;margin:0;">${dateStr}</p>
                ${order.scheduled_note ? `<p style="font-size:14px;color:#64748b;margin:8px 0 0;">${esc(order.scheduled_note)}</p>` : ''}
              </div>`;
            }
            if (order.pickup_address) {
              d += `<strong>📍 Pickup Address:</strong> ${esc(order.pickup_address)}`;
            }
            if (order.pickup_reference) {
              d += `<br/><br/><strong>🔖 Pickup Reference:</strong> <span style="font-size:18px;font-weight:700;letter-spacing:0.5px;">${esc(order.pickup_reference)}</span><br/><em style="font-size:13px;color:#64748b;">Show this to warehouse staff on arrival.</em>`;
            }
            d += `<br/><br/>Please bring a valid ID matching the order name. Call us if you need to arrange a different pickup time.`;
            return d || `Please call us at ${PHONE} to confirm your pickup time and location.`;
          })()
        : (() => {
            let d = '';
            if (order.scheduled_date) {
              const dateStr = new Date(order.scheduled_date + 'T12:00:00').toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
              d += `<div style="background:#eff6ff;border:2px solid #3b82f6;border-radius:12px;padding:16px;text-align:center;margin-bottom:16px;">
                <p style="font-size:13px;color:#1e40af;margin:0 0 4px;font-weight:600;">Delivery Date</p>
                <p style="font-size:22px;font-weight:800;color:#1e293b;margin:0;">${dateStr}</p>
                ${order.scheduled_note ? `<p style="font-size:14px;color:#64748b;margin:8px 0 0;">${esc(order.scheduled_note)}</p>` : ''}
              </div>`;
            }
            if (order.shipping_address) {
              d += `<strong>📍 Delivery Address:</strong> ${esc(order.shipping_address)}${order.shipping_city ? `, ${esc(order.shipping_city)}` : ''}${order.shipping_postal_code ? ` ${esc(order.shipping_postal_code)}` : ''}`;
              d += `<br/><br/>`;
            }
            d += `Please ensure someone is available to receive the delivery. Call us if you need to adjust the time.`;
            return d;
          })(),
    },
    delivered: {
      title: isPickupOrder(order.delivery_preference) ? 'Order Complete — Thank You!' : 'Order Delivered — Thank You!',
      subject: `Order Complete — Thank You! | ${esc(order.order_number)}`,
      body: `Your order has been ${isPickupOrder(order.delivery_preference) ? 'picked up' : 'delivered'}. Thank you for choosing BBS Flooring!`,
      detail: `<p>We hope you love your new flooring! If you have any questions about installation or care, don't hesitate to reach out.</p>
        <p style="margin-top:12px;">If you're happy with your purchase, we'd really appreciate a <a href="https://g.page/r/CWJpmP-Dl-g4EBE/review" style="color:#f59e0b;font-weight:600;">Google review</a> — it helps other homeowners find us. 🙏</p>`,
    },
  };

  const msg = statusMessages[order.status];
  if (!msg) return { success: false, reason: 'no_template_for_status' };

  const html = emailWrapper(msg.title, `
    <p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${esc(order.customer_name) || 'there'},</p>
    <p style="font-size:15px;color:#334155;line-height:1.6;">${msg.body}</p>
    ${buildOrderNumberBlock(order.order_number)}
    <div style="background:#eff6ff;padding:20px 24px;border-radius:12px;margin:24px 0;border:1px solid #bfdbfe;">
      <p style="font-size:15px;color:#334155;line-height:1.6;margin:0;">${msg.detail}</p>
    </div>
    ${buildOrderItemsTable(order.items)}
    ${buildOrderTotals(order)}
    <div style="text-align:center;margin:24px 0;">
      <a href="tel:+16474281111" style="display:inline-block;background:#f59e0b;color:#1e293b;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:16px;">Questions? Call ${PHONE}</a>
    </div>
    <p style="font-size:14px;color:#94a3b8;text-align:center;">Thank you for choosing BBS Flooring!</p>
  `);

  return sendEmail({
    to: order.customer_email,
    subject: `${msg.subject} | BBS Flooring`,
    html,
  });
}

// ── Follow-up emails (CRM admin-initiated) ────────────────────

const FOLLOW_UP_TEMPLATES = {
  quote_followup: {
    subject: (vars) => `Following Up — Your ${vars.product || 'Flooring'} Quote`,
    body: (vars) => {
      const lines = [];
      lines.push(`<p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${esc(vars.name)},</p>`);
      lines.push(`<p style="font-size:15px;color:#334155;line-height:1.6;">You recently put together a quote on our website for <strong>${esc(vars.product || 'flooring')}</strong>${vars.sqft ? ` (${vars.sqft} sq ft)` : ''} and I wanted to check in.</p>`);
      if (vars.quote_total) {
        lines.push(`<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;margin:16px 0;text-align:center;">`);
        lines.push(`<p style="margin:0 0 4px;font-size:13px;color:#64748b;">YOUR QUOTE</p>`);
        lines.push(`<p style="margin:0;font-size:24px;font-weight:800;color:#f59e0b;">$${vars.quote_total} CAD</p>`);
        lines.push(`</div>`);
      }
      lines.push(`<p style="font-size:15px;color:#334155;line-height:1.6;">If you have any questions about the product, installation, or pricing — I'm happy to help. We also offer <strong>free in-home measurements</strong> if you'd like us to come take a look at your space.</p>`);
      return lines.join('\n');
    },
  },
  measurement_followup: {
    subject: (vars) => `Following Up on Your Measurement${vars.address ? ` at ${vars.address}` : ''}`,
    body: (vars) => {
      const lines = [];
      lines.push(`<p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${esc(vars.name)},</p>`);
      lines.push(`<p style="font-size:15px;color:#334155;line-height:1.6;">Just checking in after your measurement${vars.address ? ` at <strong>${esc(vars.address)}</strong>` : ''}. I hope everything looked good!</p>`);
      lines.push(`<p style="font-size:15px;color:#334155;line-height:1.6;">If you're ready to move forward — or if you have questions about products, pricing, or the installation process — just reply to this email or give me a call.</p>`);
      return lines.join('\n');
    },
  },
  general_checkin: {
    subject: () => `Checking In on Your Flooring Project`,
    body: (vars) => {
      const lines = [];
      lines.push(`<p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${esc(vars.name)},</p>`);
      lines.push(`<p style="font-size:15px;color:#334155;line-height:1.6;">Just checking in — wanted to see how your flooring project is coming along. If you're still exploring options or comparing products, I'm here to help.</p>`);
      lines.push(`<p style="font-size:15px;color:#334155;line-height:1.6;">We've got a great selection of <strong>vinyl, hardwood, and laminate</strong> — all at competitive prices with professional installation available.</p>`);
      return lines.join('\n');
    },
  },
  cold_reengagement: {
    subject: (vars) => `Still Thinking About ${vars.product || 'New Floors'}?`,
    body: (vars) => {
      const lines = [];
      lines.push(`<p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${esc(vars.name)},</p>`);
      lines.push(`<p style="font-size:15px;color:#334155;line-height:1.6;">It's been a little while since you were looking at ${vars.product ? `<strong>${esc(vars.product)}</strong>` : 'flooring options'} with us. If the timing wasn't right before, no worries — just wanted to let you know we're still here when you're ready.</p>`);
      if (vars.product) {
        lines.push(`<p style="font-size:15px;color:#334155;line-height:1.6;">We still carry ${esc(vars.product)} and our team is ready to help with a <strong>free in-home measurement</strong> whenever it works for you.</p>`);
      }
      return lines.join('\n');
    },
  },
  abandoned_cart_followup: {
    subject: (vars) => `You Had ${vars.product || 'Something Great'} in Your Cart`,
    body: (vars) => {
      const lines = [];
      lines.push(`<p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${esc(vars.name)},</p>`);
      lines.push(`<p style="font-size:15px;color:#334155;line-height:1.6;">Looks like you were checking out ${vars.product ? `<strong>${esc(vars.product)}</strong>` : 'some flooring'} but didn't finish your order. No pressure at all — just wanted to make sure everything was okay.</p>`);
      if (vars.quote_total) {
        lines.push(`<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;margin:16px 0;text-align:center;">`);
        lines.push(`<p style="margin:0 0 4px;font-size:13px;color:#64748b;">YOUR ESTIMATE</p>`);
        lines.push(`<p style="margin:0;font-size:24px;font-weight:800;color:#f59e0b;">$${vars.quote_total} CAD</p>`);
        lines.push(`</div>`);
      }
      lines.push(`<p style="font-size:15px;color:#334155;line-height:1.6;">If you ran into any issues during checkout or have questions about the product, just reply to this email or give me a call — I'm happy to help sort it out.</p>`);
      return lines.join('\n');
    },
  },
};

/**
 * Build a follow-up email using a template or custom body.
 * Always uses the branded BBS emailWrapper.
 * 
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.template - Template key from FOLLOW_UP_TEMPLATES
 * @param {Object} params.vars - Template variables: { name, product, sqft, quote_total, address }
 * @param {string} [params.customSubject] - Override subject line
 * @param {string} [params.customBody] - Override body HTML (replaces template body entirely)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendFollowUpEmail({ to, template, vars = {}, customSubject, customBody }) {
  if (!to) return { success: false, reason: 'no_email' };

  const tmpl = FOLLOW_UP_TEMPLATES[template];
  if (!tmpl && !customBody) return { success: false, reason: 'invalid_template' };

  const subject = customSubject || (tmpl ? tmpl.subject(vars) : 'Following Up — BBS Flooring');
  const bodyContent = customBody || tmpl.body(vars);

  // Standard sign-off with Abram's contact info
  const signOff = `
    <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e2e8f0;">
      <p style="font-size:14px;color:#334155;line-height:1.6;margin:0;">Talk soon,</p>
      <p style="font-size:15px;color:#1e293b;font-weight:600;margin:4px 0 0;">Abram — BBS Flooring</p>
      <div style="margin-top:12px;">
        <a href="tel:+16474281111" style="display:inline-block;color:#f59e0b;font-weight:600;font-size:14px;text-decoration:none;margin-right:16px;">📞 ${PHONE}</a>
        <a href="https://bbsflooring.ca" style="display:inline-block;color:#f59e0b;font-weight:600;font-size:14px;text-decoration:none;">🌐 bbsflooring.ca</a>
      </div>
    </div>
  `;

  // CTA button
  const cta = `
    <div style="text-align:center;margin:24px 0;">
      <a href="https://bbsflooring.ca/free-measurement" style="display:inline-block;background:#f59e0b;color:#1e293b;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:16px;">Book Free Measurement →</a>
    </div>
  `;

  const html = emailWrapper('Following Up', `
    ${bodyContent}
    ${cta}
    ${signOff}
  `);

  return sendEmail({
    to,
    subject,
    html,
    replyTo: ADMIN_EMAIL,
  });
}

/** Get available follow-up template names and labels */
export function getFollowUpTemplates() {
  return [
    { key: 'quote_followup', label: 'Quote Follow-Up', description: 'For leads who got a quote on the website' },
    { key: 'measurement_followup', label: 'Measurement Follow-Up', description: 'After a measurement visit' },
    { key: 'general_checkin', label: 'General Check-In', description: 'Casual check-in on their project' },
    { key: 'cold_reengagement', label: 'Cold Re-engagement', description: 'For older leads who went quiet' },
    { key: 'abandoned_cart_followup', label: 'Abandoned Cart', description: 'For leads who left items in cart' },
  ];
}

/** Generate preview of a template with given vars (returns { subject, body } as HTML strings) */
export function previewFollowUpTemplate(template, vars = {}) {
  const tmpl = FOLLOW_UP_TEMPLATES[template];
  if (!tmpl) return null;
  return {
    subject: tmpl.subject(vars),
    body: tmpl.body(vars),
  };
}

// ── Review follow-up (3 days after delivery) ───────────────────

export async function sendReviewFollowUp({ order }) {
  if (!order?.customer_email) return { success: false, reason: 'no_email' };

  const firstName = esc(order.customer_name?.split(' ')[0] || 'there');
  const reviewUrl = 'https://g.page/r/CWJpmP-Dl-g4EBE/review';

  const html = emailWrapper('How\'s Your New Flooring?', `
    <p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${firstName},</p>
    <p style="font-size:15px;color:#334155;line-height:1.6;">It's been a few days since your order was ${isPickupOrder(order.delivery_preference) ? 'picked up' : 'delivered'} — we hope you're loving your new floors!</p>

    <div style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border:2px solid #f59e0b;border-radius:16px;padding:28px;text-align:center;margin:28px 0;">
      <p style="font-size:36px;margin:0 0 8px;">⭐⭐⭐⭐⭐</p>
      <p style="font-size:18px;font-weight:700;color:#1e293b;margin:0 0 8px;">Your review means the world to us</p>
      <p style="font-size:14px;color:#64748b;margin:0 0 20px;">We're a small, family-run business in Markham. Every review helps other homeowners find us.</p>
      <a href="${reviewUrl}" style="display:inline-block;background:#f59e0b;color:#1e293b;font-weight:800;padding:16px 40px;border-radius:12px;text-decoration:none;font-size:17px;box-shadow:0 4px 12px rgba(245,158,11,0.3);">Leave a Google Review →</a>
    </div>

    <p style="font-size:14px;color:#64748b;line-height:1.6;">
      Not 100% happy? We want to make it right. Reply to this email or call us at 
      <a href="tel:+16474281111" style="color:#f59e0b;font-weight:600;">${PHONE}</a> — 
      we'll do whatever it takes.
    </p>

    <p style="font-size:14px;color:#94a3b8;text-align:center;margin-top:24px;">Thank you for choosing BBS Flooring, ${firstName}. 🙏</p>
  `);

  return sendEmail({
    to: order.customer_email,
    subject: `How's your new flooring? ⭐ | BBS Flooring`,
    html,
  });
}

// ── Schedule notification (delivery/pickup date set by admin) ───

export async function sendScheduleNotification({ order }) {
  const isPickup = isPickupOrder(order.delivery_preference);
  const isCreditCard = order.payment_method === 'credit_card';
  const dateStr = new Date(order.scheduled_date + 'T12:00:00').toLocaleDateString('en-CA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const title = isPickup ? '🏪 Your Pickup Date is Confirmed' : '🚚 Your Delivery Date is Confirmed';
  const typeLabel = isPickup ? 'Pickup' : 'Delivery';

  const html = emailWrapper(title, `
    <p style="font-size:16px;color:#334155;">Hi ${esc(order.customer_name?.split(' ')[0] || 'there')},</p>
    <p style="font-size:16px;color:#334155;">Your order <strong>${esc(order.order_number)}</strong> is scheduled for ${typeLabel.toLowerCase()}:</p>
    
    <div style="background:#fffbeb;border:2px solid #f59e0b;border-radius:12px;padding:20px;text-align:center;margin:20px 0;">
      <p style="font-size:14px;color:#92400e;margin:0 0 4px;font-weight:600;">${typeLabel} Date</p>
      <p style="font-size:24px;font-weight:800;color:#1e293b;margin:0;">${dateStr}</p>
      ${order.scheduled_note ? `<p style="font-size:14px;color:#64748b;margin:8px 0 0;">${esc(order.scheduled_note)}</p>` : ''}
    </div>

    ${isPickup && order.pickup_address ? `
    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:16px;margin:16px 0;">
      <p style="font-size:14px;font-weight:600;color:#166534;margin:0 0 4px;">📍 Pickup Address</p>
      <p style="font-size:16px;color:#1e293b;margin:0;">${esc(order.pickup_address)}</p>
      ${order.pickup_reference ? `<p style="font-size:14px;font-weight:600;color:#166534;margin:12px 0 4px;">🔖 Pickup Reference</p>
      <p style="font-size:18px;color:#1e293b;margin:0;font-weight:700;letter-spacing:0.5px;">${esc(order.pickup_reference)}</p>
      <p style="font-size:13px;color:#64748b;margin:4px 0 0;">Show this reference number to warehouse staff when you arrive.</p>` : ''}
    </div>
    ` : ''}

    ${isPickup && isCreditCard ? `
    <div style="background:#fff7ed;border:1px solid #fdba74;border-radius:12px;padding:16px;margin:16px 0;">
      <p style="font-size:14px;font-weight:600;color:#9a3412;margin:0 0 4px;">🪪 Please bring photo ID</p>
      <p style="font-size:14px;color:#7c2d12;margin:0 0 8px;line-height:1.5;">Because this order was paid by credit card, the cardholder should bring government-issued photo ID matching the name on the order.</p>
      <p style="font-size:14px;color:#7c2d12;margin:0;line-height:1.5;"><strong>Can&rsquo;t come in person?</strong> Reply to this email with a photo of your ID and the name of the person picking up, and we&rsquo;ll authorize them.</p>
    </div>
    ` : ''}

    ${buildOrderItemsTable(order.items || [])}
    ${buildOrderTotals(order)}

    <p style="font-size:14px;color:#64748b;margin-top:20px;">Need to reschedule? Call us at <a href="tel:+16474281111" style="color:#f59e0b;font-weight:600;">${PHONE}</a></p>
  `);

  return sendEmail({
    to: order.customer_email,
    subject: `${typeLabel} Scheduled: ${dateStr} | BBS Flooring`,
    html,
  });
}

/**
 * Abandoned checkout email — sent when a customer enters their email on the
 * checkout page but leaves before completing payment (pre-Stripe session).
 * Different from sendAbandonedCartRecovery which handles Stripe session expiry.
 */
export async function sendAbandonedCheckoutEmail({ customerName, customerEmail, cartItems, cartValue }) {
  if (!customerEmail) return { success: false, reason: 'no_email' };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bbsflooring.ca';

  const itemRows = (cartItems || []).map(item => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#334155;">${esc(item.product_name || item.name || 'Flooring Product')}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#334155;text-align:right;">${item.quantity || 1}</td>
    </tr>
  `).join('');

  const html = emailWrapper('Still Thinking It Over?', `
    <p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${esc(customerName) || 'there'},</p>
    <p style="font-size:15px;color:#334155;line-height:1.6;">We noticed you were checking out some great flooring options but didn't finish your order. No pressure — we just wanted to make sure everything was okay.</p>

    ${itemRows ? `
    <h3 style="color:#1e293b;font-size:16px;margin:24px 0 8px;">What You Were Looking At</h3>
    <table style="width:100%;border-collapse:collapse;margin:8px 0 16px;">
      <thead>
        <tr style="background:#f8fafc;">
          <th style="padding:8px 12px;text-align:left;font-size:13px;color:#64748b;border-bottom:2px solid #e2e8f0;">Product</th>
          <th style="padding:8px 12px;text-align:right;font-size:13px;color:#64748b;border-bottom:2px solid #e2e8f0;">Qty</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>
    ${cartValue ? `<p style="font-size:15px;color:#1e293b;font-weight:700;text-align:right;">Estimated Total: C$${Number(cartValue).toFixed(2)}</p>` : ''}
    ` : ''}

    <div style="text-align:center;margin:32px 0;">
      <a href="${siteUrl}/cart" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#1e293b;font-weight:800;padding:16px 40px;border-radius:12px;text-decoration:none;font-size:18px;box-shadow:0 4px 12px rgba(245,158,11,0.4);">Return to Your Cart →</a>
    </div>

    <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:12px;padding:16px 20px;margin:16px 0;">
      <p style="margin:0;color:#92400e;font-size:14px;">
        <strong>💡 Need help deciding?</strong> Book a free in-home measurement and we'll bring samples to your door.
        <a href="${siteUrl}/free-measurement" style="color:#92400e;font-weight:600;">Book here →</a>
      </p>
    </div>

    <p style="font-size:14px;color:#64748b;line-height:1.6;margin-top:20px;">
      Questions? Just reply to this email or call us at <a href="tel:+16474281111" style="color:#f59e0b;font-weight:600;">${PHONE}</a>.
      We're happy to help with product recommendations, pricing, or anything else.
    </p>

    <p style="font-size:12px;color:#94a3b8;text-align:center;margin-top:24px;">If you've already completed your purchase, please ignore this email.</p>
  `);

  return sendEmail({
    to: customerEmail,
    subject: 'Still thinking it over? Your flooring picks are waiting | BBS Flooring',
    html,
    replyTo: ADMIN_EMAIL,
  });
}
