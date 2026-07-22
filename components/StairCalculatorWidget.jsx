'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { validatePhone } from '@/lib/validations';
import { GOOGLE_RATING, GOOGLE_REVIEW_COUNT } from '@/lib/service-constants';
import { getMonthlyPayment, FINANCEIT_LINKS } from '@/lib/financing';

// ─── Pricing constants (single source of truth) ───────────────────────────────
const P = {
  tread_refinish: 125,
  tread_straight: 185,
  tread_pie: 225,
  post: 150,
  picket: 25,
  stringer_white: 350,
  stringer_stained: 900,
  nosing_refinish: 20,
  nosing_new: 25,
  railing_refinish: 25,
  railing_new: 50,
  landing_small: 300,
  landing_large: 600,
};

const SPECIES_OPTIONS = [
  { value: 'red_oak', label: 'Red Oak (Standard)', note: '' },
  { value: 'white_oak', label: 'White Oak', note: 'Contact us for pricing' },
  { value: 'maple', label: 'Maple', note: 'Contact us for pricing' },
];

const DEFAULT_STATE = {
  treadMode: 'new',
  straightTreads: 13,
  pieTreads: 0,
  posts: 0,
  pickets: 26,
  stringerCount: 1,
  stringerType: 'white',
  nosingLf: 10,
  nosingType: 'new',
  railingLf: 0,
  railingType: 'refinish',
  landingEnabled: false,
  landingSize: 'small',
  species: 'red_oak',
};

function calcTotal(s) {
  let total = 0;
  const treadPrice = s.treadMode === 'refinish' ? P.tread_refinish : P.tread_straight;
  total += s.straightTreads * treadPrice;
  if (s.treadMode === 'new') total += s.pieTreads * P.tread_pie;
  total += s.posts * P.post;
  total += s.pickets * P.picket;
  total += s.stringerCount * (s.stringerType === 'stained' ? P.stringer_stained : P.stringer_white);
  total += s.nosingLf * (s.nosingType === 'refinish' ? P.nosing_refinish : P.nosing_new);
  if (s.railingLf > 0) {
    total += s.railingLf * (s.railingType === 'refinish' ? P.railing_refinish : P.railing_new);
  }
  if (s.landingEnabled) {
    total += s.landingSize === 'large' ? P.landing_large : P.landing_small;
  }
  return total;
}

function buildBreakdown(s) {
  const rows = [];
  const treadPrice = s.treadMode === 'refinish' ? P.tread_refinish : P.tread_straight;
  if (s.treadMode === 'refinish') {
    if (s.straightTreads > 0) rows.push({ label: `Refinish treads (${s.straightTreads})`, amount: s.straightTreads * treadPrice });
  } else {
    if (s.straightTreads > 0) rows.push({ label: `New straight treads (${s.straightTreads})`, amount: s.straightTreads * P.tread_straight });
    if (s.pieTreads > 0) rows.push({ label: `Pie/triangle treads (${s.pieTreads})`, amount: s.pieTreads * P.tread_pie });
  }
  if (s.posts > 0) rows.push({ label: `New posts 3¼" (${s.posts})`, amount: s.posts * P.post });
  if (s.pickets > 0) rows.push({ label: `Pickets iron/wood (${s.pickets})`, amount: s.pickets * P.picket });
  if (s.stringerCount > 0) {
    const st = s.stringerType === 'stained' ? 'stained' : 'white';
    rows.push({ label: `Stringers ${st} (${s.stringerCount} side${s.stringerCount > 1 ? 's' : ''})`, amount: s.stringerCount * (s.stringerType === 'stained' ? P.stringer_stained : P.stringer_white) });
  }
  if (s.nosingLf > 0) {
    const nt = s.nosingType === 'refinish' ? 'refinish' : 'new';
    rows.push({ label: `Nosing ${nt} (${s.nosingLf} lf)`, amount: s.nosingLf * (s.nosingType === 'refinish' ? P.nosing_refinish : P.nosing_new) });
  }
  if (s.railingLf > 0) {
    const rt = s.railingType === 'refinish' ? 'sand & restain' : 'new';
    rows.push({ label: `Handrail ${rt} (${s.railingLf} lf)`, amount: s.railingLf * (s.railingType === 'refinish' ? P.railing_refinish : P.railing_new) });
  }
  if (s.landingEnabled) {
    const ls = s.landingSize === 'large' ? 'large (6×3 ft)' : 'small (3×3 ft)';
    rows.push({ label: `Landing ${ls}`, amount: s.landingSize === 'large' ? P.landing_large : P.landing_small });
  }
  return rows;
}

