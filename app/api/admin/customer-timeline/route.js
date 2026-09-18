import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { normalizePhone } from '@/lib/identify';

/**
 * GET /api/admin/customer-timeline?email=&phone=
 *
 * Admin-only. Builds one chronological activity timeline for a person by
 * matching lower(email) / last-10-digit phone across:
 *   visitor_identities → site_events (anonymous browsing linked at form submit)
 *   quotes, saved_quotes, bookings, orders, contact_leads (submissions)
 *   comms_events (Grasshopper calls/texts), emails (info@ inbox/sent)
 *
 * Returns { summary, events[] } — events sorted newest first, capped.
 */

const MAX_EVENTS = 400;
const SITE_EVENT_LIMIT = 300;

function lowerEmail(e) {
  const s = typeof e === 'string' ? e.trim().toLowerCase() : '';
  return s.includes('@') ? s : null;
}

function phoneVariants(digits10) {
  if (!digits10) return [];
  return [digits10, `1${digits10}`, `+1${digits10}`];
}

function ev(type, at, title, detail = null, meta = null, source = null) {
  if (!at) return null;
  return { type, at, title, detail, meta, source };
}

function money(n) {
  const v = Number(n);
  if (!Number.isFinite(v) || v <= 0) return null;
  return `$${v.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export async function GET(request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const email = lowerEmail(searchParams.get('email'));
  const phone = normalizePhone(searchParams.get('phone'));

  if (!email && !phone) {
    return NextResponse.json({ error: 'email or phone required' }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const phones = phoneVariants(phone);

  // OR filter string for PostgREST: email match and/or phone match
  const orParts = (emailCol, phoneCol) => {
    const parts = [];
    if (email && emailCol) parts.push(`${emailCol}.ilike.${email}`);
    if (phone && phoneCol) parts.push(`${phoneCol}.in.(${phones.join(',')})`);
    return parts.join(',');
  };

  try {
    const [identities, quotes, savedQuotes, bookings, orders, contacts] = await Promise.all([
      supabase.from('visitor_identities').select('visitor_id, email, phone, name, source, created_at')
        .or(orParts('email', 'phone')).limit(50),
      supabase.from('quotes').select('id, customer_name, customer_email, customer_phone, product_name, square_footage, total, stair_total, status, lead_status, created_at, visitor_id')
        .or(orParts('customer_email', 'customer_phone')).order('created_at', { ascending: false }).limit(50),
      email
        ? supabase.from('saved_quotes').select('id, user_email, product_name, product_slug, sqft, total_estimate, status, lead_status, created_at, visitor_id')
            .ilike('user_email', email).order('created_at', { ascending: false }).limit(50)
        : Promise.resolve({ data: [] }),
      supabase.from('bookings').select('id, customer_name, customer_email, customer_phone, service_type, flooring_type, product_name, square_footage, quote_total, preferred_date, status, created_at, visitor_id')
        .or(orParts('customer_email', 'customer_phone')).order('created_at', { ascending: false }).limit(50),
      supabase.from('orders').select('id, order_number, customer_name, customer_email, customer_phone, total, status, payment_status, payment_method, items, created_at, cancelled_at, delivered_at, visitor_id')
        .or(orParts('customer_email', 'customer_phone')).order('created_at', { ascending: false }).limit(50),
      supabase.from('contact_leads').select('id, name, email, phone, customer_name, customer_email, customer_phone, message, source, status, lead_status, created_at, visitor_id')
        .or([orParts('email', 'phone'), orParts('customer_email', 'customer_phone')].filter(Boolean).join(','))
        .order('created_at', { ascending: false }).limit(50),
    ]);

    // Phone-format for comms_events (+1XXXXXXXXXX) and emails (array contains)
    const [comms, emailsIn, emailsOut] = await Promise.all([
      phone
        ? supabase.from('comms_events').select('id, event_type, event_subtype, direction, from_number, to_number, caller_name, transcription, is_voicemail, is_missed, event_time')
            .or(`from_number.in.(${phones.join(',')}),to_number.in.(${phones.join(',')})`)
            .order('event_time', { ascending: false }).limit(100)
        : Promise.resolve({ data: [] }),
      email
        ? supabase.from('emails').select('id, direction, from_address, from_name, subject, received_at, body_preview, category, web_link')
            .ilike('from_address', email).order('received_at', { ascending: false }).limit(100)
        : Promise.resolve({ data: [] }),
      email
        ? supabase.from('emails').select('id, direction, from_address, from_name, to_addresses, subject, received_at, body_preview, category, web_link')
            .contains('to_addresses', [email]).order('received_at', { ascending: false }).limit(100)
        : Promise.resolve({ data: [] }),
    ]);

    // Collect visitor ids from identities + any submission rows
    const visitorIds = new Set();
    for (const r of identities.data || []) if (r.visitor_id) visitorIds.add(r.visitor_id);
    for (const set of [quotes.data, savedQuotes.data, bookings.data, orders.data, contacts.data]) {
      for (const r of set || []) if (r?.visitor_id) visitorIds.add(r.visitor_id);
    }

    let siteEvents = [];
    if (visitorIds.size) {
      const { data } = await supabase.from('site_events')
        .select('id, visitor_id, event_type, path, product_slug, product_name, meta, referrer, utm, created_at')
        .in('visitor_id', [...visitorIds])
        .order('created_at', { ascending: false })
        .limit(SITE_EVENT_LIMIT);
      siteEvents = data || [];
    }

    const events = [];

    for (const q of quotes.data || []) {
      const total = money(q.total || q.stair_total);
      events.push(ev('quote', q.created_at, `Quote request — ${q.product_name || 'stairs'}`,
        [q.square_footage ? `${q.square_footage} sqft` : null, total, q.lead_status || q.status].filter(Boolean).join(' · '),
        { id: q.id }, 'quotes'));
    }
    for (const s of savedQuotes.data || []) {
      events.push(ev('saved_quote', s.created_at, `Saved quote — ${s.product_name || s.product_slug || ''}`,
        [s.sqft ? `${s.sqft} sqft` : null, money(s.total_estimate), s.lead_status || s.status].filter(Boolean).join(' · '),
        { id: s.id }, 'saved_quotes'));
    }
    for (const b of bookings.data || []) {
      events.push(ev('booking', b.created_at, `Booking — ${b.service_type || 'measurement'}`,
        [b.product_name || b.flooring_type, b.square_footage ? `${b.square_footage} sqft` : null, money(b.quote_total), b.preferred_date ? `prefers ${b.preferred_date}` : null, b.status].filter(Boolean).join(' · '),
        { id: b.id }, 'bookings'));
    }
    for (const o of orders.data || []) {
      const items = Array.isArray(o.items) ? o.items.map((i) => i?.product_name || i?.name).filter(Boolean).slice(0, 3).join(', ') : null;
      events.push(ev('order', o.created_at, `Order ${o.order_number}`,
        [money(o.total), o.payment_method, o.payment_status, o.status, items].filter(Boolean).join(' · '),
        { id: o.id }, 'orders'));
      if (o.cancelled_at) events.push(ev('order', o.cancelled_at, `Order ${o.order_number} cancelled`, null, { id: o.id }, 'orders'));
      if (o.delivered_at) events.push(ev('order', o.delivered_at, `Order ${o.order_number} delivered`, null, { id: o.id }, 'orders'));
    }
    for (const c of contacts.data || []) {
      events.push(ev('contact', c.created_at, `Contact form — ${c.source || 'website'}`,
        (c.message || '').slice(0, 200) || (c.lead_status || c.status || null),
        { id: c.id }, 'contact_leads'));
    }
    for (const c of comms.data || []) {
      const inbound = String(c.direction || '').toLowerCase() === 'inbound';
      const isText = /text|sms|message/i.test(`${c.event_type} ${c.event_subtype}`);
      const kind = isText ? 'text' : 'call';
      let title = isText ? (inbound ? 'Text received' : 'Text sent') : (inbound ? 'Call received' : 'Call placed');
      if (c.is_voicemail) title = 'Voicemail';
      else if (c.is_missed) title = 'Missed call';
      events.push(ev(kind, c.event_time, title, (c.transcription || '').slice(0, 240) || null, { id: c.id, number: inbound ? c.from_number : c.to_number }, 'comms_events'));
    }
    const seenEmail = new Set();
    for (const m of [...(emailsIn.data || []), ...(emailsOut.data || [])]) {
      if (seenEmail.has(m.id)) continue;
      seenEmail.add(m.id);
      const inbound = String(m.direction || '').toLowerCase() === 'inbound';
      events.push(ev('email', m.received_at, `${inbound ? 'Email from customer' : 'Email sent (info@)'} — ${m.subject || '(no subject)'}`,
        (m.body_preview || '').slice(0, 200) || null, { id: m.id, link: m.web_link || null, category: m.category }, 'emails'));
    }
    for (const s of siteEvents) {
      const meta = s.meta || {};
      let title;
      switch (s.event_type) {
        case 'pdp_view': title = `Viewed product — ${s.product_name || s.product_slug || s.path}`; break;
        case 'calculator': title = `Calculator — ${s.product_name || meta.product_name || ''}`.trim(); break;
        case 'doc_download': title = `Downloaded — ${meta.title || 'document'}`; break;
        case 'add_to_cart': title = `Added to cart — ${s.product_name || s.product_slug || ''}`; break;
        case 'sample_request': title = `Sample request — ${s.product_name || ''}`; break;
        case 'search': title = `Searched "${meta.query || ''}"`; break;
        case 'quote_saved': title = `Saved quote (site) — ${s.product_name || ''}`; break;
        case 'cta_click': title = `Tapped ${meta.cta || 'CTA'}`; break;
        case 'compare': title = 'Compared products'; break;
        default: title = `Visited ${s.path || '/'}`;
      }
      const bits = [];
      if (meta.sqft) bits.push(`${meta.sqft} sqft`);
      if (meta.total) bits.push(money(meta.total));
      if (meta.price_per_sqft) bits.push(`$${meta.price_per_sqft}/sqft`);
      if (s.event_type === 'page_view' && s.referrer && !/bbsflooring\.ca/.test(s.referrer)) bits.push(`from ${s.referrer.replace(/^https?:\/\//, '').slice(0, 60)}`);
      if (s.utm?.utm_source) bits.push(`utm ${s.utm.utm_source}/${s.utm.utm_medium || ''}${s.utm.utm_campaign ? ` · ${s.utm.utm_campaign}` : ''}`);
      events.push(ev(s.event_type === 'page_view' ? 'page_view' : 'site', s.created_at, title, bits.filter(Boolean).join(' · ') || null,
        { path: s.path, slug: s.product_slug, visitor_id: s.visitor_id }, 'site_events'));
    }

    const sorted = events.filter(Boolean).sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, MAX_EVENTS);

    const pdpViews = siteEvents.filter((s) => s.event_type === 'pdp_view');
    const productCounts = {};
    for (const s of pdpViews) {
      const k = s.product_name || s.product_slug;
      if (k) productCounts[k] = (productCounts[k] || 0) + 1;
    }
    const topProducts = Object.entries(productCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, views]) => ({ name, views }));
    const firstSeen = sorted.length ? sorted[sorted.length - 1].at : null;
    const lastSeen = sorted.length ? sorted[0].at : null;
    const firstUtm = [...siteEvents].reverse().find((s) => s.utm?.utm_source)?.utm || null;
    const firstRef = [...siteEvents].reverse().find((s) => s.referrer && !/bbsflooring\.ca/.test(s.referrer))?.referrer || null;

    const summary = {
      email, phone,
      visitors: visitorIds.size,
      page_views: siteEvents.filter((s) => s.event_type === 'page_view').length,
      pdp_views: pdpViews.length,
      calculator_runs: siteEvents.filter((s) => s.event_type === 'calculator').length,
      doc_downloads: siteEvents.filter((s) => s.event_type === 'doc_download').length,
      quotes: (quotes.data || []).length + (savedQuotes.data || []).length,
      bookings: (bookings.data || []).length,
      orders: (orders.data || []).length,
      order_total: (orders.data || []).filter((o) => o.status !== 'cancelled').reduce((a, o) => a + (Number(o.total) || 0), 0),
      contacts: (contacts.data || []).length,
      calls: (comms.data || []).filter((c) => !/text|sms|message/i.test(`${c.event_type} ${c.event_subtype}`)).length,
      texts: (comms.data || []).filter((c) => /text|sms|message/i.test(`${c.event_type} ${c.event_subtype}`)).length,
      emails: seenEmail.size,
      top_products: topProducts,
      first_seen: firstSeen,
      last_seen: lastSeen,
      first_touch: firstUtm ? `${firstUtm.utm_source}/${firstUtm.utm_medium || ''}${firstUtm.utm_campaign ? ` · ${firstUtm.utm_campaign}` : ''}` : (firstRef ? firstRef.replace(/^https?:\/\//, '').slice(0, 60) : null),
      site_events_truncated: siteEvents.length >= SITE_EVENT_LIMIT,
    };

    return NextResponse.json({ summary, events: sorted }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (e) {
    console.error('[customer-timeline]', e?.message || e);
    return NextResponse.json({ error: 'Failed to build timeline' }, { status: 500 });
  }
}
