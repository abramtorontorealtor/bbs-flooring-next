// Product documents (Docs P3, Sep 14 2026) — manufacturer PDFs (TDS, SDS,
// warranty, install guide, care, certs…) mirrored into the Supabase Storage
// bucket `docs` and indexed in `product_documents` (memory/DOCS-RESOURCE-PLAN.md).
//
// Resolution rules (same as the plan):
//   flooring PDP      = docs where brand matches AND (scope='brand' OR scope='collection' + same collection)
//   supplies family   = brand-level ∪ scope='supply_family' (family = variant_group / family slug)
//                       ∪ scope='supply' (supply_code ∈ member codes)
// PDFs are served from OUR domain at /docs/<hosted_path> (next.config.mjs
// rewrite → public bucket) so the rankings/citations accrue to bbsflooring.ca.
// Server-only: the anon role has column-level SELECT on this table (source_url
// is deliberately NOT readable — supplier hosts never reach the browser).

import { cache } from 'react';
import { getSupabaseServerClient } from '@/lib/supabase';

export const DOCS_BASE_PATH = '/docs';

const COLUMNS = 'id, scope, brand, collection, family, supply_code, doc_type, title, lang, hosted_path, sha256, pages, bytes, sort';

// Display order + labels. Buyer-facing first (warranty/install/care), then the
// installer/spec sheets, then certs + marketing.
export const DOC_TYPE_META = {
  warranty:           { label: 'Warranty',              short: 'Warranty',  order: 10 },
  install_guide:      { label: 'Installation Guide',    short: 'Install',   order: 20 },
  care_maintenance:   { label: 'Care & Maintenance',    short: 'Care',      order: 30 },
  spec_sheet:         { label: 'Spec Sheet',            short: 'Spec',      order: 40 },
  tds:                { label: 'Technical Data Sheet',  short: 'TDS',       order: 50 },
  sds:                { label: 'Safety Data Sheet',     short: 'SDS',       order: 60 },
  coverage_chart:     { label: 'Coverage Chart',        short: 'Coverage',  order: 70 },
  colour_chart:       { label: 'Colour Chart',          short: 'Colours',   order: 80 },
  cert:               { label: 'Certification',         short: 'Cert',      order: 90 },
  arch_spec:          { label: 'Architectural Spec',    short: 'Arch Spec', order: 100 },
  brochure_catalogue: { label: 'Brochure / Catalogue',  short: 'Brochure',  order: 110 },
  sell_sheet:         { label: 'Product Sheet',         short: 'Sheet',     order: 120 },
  info:               { label: 'Product Information',   short: 'Info',      order: 130 },
  video:              { label: 'Video',                 short: 'Video',     order: 140 },
  other:              { label: 'Document',              short: 'PDF',       order: 150 },
};

const LANG_LABEL = { en: null, fr: 'Français', multi: 'EN / FR', es: 'Español' };

export function docHref(hostedPath) {
  if (!hostedPath) return null;
  return `${DOCS_BASE_PATH}/${hostedPath.replace(/^\/+/, '')}`;
}

export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
}