function buildNotesString(s) {
  const parts = [];
  if (s.treadMode === 'refinish') {
    parts.push(`${s.straightTreads} treads refinished`);
  } else {
    if (s.straightTreads) parts.push(`${s.straightTreads} new straight treads`);
    if (s.pieTreads) parts.push(`${s.pieTreads} pie/triangle treads`);
  }
  if (s.posts) parts.push(`${s.posts} new posts`);
  if (s.pickets) parts.push(`${s.pickets} iron/wood pickets`);
  if (s.stringerCount) parts.push(`${s.stringerCount} ${s.stringerType} stringer(s)`);
  if (s.nosingLf) parts.push(`${s.nosingLf}lf nosing (${s.nosingType})`);
  if (s.railingLf) parts.push(`${s.railingLf}lf handrail (${s.railingType === 'refinish' ? 'sand & restain' : 'new'})`);
  if (s.landingEnabled) parts.push(`${s.landingSize} landing`);
  const speciesLabel = SPECIES_OPTIONS.find(o => o.value === s.species)?.label || 'Red Oak';
  parts.push(`wood species: ${speciesLabel}`);
  return `Stair Calculator estimate — ${parts.join(', ')} — Est. total: $${calcTotal(s).toLocaleString()}`;
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function NumInput({ value, onChange, min = 0, max = 99 }) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="w-8 h-8 rounded-full bg-stone-200 hover:bg-amber-200 font-bold text-stone-700 flex items-center justify-center transition-colors">−</button>
      <input type="number" min={min} max={max} value={value} onChange={e => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || 0)))} className="w-14 text-center border border-stone-300 rounded-lg py-1 text-sm font-semibold focus:ring-2 focus:ring-amber-400 focus:outline-none" />
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} className="w-8 h-8 rounded-full bg-stone-200 hover:bg-amber-200 font-bold text-stone-700 flex items-center justify-center transition-colors">+</button>
    </div>
  );
}

