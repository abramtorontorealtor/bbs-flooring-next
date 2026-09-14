import { FileText, Download } from 'lucide-react';
import { PHONE_DISPLAY, PHONE_HREF } from '@/lib/service-constants';

// "Documents & Downloads" — manufacturer PDFs for a product / supplies family.
// Pure markup (no hooks) so it renders server-side inside both server pages and
// the client PDP; every link is a real <a href="/docs/…"> (crawlable, and GA4
// enhanced measurement fires `file_download` on .pdf links automatically).
//
// Grouped by document type so a buyer scanning for "Warranty" finds it in one
// glance; French copies sit under the English one with a language tag.

const BADGE_TONE = {
  warranty: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  install_guide: 'bg-amber-50 text-amber-800 ring-amber-200',
  care_maintenance: 'bg-sky-50 text-sky-800 ring-sky-200',
  sds: 'bg-rose-50 text-rose-800 ring-rose-200',
  tds: 'bg-slate-100 text-slate-700 ring-slate-200',
  spec_sheet: 'bg-slate-100 text-slate-700 ring-slate-200',
  cert: 'bg-violet-50 text-violet-800 ring-violet-200',
};

// Mobile prefix ("Warranty: …") only when the title itself doesn't already say
// what it is — "Warranty Document Adhesive Bond" needs no "Warranty:" in front.
function titleCarriesType(d) {
  const t = (d.title || '').toLowerCase();
  const words = [d.typeLabel, d.typeShort, d.type === 'tds' ? 'technical data' : null, d.type === 'tds' ? 'fiche technique' : null,
    d.type === 'sds' ? 'safety data' : null, d.type === 'sds' ? 'feuillet de s' : null, d.type === 'warranty' ? 'garantie' : null,
    d.type === 'install_guide' ? 'install' : null, d.type === 'care_maintenance' ? 'care' : null, d.type === 'care_maintenance' ? 'maintenance' : null,
    d.type === 'cert' ? 'certif' : null, d.type === 'brochure_catalogue' ? 'catalog' : null, d.type === 'brochure_catalogue' ? 'brochure' : null,
    d.type === 'spec_sheet' ? 'spec' : null, d.type === 'sell_sheet' ? 'sheet' : null, d.type === 'info' ? 'information' : null]
    .filter(Boolean).map((w) => w.toLowerCase());
  return words.some((w) => t.includes(w));
}

export default function DocumentsDownloads({
  documents = [],
  brand = null,
  subject = null,
  className = 'mt-12',
  headingId = 'documents-downloads-heading',
  compact = false,
}) {
  const docs = (documents || []).filter((d) => d?.href && d?.title);
  if (!docs.length) return null;

  const who = brand ? `${brand}` : 'the manufacturer';
  const what = subject ? ` for ${subject}` : '';
  // Long lists (Roberts/Bona families carry 10–14 files): show the first
  // VISIBLE rows, tuck the rest behind a native <details> — no JS, still SSR'd
  // as real links for crawlers.
  const VISIBLE = 8;
  const primary = docs.slice(0, VISIBLE);
  const overflow = docs.slice(VISIBLE);

  const Row = ({ d, first }) => (
    <li className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
      <span
        className={`hidden sm:inline-flex shrink-0 w-24 justify-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${first ? (BADGE_TONE[d.type] || 'bg-slate-100 text-slate-700 ring-slate-200') : 'invisible'}`}
        aria-hidden={first ? undefined : 'true'}
      >
        {d.typeShort}
      </span>
      <FileText className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
      <a
        href={d.href}
        target="_blank"
        rel="noopener"
        className="flex-1 min-w-0 text-sm font-medium text-slate-800 hover:text-amber-700 hover:underline line-clamp-2 sm:line-clamp-none sm:truncate"
        title={`${d.typeLabel}: ${d.title}`}
        data-doc-type={d.type}
      >
        {!titleCarriesType(d) && (
          <span className="sm:hidden text-slate-500 font-normal">{d.typeLabel}: </span>
        )}
        {d.title}
        {d.lang === 'fr' && <span className="md:hidden text-slate-500 font-normal"> (FR)</span>}
      </a>
      <span className="hidden md:inline text-xs text-slate-500 shrink-0 tabular-nums">
        {[d.langLabel, d.pages ? `${d.pages} pg` : null, d.size].filter(Boolean).join(' · ')}
      </span>
      <a
        href={d.href}
        download
        className="shrink-0 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:text-amber-700 hover:bg-amber-50"
        aria-label={`Download ${d.typeLabel}: ${d.title}`}
      >
        <Download className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">PDF</span>
      </a>
    </li>
  );
  const renderRows = (list, prevType) => {
    let last = prevType;
    return list.map((d) => {
      const first = d.type !== last;
      last = d.type;
      return <Row key={d.id ?? d.href} d={d} first={first} />;
    });
  };

  return (
    <section
      className={`${className} max-w-3xl scroll-mt-24`}
      aria-labelledby={headingId}
      data-bbs-docs={docs.length}
    >
      <h2 id={headingId} className="text-xl font-bold text-slate-900 mb-1">Documents &amp; Downloads</h2>
      <p className="text-sm text-slate-600 mb-4">
        Official {who} documents{what} — the same warranty, installation and technical sheets our installers work from. PDFs open in a new tab.
      </p>
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden bg-white">
        {renderRows(primary, null)}
      </ul>
      {overflow.length > 0 && (
        <details className="mt-2 group">
          <summary className="cursor-pointer list-none text-sm font-medium text-amber-700 hover:text-amber-800 select-none">
            <span className="group-open:hidden">Show {overflow.length} more document{overflow.length === 1 ? '' : 's'} ↓</span>
            <span className="hidden group-open:inline">Show fewer ↑</span>
          </summary>
          <ul className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden bg-white">
            {renderRows(overflow, primary[primary.length - 1]?.type)}
          </ul>
        </details>
      )}
      {!compact && (
        <p className="mt-3 text-xs text-slate-500">
          Need a document that isn&apos;t listed, or help reading a spec? Call <a href={PHONE_HREF} className="font-medium text-slate-700 hover:text-amber-700">{PHONE_DISPLAY}</a>{' '}— we&apos;ll pull it from the manufacturer for you.
        </p>
      )}
    </section>
  );
}
