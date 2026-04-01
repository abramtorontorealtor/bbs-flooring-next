/**
 * SendGrid email utility for BBS Flooring.
 * Server-side only — uses SENDGRID_API_KEY env var.
 * 
 * Three email types:
 * 1. Contact form → admin notification + customer confirmation
 * 2. Quote → customer quote breakdown + admin notification
 * 3. Booking → customer confirmation + admin notification
 */

const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';
const FROM_EMAIL = 'info@bbsflooring.ca';
const FROM_NAME = 'BBS Flooring';
const ADMIN_EMAIL = 'info@bbsflooring.ca';
const PHONE = '(647) 428-1111';

async function sendEmail({ to, subject, html, replyTo }) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.warn('[Email] SENDGRID_API_KEY not set — skipping email send');
    return { success: false, reason: 'no_api_key' };
  }

  const payload = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject,
    content: [{ type: 'text/html', value: html }],
  };

  if (replyTo) {
    payload.reply_to = { email: replyTo };
  }

  try {
    const res = await fetch(SENDGRID_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[Email] SendGrid error:', res.status, text);
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

export async function sendContactAdminNotification({ name, email, phone, message, source }) {
  const html = emailWrapper('New Contact Form Submission', `
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;width:100px;">Name</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#1e293b;">${name}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Email</td><td style="padding:8px 0;font-size:14px;"><a href="mailto:${email}" style="color:#f59e0b;">${email}</a></td></tr>
      ${phone ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Phone</td><td style="padding:8px 0;font-size:14px;"><a href="tel:${phone}" style="color:#f59e0b;">${phone}</a></td></tr>` : ''}
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Source</td><td style="padding:8px 0;font-size:14px;color:#64748b;">${source || 'contact_form'}</td></tr>
    </table>
    <div style="margin-top:16px;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
      <p style="margin:0;font-size:14px;color:#334155;white-space:pre-wrap;">${message}</p>
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
    <p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${name},</p>
    <p style="font-size:15px;color:#334155;line-height:1.6;">We received your message and our team will get back to you <strong>within 2 business hours</strong>.</p>
    <p style="font-size:15px;color:#334155;line-height:1.6;">Need an answer sooner? Give us a call:</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="tel:+16474281111" style="display:inline-block;background:#f59e0b;color:#1e293b;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:16px;">📞 Call ${PHONE}</a>
    </div>
    <p style="font-size:14px;color:#64748b;">Or visit our showroom at 6061 Highway 7, Unit B, Markham. Mon–Fri 9am–6pm, Sat 10am–5pm.</p>
  `);

  return sendEmail({
    to: email,
    subject: 'BBS Flooring — We Got Your Message ✓',
    html,
  });
}

// ── Quote emails ────────────────────────────────────────────────

export async function sendQuoteToCustomer({ quote, isMember }) {
  if (!quote?.customer_email) return { success: false, reason: 'no_email' };

  const items = quote.items || [];
  const itemRows = items.map(item => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:14px;">${item.product_name || 'Product'}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:14px;text-align:right;">${item.sqft || '—'} sqft</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:14px;text-align:right;">$${(item.price_per_sqft || 0).toFixed(2)}/sqft</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:14px;text-align:right;font-weight:600;">$${(item.total || 0).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = emailWrapper('Your Flooring Quote', `
    <p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${quote.customer_name || 'there'},</p>
    <p style="font-size:15px;color:#334155;line-height:1.6;">Here's the quote you requested${isMember ? ' <span style="color:#f59e0b;font-weight:600;">(Member Pricing Applied)</span>' : ''}:</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <thead>
        <tr style="background:#f8fafc;">
          <th style="padding:8px;text-align:left;font-size:13px;color:#64748b;">Product</th>
          <th style="padding:8px;text-align:right;font-size:13px;color:#64748b;">Area</th>
          <th style="padding:8px;text-align:right;font-size:13px;color:#64748b;">Rate</th>
          <th style="padding:8px;text-align:right;font-size:13px;color:#64748b;">Total</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="padding:12px 8px;text-align:right;font-size:15px;font-weight:700;color:#1e293b;">Estimated Total</td>
          <td style="padding:12px 8px;text-align:right;font-size:18px;font-weight:700;color:#f59e0b;">$${(quote.total || 0).toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
    <p style="font-size:13px;color:#94a3b8;">This is an estimate. Final pricing confirmed after free in-home measurement.</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://bbsflooring.ca/free-measurement" style="display:inline-block;background:#f59e0b;color:#1e293b;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:16px;">Book Free Measurement →</a>
    </div>
  `);

  return sendEmail({
    to: quote.customer_email,
    subject: `Your BBS Flooring Quote — $${(quote.total || 0).toFixed(2)}`,
    html,
  });
}

export async function sendQuoteAdminNotification({ quote, isMember }) {
  const html = emailWrapper('New Quote Generated', `
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Customer</td><td style="padding:8px 0;font-weight:600;">${quote.customer_name || '—'}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Email</td><td style="padding:8px 0;"><a href="mailto:${quote.customer_email}" style="color:#f59e0b;">${quote.customer_email}</a></td></tr>
      ${quote.customer_phone ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Phone</td><td style="padding:8px 0;"><a href="tel:${quote.customer_phone}" style="color:#f59e0b;">${quote.customer_phone}</a></td></tr>` : ''}
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Total</td><td style="padding:8px 0;font-size:18px;font-weight:700;color:#f59e0b;">$${(quote.total || 0).toFixed(2)}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Member</td><td style="padding:8px 0;">${isMember ? '✅ Yes' : '❌ No'}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Items</td><td style="padding:8px 0;">${(quote.items || []).length} products</td></tr>
    </table>
    <p style="margin-top:12px;font-size:13px;color:#94a3b8;">Reply to this email to contact the customer.</p>
  `);

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `💰 New Quote: $${(quote.total || 0).toFixed(2)} — ${quote.customer_name || 'Unknown'}`,
    html,
    replyTo: quote.customer_email,
  });
}

// ── Booking emails ──────────────────────────────────────────────

export async function sendBookingCustomerConfirmation({ booking }) {
  if (!booking?.customer_email) return { success: false, reason: 'no_email' };

  const date = booking.preferred_date ? new Date(booking.preferred_date).toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD';

  const html = emailWrapper('Measurement Booking Confirmed!', `
    <p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${booking.customer_name || 'there'},</p>
    <p style="font-size:15px;color:#334155;line-height:1.6;">Your free in-home measurement is booked. Here are the details:</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:16px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">📅 Date</td><td style="padding:6px 0;font-weight:600;font-size:14px;">${date}</td></tr>
        ${booking.preferred_time ? `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;">🕐 Time</td><td style="padding:6px 0;font-weight:600;font-size:14px;">${booking.preferred_time}</td></tr>` : ''}
        ${booking.address ? `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;">📍 Address</td><td style="padding:6px 0;font-weight:600;font-size:14px;">${booking.address}</td></tr>` : ''}
        ${booking.project_type ? `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;">🏠 Project</td><td style="padding:6px 0;font-weight:600;font-size:14px;">${booking.project_type}</td></tr>` : ''}
      </table>
    </div>
    <p style="font-size:14px;color:#334155;line-height:1.6;"><strong>What to expect:</strong> Our flooring expert will measure your space, discuss options, and provide a detailed quote — all free, no obligation.</p>
    <p style="font-size:14px;color:#64748b;">Need to reschedule? Call us at <a href="tel:+16474281111" style="color:#f59e0b;">${PHONE}</a>.</p>
  `);

  return sendEmail({
    to: booking.customer_email,
    subject: `✅ Measurement Confirmed — ${date}`,
    html,
  });
}

export async function sendBookingAdminNotification({ booking }) {
  const date = booking.preferred_date ? new Date(booking.preferred_date).toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD';

  const html = emailWrapper('New Measurement Booking', `
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Customer</td><td style="padding:8px 0;font-weight:600;">${booking.customer_name || '—'}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Email</td><td style="padding:8px 0;"><a href="mailto:${booking.customer_email}" style="color:#f59e0b;">${booking.customer_email}</a></td></tr>
      ${booking.customer_phone ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Phone</td><td style="padding:8px 0;"><a href="tel:${booking.customer_phone}" style="color:#f59e0b;">${booking.customer_phone}</a></td></tr>` : ''}
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Date</td><td style="padding:8px 0;font-weight:600;">${date}</td></tr>
      ${booking.preferred_time ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Time</td><td style="padding:8px 0;">${booking.preferred_time}</td></tr>` : ''}
      ${booking.address ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Address</td><td style="padding:8px 0;">${booking.address}</td></tr>` : ''}
      ${booking.project_type ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Project</td><td style="padding:8px 0;">${booking.project_type}</td></tr>` : ''}
      ${booking.notes ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Notes</td><td style="padding:8px 0;">${booking.notes}</td></tr>` : ''}
    </table>
    <p style="margin-top:12px;font-size:13px;color:#94a3b8;">Reply to this email to contact the customer.</p>
  `);

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `📐 New Booking: ${booking.customer_name || 'Unknown'} — ${date}`,
    html,
    replyTo: booking.customer_email,
  });
}