function RadioPill({ checked, onChange, children }) {
  return (
    <button type="button" onClick={onChange} className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${checked ? 'bg-amber-500 border-amber-500 text-white shadow-sm' : 'bg-white border-stone-300 text-stone-600 hover:border-amber-400'}`}>
      {children}
    </button>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-amber-500' : 'bg-stone-300'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

// ─── Main exported widget ──────────────────────────────────────────────────────
export default function StairCalculatorWidget({ embedded = false, onTotalChange = null }) {
  const [s, setS] = useState(DEFAULT_STATE);
  const [gate, setGate] = useState('locked'); // 'locked' | 'unlocked'
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  // submitted state handled via gate ('unlocked')
  const [submitError, setSubmitError] = useState('');
  const calcRef = useRef(null);

  const set = (key, val) => setS(prev => {
    const next = { ...prev, [key]: val };
    if (key === 'treadMode' && val === 'refinish') next.stringerType = 'white';
    return next;
  });

  const total = calcTotal(s);
  const breakdown = buildBreakdown(s);

  // Notify parent (QuoteCalculator) when total changes
  React.useEffect(() => {
    if (onTotalChange) onTotalChange(total);
  }, [total, onTotalChange]);

  function validateForm() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    else if (!validatePhone(form.phone)) errs.phone = 'Enter a valid phone number';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  return (
    <div ref={calcRef} id="calculator" className="bg-gradient-to-br from-stone-50 to-amber-50 border border-amber-200 rounded-2xl p-6 md:p-8 shadow-sm">
      {!embedded && (
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🧮</span>
          <div>
            <h2 className="text-2xl font-bold text-stone-900">Stair Renovation Cost Calculator</h2>
            <p className="text-stone-500 text-sm">Adjust below — your estimate updates live. No account needed.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Left: Inputs ── */}
        <div className="space-y-6">
          {/* Tread mode */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <p className="font-semibold text-stone-800 mb-3">What are we doing to the treads?</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <RadioPill checked={s.treadMode === 'new'} onChange={() => set('treadMode', 'new')}>Install New Treads</RadioPill>
              <RadioPill checked={s.treadMode === 'refinish'} onChange={() => set('treadMode', 'refinish')}>Refinish Existing</RadioPill>
            </div>
            {s.treadMode === 'refinish' && (
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                💡 Refinishing requires solid hardwood treads in good structural condition.
              </div>
            )}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-600">
                  {s.treadMode === 'refinish' ? 'Treads to refinish' : 'Straight treads'}
                  <span className="text-stone-400 ml-1">@ ${s.treadMode === 'refinish' ? P.tread_refinish : P.tread_straight}/step</span>
                </span>
                <NumInput value={s.straightTreads} onChange={v => set('straightTreads', v)} />
              </div>
              {s.treadMode === 'new' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-600">Pie/triangle/bullnose<span className="text-stone-400 ml-1">@ ${P.tread_pie}/step</span></span>
                  <NumInput value={s.pieTreads} onChange={v => set('pieTreads', v)} />
                </div>
              )}
            </div>
          </div>

          {/* Posts & Pickets */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <p className="font-semibold text-stone-800 mb-3">Posts &amp; Pickets</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-600">New posts (3¼")<span className="text-stone-400 ml-1">@ ${P.post}/post</span></span>
                <NumInput value={s.posts} onChange={v => set('posts', v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-stone-600">Pickets (iron or wood)<span className="text-stone-400 ml-1">@ ${P.picket}/piece</span></span>
                  <p className="text-xs text-stone-400 mt-0.5">💡 Typical: 2 pickets/step. 13 steps = ~26 pickets</p>
                </div>
                <NumInput value={s.pickets} onChange={v => set('pickets', v)} />
              </div>
            </div>
          </div>

          {/* Stringers */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <p className="font-semibold text-stone-800 mb-1">Stringers (side boards)</p>
            <p className="text-xs text-stone-400 mb-3">The angled boards running the length of the staircase that support the treads</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-600">How many sides?</span>
                <NumInput value={s.stringerCount} onChange={v => set('stringerCount', v)} min={0} max={2} />
              </div>
              {s.stringerCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-600">Finish</span>
                  <div className="flex gap-2">
                    <RadioPill checked={s.stringerType === 'white'} onChange={() => set('stringerType', 'white')}>White ${P.stringer_white}/side</RadioPill>
                    <RadioPill checked={s.stringerType === 'stained'} onChange={() => s.treadMode === 'new' && set('stringerType', 'stained')}>
                      <span className={s.treadMode !== 'new' ? 'opacity-40' : ''}>Stained ${P.stringer_stained}/side</span>
                    </RadioPill>
                  </div>
                </div>
              )}
              {s.stringerCount > 0 && s.treadMode === 'refinish' && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">⚠️ Stained stringers require new treads. Refinishing mode locks stringers to white.</p>
              )}
            </div>
          </div>

          {/* Wood Species */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <p className="font-semibold text-stone-800 mb-1">Wood Species</p>
            <p className="text-xs text-stone-400 mb-3">All calculator prices are for red oak (standard). Other species available — we'll confirm pricing on your call.</p>
            <div className="flex flex-wrap gap-2">
              {SPECIES_OPTIONS.map(opt => (
                <RadioPill key={opt.value} checked={s.species === opt.value} onChange={() => set('species', opt.value)}>
                  {opt.label}
                </RadioPill>
              ))}
            </div>
            {s.species !== 'red_oak' && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
                💡 White oak and maple pricing confirmed during your free in-home measurement.
              </p>
            )}
          </div>

          {/* Nosing */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <p className="font-semibold text-stone-800 mb-3">Stair Nosing</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-600">Linear feet</span>
                <NumInput value={s.nosingLf} onChange={v => set('nosingLf', v)} max={50} />
              </div>
              {s.nosingLf > 0 && (
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm text-stone-600">Type</span>
                  <div className="flex gap-2">
                    <RadioPill checked={s.nosingType === 'refinish'} onChange={() => set('nosingType', 'refinish')}>Sand &amp; Restain ${P.nosing_refinish}/lf</RadioPill>
                    <RadioPill checked={s.nosingType === 'new'} onChange={() => set('nosingType', 'new')}>New ${P.nosing_new}/lf</RadioPill>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Railing */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <p className="font-semibold text-stone-800 mb-3">Handrail</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-600">Linear feet</span>
                <NumInput value={s.railingLf} onChange={v => set('railingLf', v)} max={50} />
              </div>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-sm text-stone-600">Type</span>
                <div className="flex gap-2">
                  <RadioPill checked={s.railingType === 'refinish'} onChange={() => set('railingType', 'refinish')}>Sand &amp; Restain ${P.railing_refinish}/lf</RadioPill>
                  <RadioPill checked={s.railingType === 'new'} onChange={() => set('railingType', 'new')}>New ${P.railing_new}/lf</RadioPill>
                </div>
              </div>
              <p className="text-xs text-stone-400">💡 Most homeowners sand &amp; restain the existing handrail. Choose “New” to replace it.</p>
            </div>
          </div>

          {/* Landing */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-stone-800">Stair Landing?</p>
              <Toggle checked={s.landingEnabled} onChange={v => set('landingEnabled', v)} />
            </div>
            {s.landingEnabled && (
              <div className="flex gap-2 flex-wrap">
                <RadioPill checked={s.landingSize === 'small'} onChange={() => set('landingSize', 'small')}>Small 3×3 ft — ${P.landing_small}</RadioPill>
                <RadioPill checked={s.landingSize === 'large'} onChange={() => set('landingSize', 'large')}>Large 6×3 ft — ${P.landing_large}</RadioPill>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Live Estimate ── */}
        <div>
          <div className="sticky top-6">
            <div className="bg-white border border-amber-300 rounded-2xl p-6 shadow-md">
              <p className="text-lg font-bold text-stone-800 mb-4">Your Stair Estimate</p>
              {breakdown.length === 0 ? (
                <p className="text-stone-400 text-sm italic">Configure your staircase on the left to see pricing.</p>
              ) : gate === 'unlocked' ? (
                <div className="space-y-2 mb-4">
                  {breakdown.map((row, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-stone-600">{row.label}</span>
                      <span className="font-semibold text-stone-800">${row.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t border-stone-200 pt-3 flex justify-between">
                    <span className="font-bold text-stone-900">Estimated Total</span>
                    <span className="font-bold text-2xl text-amber-600">${total.toLocaleString()}</span>
                  </div>
                </div>
              ) : null}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-xs text-amber-800">
                ⚠️ Estimate only — final price confirmed at free in-home measurement. Carpet removal included with new treads.
              </div>

              {/* Financing nudge */}
              {total >= 1000 && getMonthlyPayment && (() => { const mo = getMonthlyPayment(total); return mo ? (
                <a href={FINANCEIT_LINKS?.freeProgram || '#'} target="_blank" rel="noopener noreferrer" className="block bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-center hover:bg-blue-100 transition-colors">
                  <p className="text-xs font-semibold text-blue-600 mb-0.5">💳 Finance it</p>
                  <p className="text-xl font-extrabold text-blue-700">~${mo}<span className="text-sm font-semibold text-blue-400">/mo</span></p>
                  <p className="text-xs text-blue-400">OAC · Apply in 2 min →</p>
                </a>
              ) : null; })()}

              {gate !== 'unlocked' ? (
                gate === 'locked' ? (
                  /* ── Locked: blurred total + unlock form ── */
                  <div className="space-y-3">
                    <div className="relative rounded-lg border border-stone-200 overflow-hidden">
                      <div className="p-4 space-y-2 blur-sm select-none pointer-events-none">
                        <div className="flex justify-between text-sm"><span className="text-stone-500">Treads &amp; stairs</span><span className="font-medium">C$████</span></div>
                        <div className="flex justify-between text-sm"><span className="text-stone-500">Railing &amp; pickets</span><span className="font-medium">C$████</span></div>
                        <div className="flex justify-between text-sm font-bold border-t pt-2"><span>Your Total</span><span className="text-amber-600 text-lg">C$██████</span></div>
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/75 backdrop-blur-[2px]">
                        <span className="text-2xl mb-1">🔒</span>
                        <p className="text-sm font-semibold text-stone-800">Unlock your estimate</p>
                        <p className="text-xs text-stone-500">Takes 10 seconds</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-stone-800">Where should we send your stair quote?</p>
                    <div>
                      <input type="text" placeholder="Your name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none ${formErrors.name ? 'border-red-400' : 'border-stone-300'}`} />
                      {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                    </div>
                    <div>
                      <input type="tel" placeholder="Phone number *" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none ${formErrors.phone ? 'border-red-400' : 'border-stone-300'}`} />
                      {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
                    </div>
                    <div>
                      <input type="email" placeholder="Email address *" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none ${formErrors.email ? 'border-red-400' : 'border-stone-300'}`} />
                      {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                    </div>
                    {submitError && <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{submitError}</p>}
                    <button type="button" onClick={async (e) => { // eslint-disable-line no-unused-vars
                      if (!validateForm()) return;
                      setSubmitting(true);
                      setSubmitError('');
                      try {
                        const quote = {
                          customer_name: form.name.trim(), customer_email: form.email.trim(), customer_phone: form.phone.trim(),
                          product_name: 'Stair Renovation', notes: buildNotesString(s), total, subtotal: total, tax: 0,
                          square_footage: null, stair_tread_count: s.straightTreads, stair_pie_count: s.pieTreads,
                          stair_refinish: s.treadMode === 'refinish', stair_posts: s.posts, stair_pickets: s.pickets,
                          stair_stringers: { count: s.stringerCount, type: s.stringerType },
                          stair_nosing: { lf: s.nosingLf, type: s.nosingType },
                          stair_railing: s.railingLf > 0 ? { lf: s.railingLf, type: s.railingType } : null,
                          stair_landing: s.landingEnabled ? { size: s.landingSize } : null,
                          stair_species: s.species, stair_total: total,
                        };
                        const res = await fetch('/api/quotes/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quote }) });
                        const data = await res.json();
                        if (!data.success) throw new Error(data.error || 'Server error');
                        setGate('unlocked');
                        if (typeof window !== 'undefined' && window.gtag) window.gtag('event', 'conversion', { send_to: 'AW-11095246827/BBS_Lead_Form_Submit' });
                        if (typeof window !== 'undefined' && typeof window.fbq === 'function') window.fbq('track', 'Lead', { content_name: 'Stair Calculator', value: total, currency: 'CAD' });
                      } catch (err) {
                        setSubmitError('Something went wrong — please try again or call (647) 428-1111.');
                      } finally { setSubmitting(false); }
                    }} disabled={submitting} className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors text-sm">
                      {submitting ? 'Sending…' : '🔓 Unlock My Stair Quote →'}
                    </button>
                    {/* Social proof */}
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="flex">{[...Array(5)].map((_, i) => <svg key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}</div>
                      <span className="text-xs text-stone-500">{GOOGLE_RATING}/5 · Google reviews</span>
                    </div>
                    <p className="text-xs text-stone-400 text-center">A team member will call within 2 hours to confirm your quote and schedule your free measurement.</p>
                  </div>
                ) : (
                  /* ── Unlocked: show full breakdown ── */
                  <div className="space-y-3">
                    {breakdown.length > 0 && (
                      <div className="space-y-2 mb-2">
                        {breakdown.map((row, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-stone-600">{row.label}</span>
                            <span className="font-semibold text-stone-800">${row.amount.toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="border-t border-stone-200 pt-3 flex justify-between">
                          <span className="font-bold text-stone-900">Estimated Total</span>
                          <span className="font-bold text-2xl text-amber-600">${total.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                    <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-800">
                      ✅ Quote sent to {form.email} — a team member will call within 2 hours.
                    </div>
                    <a href="/free-measurement" className="block w-full text-center bg-stone-900 hover:bg-stone-800 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
                      Book Measurement Online →
                    </a>
                  </div>
                )
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
