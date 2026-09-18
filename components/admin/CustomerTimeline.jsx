'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  Eye, Calculator, FileText, ShoppingCart, Phone, MessageSquare, Mail,
  Calendar, Package, MousePointerClick, Globe, Loader2, History, RefreshCw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * Customer activity timeline for the CRM lead dialog.
 * Fetches /api/admin/customer-timeline (admin-only) by email/phone and renders
 * summary chips + a newest-first timeline: browsing (site_events), quotes,
 * bookings, orders, contact forms, Grasshopper calls/texts, info@ emails.
 */

const ICONS = {
  page_view: Globe,
  site: MousePointerClick,
  quote: Calculator,
  saved_quote: Calculator,
  booking: Calendar,
  order: Package,
  contact: FileText,
  call: Phone,
  text: MessageSquare,
  email: Mail,
};

const COLORS = {
  page_view: 'text-slate-400',
  site: 'text-amber-600',
  quote: 'text-blue-600',
  saved_quote: 'text-blue-500',
  booking: 'text-purple-600',
  order: 'text-green-600',
  contact: 'text-slate-600',
  call: 'text-emerald-600',
  text: 'text-emerald-600',
  email: 'text-sky-600',
};

function fmtTime(iso) {
  try { return format(new Date(iso), 'MMM d, yyyy · h:mm a'); } catch { return iso; }
}

function Chip({ label, value, hidden }) {
  if (hidden) return null;
  return (
    <div className="rounded-lg border bg-slate-50 px-3 py-1.5 text-xs">
      <span className="text-slate-500">{label}</span>{' '}
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}

export default function CustomerTimeline({ email, phone }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPageViews, setShowPageViews] = useState(false);
  const [nonce, setNonce] = useState(0);

  const hasKey = Boolean((email && email.includes('@')) || (phone && phone.replace(/\D/g, '').length >= 10));

  useEffect(() => {
    if (!hasKey) return;
    const controller = new AbortController();
    const qs = new URLSearchParams();
    if (email) qs.set('email', email);
    if (phone) qs.set('phone', phone);
    fetch(`/api/admin/customer-timeline?${qs.toString()}`, { signal: controller.signal, cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        setData(await r.json());
      })
      .catch((e) => { if (e.name !== 'AbortError') setError(e.message || 'Failed'); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [email, phone, hasKey, nonce]);

  if (!hasKey) return null;

  const s = data?.summary;
  const events = (data?.events || []).filter((e) => showPageViews || e.type !== 'page_view');
  const hiddenPageViews = (data?.events || []).filter((e) => e.type === 'page_view').length;

  return (
    <div className="border rounded-xl p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <History className="w-4 h-4 text-slate-500" /> Customer Timeline
        </h3>
        <div className="flex items-center gap-2">
          {hiddenPageViews > 0 && (
            <button
              type="button"
              onClick={() => setShowPageViews((v) => !v)}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              {showPageViews ? 'Hide' : 'Show'} {hiddenPageViews} page views
            </button>
          )}
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => { setLoading(true); setError(null); setNonce((n) => n + 1); }} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {loading && !data && (
        <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading activity…
        </div>
      )}
      {error && <p className="text-sm text-red-600">Couldn&apos;t load timeline ({error}).</p>}

      {s && (
        <>
          <div className="flex flex-wrap gap-2 mb-3">
            <Chip label="Page views" value={s.page_views} />
            <Chip label="Products viewed" value={s.pdp_views} />
            <Chip label="Calculator" value={s.calculator_runs} hidden={!s.calculator_runs} />
            <Chip label="Downloads" value={s.doc_downloads} hidden={!s.doc_downloads} />
            <Chip label="Quotes" value={s.quotes} hidden={!s.quotes} />
            <Chip label="Bookings" value={s.bookings} hidden={!s.bookings} />
            <Chip label="Orders" value={`${s.orders}${s.order_total ? ` · $${Math.round(s.order_total).toLocaleString()}` : ''}`} hidden={!s.orders} />
            <Chip label="Calls" value={s.calls} hidden={!s.calls} />
            <Chip label="Texts" value={s.texts} hidden={!s.texts} />
            <Chip label="Emails" value={s.emails} hidden={!s.emails} />
            <Chip label="First touch" value={s.first_touch} hidden={!s.first_touch} />
            <Chip label="First seen" value={s.first_seen ? format(new Date(s.first_seen), 'MMM d, yyyy') : null} hidden={!s.first_seen} />
          </div>

          {s.top_products?.length > 0 && (
            <div className="mb-3 text-xs text-slate-600">
              <span className="text-slate-500">Most viewed:</span>{' '}
              {s.top_products.map((p) => (
                <Badge key={p.name} variant="outline" className="mr-1 mb-1 font-normal">{p.name} ×{p.views}</Badge>
              ))}
            </div>
          )}

          {events.length === 0 ? (
            <p className="text-sm text-slate-500 py-2">
              No activity found{s.visitors === 0 ? ' — no browsing linked yet (tracking started Sep 18, 2026)' : ''}.
            </p>
          ) : (
            <ol className="relative border-l border-slate-200 ml-2 space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {events.map((e, i) => {
                const Icon = ICONS[e.type] || Eye;
                const color = COLORS[e.type] || 'text-slate-500';
                const href = e.type === 'site' && e.meta?.slug ? `/products/${e.meta.slug}` : (e.type === 'page_view' && e.meta?.path ? e.meta.path : null);
                return (
                  <li key={`${e.source}-${e.meta?.id || e.meta?.path || i}-${e.at}`} className="ml-4">
                    <span className={`absolute -left-[9px] mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-2 ring-slate-100 ${color}`}>
                      <Icon className="w-3 h-3" />
                    </span>
                    <div className="text-xs text-slate-400">{fmtTime(e.at)}</div>
                    <div className="text-sm text-slate-800">
                      {href ? (
                        <a href={href} target="_blank" rel="noopener" className="hover:underline">{e.title}</a>
                      ) : e.meta?.link ? (
                        <a href={e.meta.link} target="_blank" rel="noopener" className="hover:underline">{e.title}</a>
                      ) : e.title}
                    </div>
                    {e.detail && <div className="text-xs text-slate-500 mt-0.5 break-words">{e.detail}</div>}
                  </li>
                );
              })}
            </ol>
          )}
          {s.site_events_truncated && (
            <p className="text-[11px] text-slate-400 mt-2">Showing the most recent 300 browsing events.</p>
          )}
        </>
      )}
    </div>
  );
}
