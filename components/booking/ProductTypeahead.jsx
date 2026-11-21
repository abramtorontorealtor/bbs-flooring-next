'use client';

import { useEffect, useRef, useState } from 'react';

// Catalog type-ahead for booking forms. Reuses the cached, lean /api/products/grid
// payload (same source as the header search) and matches on name / brand / colour /
// collection / sku. Free text is always allowed — picking a suggestion just swaps in
// the exact product name so the lead carries a real SKU instead of "the grey one".
let gridCache = null;
let gridPromise = null;

function loadGrid() {
  if (gridCache) return Promise.resolve(gridCache);
  if (!gridPromise) {
    gridPromise = fetch('/api/products/grid')
      .then(r => (r.ok ? r.json() : []))
      .then(rows => {
        gridCache = (Array.isArray(rows) ? rows : [])
          .filter(p => p && p.name && !p.is_archived_variant)
          .map(p => ({
            name: p.name,
            brand: p.brand || '',
            category: p.category || '',
            image_url: p.image_url || null,
            _hay: [p.name, p.brand, p.colour, p.collection, p.sku, p.category, p.species]
              .filter(Boolean).join(' ').toLowerCase(),
          }));
        return gridCache;
      })
      .catch(() => { gridPromise = null; return []; });
  }
  return gridPromise;
}

function suggest(rows, query, limit = 6) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(t => t.length >= 2);
  if (!terms.length) return [];
  const scored = [];
  for (const p of rows) {
    let score = 0;
    for (const t of terms) {
      if (!p._hay.includes(t)) { score = 0; break; }
      score += p.name.toLowerCase().startsWith(t) ? 3 : p.name.toLowerCase().includes(t) ? 2 : 1;
    }
    if (score > 0) scored.push({ p, score });
  }
  scored.sort((a, b) => b.score - a.score || a.p.name.localeCompare(b.p.name));
  return scored.slice(0, limit).map(s => s.p);
}

export default function ProductTypeahead({ value, onChange, placeholder, inputClassName, id }) {
  const [rows, setRows] = useState(gridCache);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef(null);

  const ensureLoaded = () => { if (!rows) loadGrid().then(setRows); };

  useEffect(() => {
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const items = open && rows && value && value.length >= 2 ? suggest(rows, value) : [];

  const pick = (p) => { onChange(p.name); setOpen(false); setActive(-1); };

  const onKeyDown = (e) => {
    if (!items.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, items.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); pick(items[active]); }
    else if (e.key === 'Escape') { setOpen(false); }
  };

  return (
    <div ref={wrapRef} className="relative">
      <input
        id={id}
        type="text"
        autoComplete="off"
        role="combobox"
        aria-expanded={items.length > 0}
        aria-autocomplete="list"
        className={inputClassName}
        placeholder={placeholder}
        value={value}
        onFocus={() => { ensureLoaded(); setOpen(true); }}
        onChange={(e) => { onChange(e.target.value); setOpen(true); setActive(-1); ensureLoaded(); }}
        onKeyDown={onKeyDown}
      />
      {items.length > 0 && (
        <ul role="listbox" className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          {items.map((p, i) => (
            <li
              key={p.name}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => { e.preventDefault(); pick(p); }}
              onMouseEnter={() => setActive(i)}
              className={`flex items-center gap-3 px-3 py-2 cursor-pointer text-sm ${i === active ? 'bg-amber-50' : ''}`}
            >
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image_url} alt="" loading="lazy" className="w-9 h-9 rounded object-cover flex-shrink-0 bg-slate-100" />
              ) : (
                <span className="w-9 h-9 rounded bg-slate-100 flex-shrink-0" />
              )}
              <span className="min-w-0">
                <span className="block truncate font-medium text-slate-800">{p.name}</span>
                {(p.brand || p.category) && (
                  <span className="block truncate text-xs text-slate-500">{[p.brand, p.category].filter(Boolean).join(' · ')}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
