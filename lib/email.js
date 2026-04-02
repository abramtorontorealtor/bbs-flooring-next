/**
 * SendGrid email utility for BBS Flooring.
 * Server-side only — uses SENDGRID_API_KEY env var.
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
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;width:100px;">Name</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#1e293b;">${esc(name)}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Email</td><td style="padding:8px 0;font-size:14px;"><a href="mailto:${esc(email)}" style="color:#f59e0b;">${esc(email)}</a></td></tr>
      ${phone ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Phone</td><td style="padding:8px 0;font-size:14px;"><a href="tel:${esc(phone)}" style="color:#f59e0b;">${esc(phone)}</a></td></tr>` : ''}
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Source</td><td style="padding:8px 0;font-size:14px;color:#64748b;">${esc(source) || 'contact_form'}</td></tr>
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

  // Build cost breakdown rows from flat fields (NOT items array — quotes have individual cost fields)
  const breakdownRows = [];
  if (quote.flooring_cost > 0) {
    breakdownRows.push({ label: `${esc(quote.product_name) || 'Flooring'} — ${quote.square_footage || '—'} sqft`, amount: quote.flooring_cost });
  }
  if (quote.installation_cost > 0) {
    breakdownRows.push({ label: 'Professional Installation', amount: quote.installation_cost });
  }
  if (quote.removal_cost > 0) {
    breakdownRows.push({ label: `Old Floor Removal (${esc(quote.removal_type) || 'standard'})`, amount: quote.removal_cost });
  }
  if (quote.baseboard_cost > 0) {
    breakdownRows.push({ label: 'Baseboards', amount: quote.baseboard_cost });
  }
  if (quote.shoe_moulding_cost > 0) {
    breakdownRows.push({ label: 'Shoe Moulding', amount: quote.shoe_moulding_cost });
  }
  if (quote.delivery_cost > 0) {
    breakdownRows.push({ label: 'Delivery', amount: quote.delivery_cost });
  }

  const rowsHtml = breakdownRows.map(r => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#334155;">${r.label}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-size:14px;text-align:right;font-weight:600;">$${(r.amount || 0).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = emailWrapper('Your Flooring Quote', `
    <p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${esc(quote.customer_name) || 'there'},</p>
    <p style="font-size:15px;color:#334155;line-height:1.6;">Here's the quote you requested${isMember ? ' <span style="color:#f59e0b;font-weight:600;">(Member Pricing Applied)</span>' : ''}:</p>
    ${quote.product_name ? `<p style="font-size:14px;color:#64748b;margin-bottom:4px;">Product: <strong style="color:#1e293b;">${esc(quote.product_name)}</strong></p>` : ''}
    ${quote.square_footage ? `<p style="font-size:14px;color:#64748b;margin-bottom:16px;">Area: <strong style="color:#1e293b;">${quote.square_footage} sqft</strong>${quote.price_per_sqft ? ` @ $${Number(quote.price_per_sqft).toFixed(2)}/sqft` : ''}</p>` : ''}
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <thead>
        <tr style="background:#f8fafc;">
          <th style="padding:10px 8px;text-align:left;font-size:13px;color:#64748b;border-bottom:2px solid #e2e8f0;">Description</th>
          <th style="padding:10px 8px;text-align:right;font-size:13px;color:#64748b;border-bottom:2px solid #e2e8f0;">Amount</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
      ${quote.tax > 0 ? `
      <tr>
        <td style="padding:10px 8px;text-align:right;font-size:14px;color:#64748b;">HST (13%)</td>
        <td style="padding:10px 8px;text-align:right;font-size:14px;color:#64748b;">$${(quote.tax || 0).toFixed(2)}</td>
      </tr>` : ''}
      <tr>
        <td style="padding:14px 8px;text-align:right;font-size:16px;font-weight:700;color:#1e293b;border-top:2px solid #1e293b;">Estimated Total</td>
        <td style="padding:14px 8px;text-align:right;font-size:20px;font-weight:700;color:#f59e0b;border-top:2px solid #1e293b;">$${(quote.total || 0).toFixed(2)}</td>
      </tr>
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
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Customer</td><td style="padding:8px 0;font-weight:600;">${esc(quote.customer_name) || '—'}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Email</td><td style="padding:8px 0;"><a href="mailto:${esc(quote.customer_email)}" style="color:#f59e0b;">${esc(quote.customer_email)}</a></td></tr>
      ${quote.customer_phone ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Phone</td><td style="padding:8px 0;"><a href="tel:${esc(quote.customer_phone)}" style="color:#f59e0b;">${esc(quote.customer_phone)}</a></td></tr>` : ''}
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Total</td><td style="padding:8px 0;font-size:18px;font-weight:700;color:#f59e0b;">$${(quote.total || 0).toFixed(2)}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Member</td><td style="padding:8px 0;">${isMember ? '✅ Yes' : '❌ No'}</td></tr>
      ${quote.product_name ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Product</td><td style="padding:8px 0;">${esc(quote.product_name)}</td></tr>` : ''}
      ${quote.square_footage ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Area</td><td style="padding:8px 0;">${quote.square_footage} sqft</td></tr>` : ''}
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bbsflooring.ca';

function bookingDetailsBlock(booking) {
  const date = booking.preferred_date ? new Date(booking.preferred_date + 'T12:00:00').toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD';
  const address = booking.customer_address || booking.address;
  const project = booking.flooring_type || booking.project_type;
  return `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:16px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">📅 Date</td><td style="padding:6px 0;font-weight:600;font-size:14px;">${date}</td></tr>
        ${booking.preferred_time ? `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;">🕐 Time</td><td style="padding:6px 0;font-weight:600;font-size:14px;">${esc(booking.preferred_time)}</td></tr>` : ''}
        ${address ? `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;">📍 Address</td><td style="padding:6px 0;font-weight:600;font-size:14px;">${esc(address)}</td></tr>` : ''}
        ${project ? `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;">🏠 Project</td><td style="padding:6px 0;font-weight:600;font-size:14px;">${esc(project)}</td></tr>` : ''}
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
        ${item.boxes_required || '—'} box${(item.boxes_required || 0) !== 1 ? 'es' : ''}
        <br/><span style="color:#94a3b8;font-size:12px;">${item.actual_sqft ? Number(item.actual_sqft).toFixed(1) + ' sq.ft' : ''}</span>
      </td>
      <td style="padding:10px 8px;text-align:center;font-size:14px;color:#334155;">$${(item.price_per_sqft || 0).toFixed(2)}/sqft</td>
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
  const deliveryLabel = order.delivery_preference === 'delivery' ? '🚚 Delivery' : '🏪 In-store pickup';

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
      <p style="font-size:15px;color:#334155;line-height:1.6;margin-top:20px;">Once we receive your e-Transfer, we'll confirm your order and arrange ${order.delivery_preference === 'delivery' ? 'delivery' : 'pickup'}.</p>
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
  const html = emailWrapper('Order Received!', `
    <p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${esc(order.customer_name) || 'there'},</p>
    <p style="font-size:15px;color:#334155;line-height:1.6;">Thank you for your order! Your payment has been authorized and we're now verifying stock availability.</p>
    ${buildOrderNumberBlock(order.order_number)}
    <div style="background:#eff6ff;padding:20px 24px;border-radius:12px;margin:24px 0;border:1px solid #bfdbfe;">
      <h3 style="color:#1e40af;margin:0 0 12px;font-size:17px;">📋 What Happens Next?</h3>
      <ol style="color:#334155;line-height:2;margin:0;padding-left:20px;">
        <li><strong>Stock verification</strong> — Our team is confirming your items are in stock.</li>
        <li><strong>Order confirmation</strong> — Once stock is verified, we'll finalize your payment and send a confirmation email.</li>
        <li><strong>${order.delivery_preference === 'delivery' ? 'Delivery scheduling' : 'Pickup coordination'}</strong> — We'll contact you to arrange ${order.delivery_preference === 'delivery' ? 'a delivery date' : 'your pickup time'}.</li>
      </ol>
    </div>
    <h3 style="color:#1e293b;font-size:16px;margin:24px 0 8px;">Order Summary</h3>
    ${buildOrderItemsTable(order.items)}
    ${buildOrderTotals(order)}
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;margin:16px 0;">
      <p style="margin:0 0 8px;font-size:14px;color:#64748b;">🚛 <strong style="color:#334155;">Delivery method:</strong> ${deliveryLabel}</p>
      <p style="margin:0;font-size:14px;color:#64748b;">💳 <strong style="color:#334155;">Payment:</strong> Credit card — authorized (pending stock confirmation)</p>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="tel:+16474281111" style="display:inline-block;background:#f59e0b;color:#1e293b;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:16px;">Questions? Call ${PHONE}</a>
    </div>
    <p style="font-size:14px;color:#94a3b8;text-align:center;">Thank you for choosing BBS Flooring!</p>
  `);

  return sendEmail({
    to: order.customer_email,
    subject: `Order Received — ${esc(order.order_number)} | BBS Flooring`,
    html,
  });
}

/** Sent when admin confirms e-transfer payment via CRM */
export async function sendOrderPaymentConfirmed({ order }) {
  if (!order?.customer_email) return { success: false, reason: 'no_email' };

  const deliveryLabel = order.delivery_preference === 'delivery' ? '🚚 Delivery' : '🏪 In-store pickup';

  const html = emailWrapper('Payment Received — Order Confirmed!', `
    <p style="font-size:15px;color:#334155;line-height:1.6;">Hi ${esc(order.customer_name) || 'there'},</p>
    <p style="font-size:15px;color:#334155;line-height:1.6;">Great news! We've received your e-Transfer payment. Your order is now confirmed and we're getting it ready.</p>
    ${buildOrderNumberBlock(order.order_number)}
    ${buildOrderItemsTable(order.items)}
    ${buildOrderTotals(order)}
    <div style="background:#ecfdf5;border:1px solid #6ee7b7;border-radius:12px;padding:16px 20px;margin:16px 0;">
      <p style="margin:0 0 8px;font-size:14px;color:#065f46;">✅ <strong>Payment:</strong> Received</p>
      <p style="margin:0;font-size:14px;color:#065f46;">🚛 <strong>Delivery method:</strong> ${deliveryLabel}</p>
      ${order.delivery_preference === 'pickup' ? (order.pickup_address
        ? `<p style="margin:8px 0 0;font-size:14px;color:#065f46;">📍 <strong>Pickup at:</strong> ${esc(order.pickup_address)}</p>`
        : '<p style="margin:8px 0 0;font-size:14px;color:#065f46;">📍 <strong>Pickup location:</strong> We\'ll confirm the pickup address shortly.</p>'
      ) : ''}
    </div>
    <p style="font-size:15px;color:#334155;line-height:1.6;">We'll contact you to arrange ${order.delivery_preference === 'delivery' ? 'a delivery date' : 'your pickup time'}.</p>
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
  const deliveryLabel = order.delivery_preference === 'delivery' ? 'Delivery' : 'In-store pickup';
  const urgencyBanner = isEtransfer
    ? `<div style="background:#fef3c7;border:2px solid #f59e0b;border-radius:8px;padding:12px 16px;margin:0 0 16px;">
        <p style="margin:0;color:#92400e;font-size:14px;font-weight:700;">🏦 AWAITING E-TRANSFER — Confirm payment in CRM before marking confirmed.</p>
      </div>`
    : '';

  const itemsList = (order.items || []).map(item =>
    `${item.product_name || 'Item'} — ${item.boxes_required || '?'} boxes (${item.actual_sqft ? Number(item.actual_sqft).toFixed(1) : '?'} sqft) — $${(item.line_total || 0).toFixed(2)}`
  ).join('\n');

  const html = emailWrapper('New Order Received', `
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
    <p style="margin-top:12px;font-size:13px;color:#94a3b8;">Reply to this email to contact the customer.</p>
  `);

  const subjectPrefix = isEtransfer ? '🏦 [PENDING E-TRANSFER]' : '💳 [NEW ORDER]';
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
      body: `Great news! Your order is now being prepared for ${order.delivery_preference === 'pickup' ? 'pickup' : 'delivery'}.`,
      detail: order.delivery_preference === 'pickup'
        ? (order.pickup_address
          ? `<strong>Pickup at:</strong> ${esc(order.pickup_address)}<br/>We'll let you know when it's ready.`
          : `We're confirming the pickup location and will email you shortly.`)
        : `We're getting everything ready and will contact you to schedule delivery.`,
    },
    shipped: {
      title: order.delivery_preference === 'pickup' ? 'Ready for Pickup!' : 'Your Order Has Been Shipped!',
      subject: order.delivery_preference === 'pickup'
        ? `Ready for Pickup — ${esc(order.order_number)}`
        : `Order Shipped — ${esc(order.order_number)}`,
      body: order.delivery_preference === 'pickup'
        ? `Your order is ready for pickup!`
        : `Your order is on its way!`,
      detail: order.delivery_preference === 'pickup'
        ? (order.pickup_address
          ? `<strong>Pickup address:</strong> ${esc(order.pickup_address)}<br/><br/>Please bring a valid ID matching the order name. Call us if you need to arrange a specific pickup time.`
          : `Please call us at ${PHONE} to confirm your pickup time and location.`)
        : `We'll contact you to confirm the delivery window. Please ensure someone is available to receive the delivery.`,
    },
    delivered: {
      title: order.delivery_preference === 'pickup' ? 'Order Complete — Thank You!' : 'Order Delivered — Thank You!',
      subject: `Order Complete — Thank You! | ${esc(order.order_number)}`,
      body: `Your order has been ${order.delivery_preference === 'pickup' ? 'picked up' : 'delivered'}. Thank you for choosing BBS Flooring!`,
      detail: `<p>We hope you love your new flooring! If you have any questions about installation or care, don't hesitate to reach out.</p>
        <p style="margin-top:12px;">If you're happy with your purchase, we'd really appreciate a <a href="https://g.page/r/CfPCWNqWaI3iEAE/review" style="color:#f59e0b;font-weight:600;">Google review</a> — it helps other homeowners find us. 🙏</p>`,
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