function normalise(rows, { preferScopes = [] } = {}) {
  // Dedupe identical files (same sha256) that were attached at several levels —
  // keep the most specific scope. Drop anything without a hosted file.
  const rank = (scope) => {
    const i = preferScopes.indexOf(scope);
    return i === -1 ? preferScopes.length : i;
  };
  const bySha = new Map();
  for (const r of rows || []) {
    if (!r?.hosted_path || !r?.title) continue;
    const key = r.sha256 || r.hosted_path;
    const prev = bySha.get(key);
    if (!prev || rank(r.scope) < rank(prev.scope)) bySha.set(key, r);
  }
  // Brand-level "generic" documents (e.g. a tool warranty on an adhesive page)
  // only fill gaps: when a more specific doc of the same type exists, drop the
  // brand-level one. Certs / brochures / catalogues are brand-wide by nature
  // and always stay.
  const specificTypes = new Set([...bySha.values()].filter((r) => r.scope !== 'brand').map((r) => r.doc_type));
  const ALWAYS_KEEP = new Set(['cert', 'brochure_catalogue', 'colour_chart', 'arch_spec']);
  const kept = [...bySha.values()].filter((r) => !(r.scope === 'brand' && specificTypes.has(r.doc_type) && !ALWAYS_KEEP.has(r.doc_type)));
  const out = kept.map((r) => {
    const meta = DOC_TYPE_META[r.doc_type] || DOC_TYPE_META.other;
    return {
      id: r.id,
      scope: r.scope,
      type: r.doc_type,
      typeLabel: meta.label,
      typeShort: meta.short,
      title: String(r.title).trim(),
      lang: r.lang || 'en',
      langLabel: LANG_LABEL[r.lang] ?? (r.lang ? String(r.lang).toUpperCase() : null),
      pages: r.pages || null,
      bytes: r.bytes || null,
      size: formatBytes(r.bytes),
      href: docHref(r.hosted_path),
      hostedPath: r.hosted_path,
    };
  });
  out.sort((a, b) => {
    const ao = (DOC_TYPE_META[a.type] || DOC_TYPE_META.other).order;
    const bo = (DOC_TYPE_META[b.type] || DOC_TYPE_META.other).order;
    if (ao !== bo) return ao - bo;
    // English before French within a type, then the loader's sort, then title.
    const al = a.lang === 'fr' ? 1 : 0, bl = b.lang === 'fr' ? 1 : 0;
    if (al !== bl) return al - bl;
    return a.title.localeCompare(b.title);
  });
  return out;
}

/**
 * Documents for a flooring product page. Pass the PARENT product for variant
 * families (brand + collection are what matter). Returns [] on any failure so
 * the PDP never breaks because of the docs block.
 */
export const getProductDocuments = cache(async (product) => {
  try {
    const brand = product?.brand;
    if (!brand) return [];
    const supabase = getSupabaseServerClient();
    if (!supabase) return [];
    const collection = product.collection || null;
    const or = collection
      ? `scope.eq.brand,and(scope.eq.collection,collection.eq."${String(collection).replace(/"/g, '\\"')}")`
      : 'scope.eq.brand';
    const { data, error } = await supabase
      .from('product_documents')
      .select(COLUMNS)
      .eq('brand', brand)
      .eq('active', true)
      .not('hosted_path', 'is', null)
      .or(or)
      .order('sort', { ascending: true })
      .limit(60);
    if (error) return [];
    return normalise(data, { preferScopes: ['collection', 'brand'] });
  } catch {
    return [];
  }
});

/**
 * Documents for a supplies family page (lib/supplyFamilies.js family object:
 * { slug, brand, items:[{code}] }).
 */
export const getSupplyFamilyDocuments = cache(async (family) => {
  try {
    const brand = family?.brand;
    if (!brand) return [];
    const supabase = getSupabaseServerClient();
    if (!supabase) return [];
    const codes = (family.items || []).map((i) => i.code).filter(Boolean);
    const q = (v) => `"${String(v).replace(/"/g, '\\"')}"`;
    const parts = ['scope.eq.brand'];
    if (family.slug) parts.push(`and(scope.eq.supply_family,family.eq.${q(family.slug)})`);
    if (codes.length) parts.push(`and(scope.eq.supply,supply_code.in.(${codes.map(q).join(',')}))`);
    const { data, error } = await supabase
      .from('product_documents')
      .select(COLUMNS)
      .eq('brand', brand)
      .eq('active', true)
      .not('hosted_path', 'is', null)
      .or(parts.join(','))
      .order('sort', { ascending: true })
      .limit(60);
    if (error) return [];
    return normalise(data, { preferScopes: ['supply', 'supply_family', 'brand'] });
  } catch {
    return [];
  }
});

// schema.org DigitalDocument nodes live in lib/seo.js (pure, client-safe) so
// the client FAQSection → lib/seo import never pulls the server client in.
export { documentsToSchema } from '@/lib/seo';
