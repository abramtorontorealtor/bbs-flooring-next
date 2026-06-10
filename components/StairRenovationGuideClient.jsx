'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { validatePhone } from '@/lib/validations';

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

const DEFAULT_STATE = {
  treadMode: 'new',          // 'new' | 'refinish'
  straightTreads: 13,
  pieTreads: 0,
  posts: 0,
  pickets: 26,
  stringerCount: 1,
  stringerType: 'white',     // 'white' | 'stained' — stained disabled in refinish mode
  nosingLf: 10,
  nosingType: 'new',         // 'new' | 'refinish'
  railingLf: 0,
  railingType: 'new',        // 'new' | 'refinish'
  landingEnabled: false,
  landingSize: 'small',      // 'small' | 'large'
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
    const rt = s.railingType === 'refinish' ? 'refinish' : 'new';
    rows.push({ label: `Railing ${rt} (${s.railingLf} lf)`, amount: s.railingLf * (s.railingType === 'refinish' ? P.railing_refinish : P.railing_new) });
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
  if (s.railingLf) parts.push(`${s.railingLf}lf railing (${s.railingType})`);
  if (s.landingEnabled) parts.push(`${s.landingSize} landing`);
  return `Stair Calculator estimate — ${parts.join(', ')} — Est. total: $${calcTotal(s).toLocaleString()}`;
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function NumInput({ value, onChange, min = 0, max = 99 }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-8 h-8 rounded-full bg-stone-200 hover:bg-amber-200 font-bold text-stone-700 flex items-center justify-center transition-colors"
      >−</button>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || 0)))}
        className="w-14 text-center border border-stone-300 rounded-lg py-1 text-sm font-semibold focus:ring-2 focus:ring-amber-400 focus:outline-none"
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-8 h-8 rounded-full bg-stone-200 hover:bg-amber-200 font-bold text-stone-700 flex items-center justify-center transition-colors"
      >+</button>
    </div>
  );
}

function RadioPill({ checked, onChange, children }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${checked ? 'bg-amber-500 border-amber-500 text-white shadow-sm' : 'bg-white border-stone-300 text-stone-600 hover:border-amber-400'}`}
    >
      {children}
    </button>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-amber-500' : 'bg-stone-300'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

// ─── Calculator component ──────────────────────────────────────────────────────
function StairCalculator() {
  const [s, setS] = useState(DEFAULT_STATE);
  const [showGate, setShowGate] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const calcRef = useRef(null);

  const set = (key, val) => setS(prev => {
    const next = { ...prev, [key]: val };
    // Enforce: if refinish mode, stringers must be white
    if (key === 'treadMode' && val === 'refinish') next.stringerType = 'white';
    return next;
  });

  const total = calcTotal(s);
  const breakdown = buildBreakdown(s);

  function validateForm() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    else if (!validatePhone(form.phone)) errs.phone = 'Enter a valid phone number';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const quote = {
        customer_name: form.name.trim(),
        customer_email: form.email.trim(),
        customer_phone: form.phone.trim(),
        product_name: 'Stair Renovation',
        notes: buildNotesString(s),
        total,
        subtotal: total,
        tax: 0,
        square_footage: null,
        stair_tread_count: s.straightTreads,
        stair_pie_count: s.pieTreads,
        stair_refinish: s.treadMode === 'refinish',
        stair_posts: s.posts,
        stair_pickets: s.pickets,
        stair_stringers: { count: s.stringerCount, type: s.stringerType },
        stair_nosing: { lf: s.nosingLf, type: s.nosingType },
        stair_railing: s.railingLf > 0 ? { lf: s.railingLf, type: s.railingType } : null,
        stair_landing: s.landingEnabled ? { size: s.landingSize } : null,
      };
      const res = await fetch('/api/quotes/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Server error');
      setSubmitted(true);
    } catch (err) {
      setSubmitError('Something went wrong — please try again or call (647) 428-1111.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div ref={calcRef} id="calculator" className="bg-gradient-to-br from-stone-50 to-amber-50 border border-amber-200 rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🧮</span>
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Stair Renovation Cost Calculator</h2>
          <p className="text-stone-500 text-sm">Adjust below — your estimate updates live. No account needed.</p>
        </div>
      </div>

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
                  <span className="text-sm text-stone-600">
                    Pie/triangle/bullnose
                    <span className="text-stone-400 ml-1">@ ${P.tread_pie}/step</span>
                  </span>
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
                <span className="text-sm text-stone-600">
                  New posts (3¼")
                  <span className="text-stone-400 ml-1">@ ${P.post}/post</span>
                </span>
                <NumInput value={s.posts} onChange={v => set('posts', v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-stone-600">
                    Pickets (iron or wood)
                    <span className="text-stone-400 ml-1">@ ${P.picket}/piece</span>
                  </span>
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
                    <RadioPill checked={s.stringerType === 'white'} onChange={() => set('stringerType', 'white')}>
                      White ${P.stringer_white}/side
                    </RadioPill>
                    <RadioPill
                      checked={s.stringerType === 'stained'}
                      onChange={() => s.treadMode === 'new' && set('stringerType', 'stained')}
                    >
                      <span className={s.treadMode !== 'new' ? 'opacity-40' : ''}>
                        Stained ${P.stringer_stained}/side
                      </span>
                    </RadioPill>
                  </div>
                </div>
              )}
              {s.stringerCount > 0 && s.treadMode === 'refinish' && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                  ⚠️ Stained stringers require new treads. Refinishing mode locks stringers to white.
                </p>
              )}
            </div>
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
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-600">Type</span>
                  <div className="flex gap-2">
                    <RadioPill checked={s.nosingType === 'new'} onChange={() => set('nosingType', 'new')}>
                      New ${P.nosing_new}/lf
                    </RadioPill>
                    <RadioPill checked={s.nosingType === 'refinish'} onChange={() => set('nosingType', 'refinish')}>
                      Refinish ${P.nosing_refinish}/lf
                    </RadioPill>
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
              {s.railingLf > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-600">Type</span>
                  <div className="flex gap-2">
                    <RadioPill checked={s.railingType === 'new'} onChange={() => set('railingType', 'new')}>
                      New ${P.railing_new}/lf
                    </RadioPill>
                    <RadioPill checked={s.railingType === 'refinish'} onChange={() => set('railingType', 'refinish')}>
                      Refinish ${P.railing_refinish}/lf
                    </RadioPill>
                  </div>
                </div>
              )}
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
                <RadioPill checked={s.landingSize === 'small'} onChange={() => set('landingSize', 'small')}>
                  Small 3×3 ft — ${P.landing_small}
                </RadioPill>
                <RadioPill checked={s.landingSize === 'large'} onChange={() => set('landingSize', 'large')}>
                  Large 6×3 ft — ${P.landing_large}
                </RadioPill>
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
              ) : (
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
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 text-xs text-amber-800">
                ⚠️ This is an estimate. Final price confirmed at free in-home measurement. Carpet removal is included when installing new treads.
              </div>

              {!submitted ? (
                <>
                  {!showGate ? (
                    <button
                      type="button"
                      onClick={() => setShowGate(true)}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-colors text-sm"
                    >
                      Get My Full Quote →
                    </button>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <p className="text-sm font-semibold text-stone-800 mb-1">We'll send your quote + schedule your free in-home measurement</p>
                      <div>
                        <input
                          type="text"
                          placeholder="Your name *"
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none ${formErrors.name ? 'border-red-400' : 'border-stone-300'}`}
                        />
                        {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                      </div>
                      <div>
                        <input
                          type="tel"
                          placeholder="Phone number *"
                          value={form.phone}
                          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                          className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none ${formErrors.phone ? 'border-red-400' : 'border-stone-300'}`}
                        />
                        {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
                      </div>
                      <div>
                        <input
                          type="email"
                          placeholder="Email address *"
                          value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none ${formErrors.email ? 'border-red-400' : 'border-stone-300'}`}
                        />
                        {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                      </div>
                      {submitError && <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{submitError}</p>}
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors text-sm"
                      >
                        {submitting ? 'Sending…' : 'Send My Quote →'}
                      </button>
                      <p className="text-xs text-stone-400 text-center">No spam. We'll respond within 24 hours.</p>
                    </form>
                  )}
                </>
              ) : (
                <div className="text-center">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="font-bold text-stone-800 mb-1">Quote sent!</p>
                  <p className="text-stone-500 text-sm mb-4">Check your email. We'll follow up within 24 hours to schedule your free in-home measurement.</p>
                  <Link
                    href="/free-measurement"
                    className="inline-block bg-stone-900 hover:bg-stone-800 text-white font-semibold px-6 py-2 rounded-lg text-sm transition-colors"
                  >
                    Book Measurement Online
                  </Link>
                </div>
              )}
            </div>

            {/* Species note */}
            <div className="mt-4 bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs text-stone-500">
              <span className="font-semibold text-stone-700">Wood species note:</span> All calculator prices are for red oak (our standard). White oak and maple are available — contact us for pricing.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function StairRenovationGuideClient() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-4">
            BBS Flooring — Stair Renovation Guide 2026
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Stair Renovation Cost in Toronto &amp; GTA (2026)
          </h1>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Treads from $125/step · New hardwood from $185/step · Banister &amp; railing from $25/lf. Use our free stair cost calculator for an instant estimate.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-stone-400">
            <span>✔ From $125/step</span>
            <span>✔ Free in-home estimates</span>
            <span>✔ WSIB insured</span>
            <span>✔ Markham showroom</span>
          </div>
          <div className="mt-8">
            <a href="#calculator" className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3 rounded-xl transition-colors">
              Use the Stair Calculator ↓
            </a>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="bg-amber-50 border-b border-amber-100 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-stone-700 mb-4">In This Guide</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-amber-700 text-sm font-medium list-decimal list-inside">
            <li><a href="#quick-answer" className="hover:underline">Quick Answer: Key Prices</a></li>
            <li><a href="#calculator" className="hover:underline">Stair Cost Calculator</a></li>
            <li><a href="#options" className="hover:underline">Your 4 Main Options</a></li>
            <li><a href="#pricing" className="hover:underline">Complete Pricing Breakdown</a></li>
            <li><a href="#banister" className="hover:underline">Banister &amp; Railing Costs</a></li>
            <li><a href="#refinish-vs-replace" className="hover:underline">Refinish vs Replace</a></li>
            <li><a href="#wood-species" className="hover:underline">Best Wood Species</a></li>
            <li><a href="#railing-options" className="hover:underline">Railing &amp; Baluster Options</a></li>
            <li><a href="#vinyl-caps" className="hover:underline">Vinyl Stair Caps</a></li>
            <li><a href="#carpet-removal" className="hover:underline">Carpet to Hardwood Process</a></li>
            <li><a href="#timeline" className="hover:underline">Timeline &amp; What to Expect</a></li>
            <li><a href="#faq" className="hover:underline">FAQ</a></li>
          </ol>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 py-16 space-y-20">

        {/* Quick Answer */}
        <section id="quick-answer" className="bg-amber-50 border border-amber-200 rounded-xl p-6 md:p-8">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
            Quick Answer: Stair Renovation Cost in Toronto &amp; GTA (2026)
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Staircase renovation at BBS Flooring: refinishing from <strong>$125/step</strong>, new hardwood treads from <strong>$185/step</strong> (straight) or <strong>$225/step</strong> (pie/bullnose), new posts <strong>$150 each</strong>, iron or wood pickets <strong>$25/piece</strong>, railing refinish <strong>$25/lf</strong>, new railing <strong>$50/lf</strong>, stringers from <strong>$350/side</strong>. A typical 13-step staircase runs $1,625 (refinishing) to $5,500+ (full renovation with new treads, pickets, posts &amp; railing). WSIB-insured, serving the entire GTA. Free estimate: <a href="tel:6474281111" className="text-amber-700 underline">(647) 428-1111</a>.
          </p>
        </section>

        {/* Calculator */}
        <StairCalculator />

        {/* Section 1: Options */}
        <section id="options">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Your 4 Main Stair Renovation Options</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-8">
            Most GTA homeowners choose one of four approaches, depending on the condition of their existing stairs, their budget, and their aesthetic goals.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="text-3xl mb-3">🪵</div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">Option 1: Refinish Existing Treads</h3>
              <p className="text-stone-600 text-sm mb-3">Sand down your existing hardwood treads and apply new stain and finish. The most cost-effective way to transform your staircase.</p>
              <div className="bg-white rounded-lg p-3 border border-amber-100">
                <p className="text-amber-700 font-semibold text-sm">$125/step</p>
                <p className="text-stone-500 text-xs">Requires structurally sound hardwood treads</p>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-6">
              <div className="text-3xl mb-3">🔨</div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">Option 2: Install New Hardwood Treads</h3>
              <p className="text-stone-600 text-sm mb-3">Remove old treads (carpet, damaged wood, or MDF) and install new solid hardwood stair treads. Best results, longest lifespan.</p>
              <div className="bg-white rounded-lg p-3 border border-stone-100">
                <p className="text-stone-700 font-semibold text-sm">$185/step (straight) · $225/step (pie/bullnose)</p>
                <p className="text-stone-500 text-xs">Works on any existing staircase structure</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">Option 3: Vinyl Stair Caps (Overlays)</h3>
              <p className="text-stone-600 text-sm mb-3">Waterproof vinyl overlays that fit directly over your existing treads. No demolition needed — fast, budget-friendly, matches your LVP flooring.</p>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-blue-700 font-semibold text-sm">Most budget-friendly option</p>
                <p className="text-stone-500 text-xs">Contact us for vinyl cap pricing</p>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
              <div className="text-3xl mb-3">🏗️</div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">Option 4: Full Staircase Renovation</h3>
              <p className="text-stone-600 text-sm mb-3">New treads + new railings + new balusters/pickets + posts. Complete transformation from dated colonial to modern open-riser or traditional custom design.</p>
              <div className="bg-white rounded-lg p-3 border border-emerald-100">
                <p className="text-emerald-700 font-semibold text-sm">$4,500–$7,000+ for a full 13-step renovation</p>
                <p className="text-stone-500 text-xs">Includes treads, pickets, posts, railing, nosing &amp; stringers</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Pricing */}
        <section id="pricing">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Complete Staircase Pricing Breakdown</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-6">
            All BBS Flooring stair pricing is per-item with no hidden fees. Labour and standard materials included unless noted.
          </p>

          <div className="overflow-x-auto mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-stone-100">
                  <th className="text-left p-4 font-semibold text-stone-800 border-b-2 border-stone-300">Service</th>
                  <th className="text-center p-4 font-semibold text-stone-800 border-b-2 border-stone-300">Unit</th>
                  <th className="text-center p-4 font-semibold text-amber-700 border-b-2 border-stone-300">BBS Price</th>
                </tr>
              </thead>
              <tbody className="text-stone-600 text-sm">
                <tr className="border-b bg-amber-50">
                  <td className="p-4 font-semibold text-stone-800">Stair Tread Refinishing (Sand &amp; Restain)</td>
                  <td className="p-4 text-center">per step</td>
                  <td className="p-4 text-center font-bold text-amber-700">$125</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">New Straight Stair Treads (Installed)</td>
                  <td className="p-4 text-center">per step</td>
                  <td className="p-4 text-center font-bold">$185</td>
                </tr>
                <tr className="border-b bg-stone-50">
                  <td className="p-4">New Pie / Triangle / Bullnose Steps</td>
                  <td className="p-4 text-center">per step</td>
                  <td className="p-4 text-center font-bold">$225</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">New Post (3¼")</td>
                  <td className="p-4 text-center">per post</td>
                  <td className="p-4 text-center font-bold">$150</td>
                </tr>
                <tr className="border-b bg-stone-50">
                  <td className="p-4">New Iron or Wood Pickets (Installed with Material)</td>
                  <td className="p-4 text-center">per piece</td>
                  <td className="p-4 text-center font-bold">$25</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Stringer — White (painted)</td>
                  <td className="p-4 text-center">per side</td>
                  <td className="p-4 text-center font-bold">$350</td>
                </tr>
                <tr className="border-b bg-stone-50">
                  <td className="p-4">Stringer — Stained (requires new treads)</td>
                  <td className="p-4 text-center">per side</td>
                  <td className="p-4 text-center font-bold">$900</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Nosing Refinish (Sand &amp; Restain)</td>
                  <td className="p-4 text-center">per linear foot</td>
                  <td className="p-4 text-center font-bold">$20</td>
                </tr>
                <tr className="border-b bg-stone-50">
                  <td className="p-4">New Nosing (Installed)</td>
                  <td className="p-4 text-center">per linear foot</td>
                  <td className="p-4 text-center font-bold">$25</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Handrail Refinish (Sand &amp; Restain)</td>
                  <td className="p-4 text-center">per linear foot</td>
                  <td className="p-4 text-center font-bold">$25</td>
                </tr>
                <tr className="border-b bg-stone-50">
                  <td className="p-4">New Handrail (Installed)</td>
                  <td className="p-4 text-center">per linear foot</td>
                  <td className="p-4 text-center font-bold">$50</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Stair Landing — Small (3×3 ft)</td>
                  <td className="p-4 text-center">per landing</td>
                  <td className="p-4 text-center font-bold">$300</td>
                </tr>
                <tr>
                  <td className="p-4 bg-stone-50">Stair Landing — Large (6×3 ft)</td>
                  <td className="p-4 bg-stone-50 text-center">per landing</td>
                  <td className="p-4 bg-stone-50 text-center font-bold">$600</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-stone-800 mb-4">📊 Sample Project Estimates</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-start border-b border-stone-200 pb-3">
                <div>
                  <p className="font-semibold text-stone-800">Refinish 13-step staircase</p>
                  <p className="text-stone-500 text-sm">13 treads × $125 + 10 lf nosing refinish × $20 + 10 lf railing refinish × $25</p>
                </div>
                <span className="font-bold text-amber-700 shrink-0 ml-4">~$1,875</span>
              </div>
              <div className="flex justify-between items-start border-b border-stone-200 pb-3">
                <div>
                  <p className="font-semibold text-stone-800">New treads — carpet-to-hardwood conversion</p>
                  <p className="text-stone-500 text-sm">13 straight treads × $185 (carpet removal included) + 10 lf new nosing × $25 + 1 stringer (white) × $350</p>
                </div>
                <span className="font-bold text-amber-700 shrink-0 ml-4">~$2,955</span>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-stone-800">Full renovation — new treads + iron pickets + posts + railing</p>
                  <p className="text-stone-500 text-sm">13 treads × $185 + 26 pickets × $25 + 2 posts × $150 + 10 lf new rail × $50 + 1 stringer (white) × $350</p>
                </div>
                <span className="font-bold text-amber-700 shrink-0 ml-4">~$4,355</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-amber-800 text-sm"><span className="font-semibold">Note:</span> All prices include labour and standard materials. Carpet removal is included when installing new treads. Species upgrades (white oak, maple) available — contact us for pricing. Final price confirmed at free in-home measurement.</p>
          </div>
        </section>

        {/* Section: Banister & Railing */}
        <section id="banister">
          <h2 className="text-3xl font-bold text-stone-900 mb-3">Banister, Railing &amp; Picket Renovation Cost</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-6">
            The railing system — posts, handrail, pickets, and stringers — often makes as much visual impact as the treads themselves. Here's everything you need to know about banister renovation costs in Toronto and the GTA.
          </p>

          <div className="overflow-x-auto mb-8">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-stone-100">
                  <th className="text-left p-4 font-semibold text-stone-800 border-b-2 border-stone-300">Component</th>
                  <th className="text-center p-4 font-semibold text-stone-800 border-b-2 border-stone-300">Unit</th>
                  <th className="text-center p-4 font-semibold text-amber-700 border-b-2 border-stone-300">Price</th>
                  <th className="text-left p-4 font-semibold text-stone-800 border-b-2 border-stone-300">Notes</th>
                </tr>
              </thead>
              <tbody className="text-stone-600">
                <tr className="border-b"><td className="p-4 font-medium">New Post (3¼")</td><td className="p-4 text-center">per post</td><td className="p-4 text-center font-bold text-amber-700">$150</td><td className="p-4 text-sm">Newel/anchor posts at top &amp; bottom of run</td></tr>
                <tr className="border-b bg-stone-50"><td className="p-4 font-medium">Iron Pickets (installed)</td><td className="p-4 text-center">per piece</td><td className="p-4 text-center font-bold text-amber-700">$25</td><td className="p-4 text-sm">Matte black, brushed nickel, oil-rubbed bronze</td></tr>
                <tr className="border-b"><td className="p-4 font-medium">Wood Pickets (installed)</td><td className="p-4 text-center">per piece</td><td className="p-4 text-center font-bold text-amber-700">$25</td><td className="p-4 text-sm">Square, turned (colonial), craftsman styles</td></tr>
                <tr className="border-b bg-stone-50"><td className="p-4 font-medium">Handrail Refinish</td><td className="p-4 text-center">per lf</td><td className="p-4 text-center font-bold text-amber-700">$25</td><td className="p-4 text-sm">Sand, stain, new poly coat</td></tr>
                <tr className="border-b"><td className="p-4 font-medium">New Handrail</td><td className="p-4 text-center">per lf</td><td className="p-4 text-center font-bold text-amber-700">$50</td><td className="p-4 text-sm">Solid wood, custom stained to match treads</td></tr>
                <tr className="border-b bg-stone-50"><td className="p-4 font-medium">Stringer — White Painted</td><td className="p-4 text-center">per side</td><td className="p-4 text-center font-bold text-amber-700">$350</td><td className="p-4 text-sm">Available with new treads OR refinish</td></tr>
                <tr><td className="p-4 font-medium">Stringer — Stained</td><td className="p-4 text-center">per side</td><td className="p-4 text-center font-bold text-amber-700">$900</td><td className="p-4 text-sm">Only available when installing new treads</td></tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-stone-800 text-white rounded-xl p-6">
              <p className="text-amber-400 font-semibold text-sm mb-2">⭐ Most Popular Combo (2026)</p>
              <p className="font-bold text-lg mb-3">Iron pickets + stained railing + new posts</p>
              <p className="text-stone-300 text-sm mb-4">The open, modern look that dominates Toronto renovations. Iron pickets feel lighter than wood, require zero maintenance, and the matte black finish pairs with every stain colour.</p>
              <div className="bg-white/10 rounded-lg p-3 text-sm">
                <div className="flex justify-between"><span>2 new posts</span><span>$300</span></div>
                <div className="flex justify-between"><span>26 iron pickets</span><span>$650</span></div>
                <div className="flex justify-between"><span>10 lf new railing</span><span>$500</span></div>
                <div className="flex justify-between pt-2 border-t border-white/20 font-bold"><span>Railing upgrade</span><span>~$1,450</span></div>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <p className="font-semibold text-stone-800 mb-3">Why Iron Pickets Win in 2026</p>
              <ul className="space-y-2 text-stone-600 text-sm">
                <li className="flex gap-2"><span className="text-amber-500 shrink-0">✓</span>Thinner profile opens up the staircase visually</li>
                <li className="flex gap-2"><span className="text-amber-500 shrink-0">✓</span>Zero maintenance — never needs refinishing</li>
                <li className="flex gap-2"><span className="text-amber-500 shrink-0">✓</span>Structurally stronger than most wood pickets</li>
                <li className="flex gap-2"><span className="text-amber-500 shrink-0">✓</span>Same price as wood at BBS ($25/piece)</li>
                <li className="flex gap-2"><span className="text-amber-500 shrink-0">✓</span>Matte black pairs with all stain colours</li>
                <li className="flex gap-2"><span className="text-amber-500 shrink-0">✓</span>Buyers associate iron pickets with higher home value</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <p className="text-blue-800 font-semibold mb-2">💡 How much to replace a banister in Toronto?</p>
            <p className="text-blue-700 text-sm">A typical banister upgrade (2 new posts + 26 iron pickets + 10 lf new railing) runs <strong>$1,450–$1,700</strong> installed. Just refinishing an existing wood railing costs <strong>$25/lf</strong> — a 10 lf railing is $250. Mix &amp; match using the calculator above for your exact configuration.</p>
          </div>
        </section>

        {/* Section 3: Refinish vs Replace */}
        <section id="refinish-vs-replace">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Refinish vs Replace: Which Is Right for You?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-emerald-800 mb-4">✅ Refinish If...</h3>
              <ul className="space-y-2 text-stone-600 text-sm">
                <li className="flex gap-2"><span className="text-emerald-500 shrink-0">✓</span>Your existing treads are solid hardwood (tap-test — they sound solid, not hollow)</li>
                <li className="flex gap-2"><span className="text-emerald-500 shrink-0">✓</span>The treads are structurally sound — no cracks, warping, or rot</li>
                <li className="flex gap-2"><span className="text-emerald-500 shrink-0">✓</span>Surface damage is cosmetic — scratches, worn finish, light dents</li>
                <li className="flex gap-2"><span className="text-emerald-500 shrink-0">✓</span>The treads are thick enough to sand (at least ¾&quot; before sanding)</li>
                <li className="flex gap-2"><span className="text-emerald-500 shrink-0">✓</span>You want to save 30–40% vs full replacement</li>
              </ul>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-amber-800 mb-4">🔄 Replace If...</h3>
              <ul className="space-y-2 text-stone-600 text-sm">
                <li className="flex gap-2"><span className="text-amber-500 shrink-0">→</span>Treads are carpet-covered and you don&apos;t know what&apos;s underneath</li>
                <li className="flex gap-2"><span className="text-amber-500 shrink-0">→</span>Existing treads are MDF, particleboard, or composite</li>
                <li className="flex gap-2"><span className="text-amber-500 shrink-0">→</span>Treads have deep gouges, structural cracks, or are too thin to sand</li>
                <li className="flex gap-2"><span className="text-amber-500 shrink-0">→</span>You want a different wood species (e.g. pine stairs → white oak)</li>
                <li className="flex gap-2"><span className="text-amber-500 shrink-0">→</span>You want stained stringers (only possible with new treads)</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <p className="text-blue-800 font-semibold mb-2">💡 The Carpet Mystery</p>
            <p className="text-blue-700 text-sm">If your stairs are carpeted, you won&apos;t know what&apos;s underneath until the carpet comes off. In our experience across Markham and Toronto homes, about 60% of carpeted stairs have acceptable hardwood treads underneath — refinishable at $125/step. The other 40% have MDF or damaged wood that needs replacement at $185/step. Our free in-home estimate includes peeling back a corner of carpet to check before you commit to anything.</p>
          </div>
        </section>

        {/* Section 4: Wood Species */}
        <section id="wood-species">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Best Wood Species for Stair Treads</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-6">
            Stairs take more concentrated traffic and impact than any floor in the house. Species choice matters more here than anywhere else.
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-stone-100">
                  <th className="text-left p-3 font-semibold text-stone-800 border-b-2 border-stone-300">Species</th>
                  <th className="text-center p-3 font-semibold text-stone-800 border-b-2 border-stone-300">Janka Hardness</th>
                  <th className="text-left p-3 font-semibold text-stone-800 border-b-2 border-stone-300">Stain Options</th>
                  <th className="text-left p-3 font-semibold text-stone-800 border-b-2 border-stone-300">Best For</th>
                </tr>
              </thead>
              <tbody className="text-stone-600">
                <tr className="border-b bg-amber-50"><td className="p-3 font-semibold">White Oak ⭐</td><td className="p-3 text-center">1,360 lbf</td><td className="p-3">All stains, esp. grey/brown tones</td><td className="p-3">Modern homes, open-riser designs, matching current floors</td></tr>
                <tr className="border-b"><td className="p-3 font-semibold">Hickory</td><td className="p-3 text-center">1,820 lbf</td><td className="p-3">Natural/light stains (strong grain)</td><td className="p-3">Maximum durability, rustic/organic aesthetics</td></tr>
                <tr className="border-b bg-stone-50"><td className="p-3 font-semibold">Hard Maple</td><td className="p-3 text-center">1,450 lbf</td><td className="p-3">Light/blonde, contemporary stains</td><td className="p-3">Scandinavian/modern interiors, light colour palettes</td></tr>
                <tr className="border-b"><td className="p-3 font-semibold">Red Oak ✦ Standard</td><td className="p-3 text-center">1,290 lbf</td><td className="p-3">Traditional warm tones, most stains</td><td className="p-3">Budget-conscious, traditional interiors, classic look</td></tr>
                <tr><td className="p-3 font-semibold">Walnut</td><td className="p-3 text-center">1,010 lbf</td><td className="p-3">Natural walnut (rarely stained)</td><td className="p-3">Luxury aesthetics — best in lower-traffic areas</td></tr>
              </tbody>
            </table>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 mb-6">
            <p className="text-stone-800 font-semibold mb-2">Our Recommendation</p>
            <p className="text-stone-600 text-sm">White oak dominates 2026 GTA renovation projects — hard enough for stair traffic, takes the full range of modern stains, and matches the majority of current hardwood floor species. Red oak is the calculator standard (default price). White oak and maple are available — contact us for pricing. If you have large dogs or extremely heavy traffic, Hickory is the call.</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-stone-800 font-semibold mb-2">🎯 Match Your Stairs to Your Floors</p>
            <p className="text-stone-600 text-sm">Doing stairs and flooring together? Choose stair treads in the same species as your new floors for a seamless transition. Browse our <Link href="/engineered-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">engineered hardwood collection</Link> or <Link href="/solid-hardwood-flooring" className="text-amber-700 underline hover:text-amber-800">solid hardwood options</Link> to find your match.</p>
          </div>
        </section>

        {/* Section 5: Railing Options */}
        <section id="railing-options">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Railing &amp; Baluster Options</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
              <h3 className="font-bold text-stone-800 mb-2">🔩 Iron / Metal Pickets</h3>
              <p className="text-stone-600 text-sm mb-3">The dominant choice in 2026. Thinner profile opens up the staircase visually, zero maintenance, available in matte black, brushed nickel, oil-rubbed bronze. Straight, twisted, or basket designs.</p>
              <p className="text-amber-700 font-semibold text-sm">$25/piece installed (includes material)</p>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
              <h3 className="font-bold text-stone-800 mb-2">🪵 Wood Balusters</h3>
              <p className="text-stone-600 text-sm mb-3">Classic and traditional. Available in square, turned (colonial), and craftsman styles. Painted white is most common. Match or contrast with your tread species. Require refinishing every 10–15 years.</p>
              <p className="text-amber-700 font-semibold text-sm">$25/piece installed (includes material)</p>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
              <h3 className="font-bold text-stone-800 mb-2">🪟 Glass Panels</h3>
              <p className="text-stone-600 text-sm mb-3">Frameless or framed tempered glass panels — sleek, ultra-modern, maximum light flow. Popular in contemporary and luxury renovations. Custom fabrication — lead time applies.</p>
              <p className="text-stone-500 text-sm italic">Custom quote required</p>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
              <h3 className="font-bold text-stone-800 mb-2">🔄 Handrail Refinishing</h3>
              <p className="text-stone-600 text-sm mb-3">If your existing handrail is solid wood in good condition, refinishing (sand, stain, new finish coat) is often the best bang-for-buck upgrade. Takes 1 day, dramatically refreshes the look.</p>
              <p className="text-amber-700 font-semibold text-sm">$25/linear foot</p>
            </div>
          </div>
        </section>

        {/* Section 6: Vinyl Caps */}
        <section id="vinyl-caps">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Vinyl Stair Caps: The Budget-Friendly Option</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-6">
            Vinyl stair caps (also called stair covers or overlays) fit directly over your existing treads without any demolition. They&apos;re the fastest and most affordable way to upgrade carpeted or worn stairs — especially when you&apos;re doing a full vinyl plank installation throughout the home.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
              <div className="text-2xl mb-2">💧</div>
              <p className="font-semibold text-blue-800 mb-1">100% Waterproof</p>
              <p className="text-stone-600 text-sm">Same waterproof performance as your LVP floors — ideal for pet households</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
              <div className="text-2xl mb-2">🎨</div>
              <p className="font-semibold text-blue-800 mb-1">Colour-Matched</p>
              <p className="text-stone-600 text-sm">Available in coordinating colours that match your vinyl plank flooring for a seamless look</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
              <div className="text-2xl mb-2">⚡</div>
              <p className="font-semibold text-blue-800 mb-1">Fast Installation</p>
              <p className="text-stone-600 text-sm">No demolition, no subfloor prep — most staircases done in a single day</p>
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
            <p className="text-stone-800 font-semibold mb-2">When Vinyl Caps Make Sense</p>
            <ul className="space-y-2 text-stone-600 text-sm">
              <li className="flex gap-2"><span className="text-amber-500 shrink-0">→</span>You&apos;re installing vinyl plank throughout and want a matching staircase</li>
              <li className="flex gap-2"><span className="text-amber-500 shrink-0">→</span>Budget is the primary concern and hardwood is not a priority</li>
              <li className="flex gap-2"><span className="text-amber-500 shrink-0">→</span>You have pets and want a fully waterproof staircase solution</li>
              <li className="flex gap-2"><span className="text-amber-500 shrink-0">→</span>The existing tread structure is solid but cosmetically worn</li>
              <li className="flex gap-2"><span className="text-amber-500 shrink-0">→</span>Rental property renovation — maximum durability, minimum cost</li>
            </ul>
          </div>
        </section>

        {/* Section 7: Carpet Removal */}
        <section id="carpet-removal">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Converting Carpet Stairs to Hardwood: The Full Process</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-6">
            Carpet-to-hardwood stair conversion is one of our most popular projects. The transformation is dramatic, and the result lasts decades instead of years.
          </p>

          <div className="space-y-4 mb-8">
            {[
              { step: '1', title: 'Free In-Home Assessment', desc: 'We peel back a corner of carpet to check what\'s underneath before you commit. About 60% of carpeted stairs in GTA homes have acceptable hardwood treads — refinishable at $125/step instead of new treads at $185/step. We\'ll tell you upfront.' },
              { step: '2', title: 'Carpet & Tack Strip Removal', desc: 'We remove all carpet, padding, tack strips, and staples from every step. This is included in the new tread price — no separate carpet removal charge.' },
              { step: '3', title: 'Subfloor Assessment', desc: 'If existing treads are usable → refinish (sand, stain, finish). If treads are MDF or damaged → install new solid hardwood treads at $185/step.' },
              { step: '4', title: 'Tread Work (Refinish or Install)', desc: 'Refinishing: 2–3 sand passes, custom stain, 2–3 finish coats. New treads: cut to width, fasten securely, fill nail holes, finish with matching stain and sealer.' },
              { step: '5', title: 'Risers, Nosings & Stringers', desc: 'New risers (painted white is standard), nosing installation or refinishing ($20–$25/lf), and stringer work if included in scope.' },
              { step: '6', title: 'Optional: Railing Upgrade', desc: 'While the staircase is open, many clients add new iron pickets, posts, or handrail refinishing. Cost-effective to combine — one visit, one disruption.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">{step}</div>
                <div>
                  <p className="font-semibold text-stone-800">{title}</p>
                  <p className="text-stone-600 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 8: Timeline */}
        <section id="timeline">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">What to Expect: Project Timeline</h2>

          <div className="overflow-x-auto mb-8">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-stone-100">
                  <th className="text-left p-3 font-semibold text-stone-800 border-b-2 border-stone-300">Project Type</th>
                  <th className="text-center p-3 font-semibold text-stone-800 border-b-2 border-stone-300">Duration</th>
                  <th className="text-left p-3 font-semibold text-stone-800 border-b-2 border-stone-300">Walkable After</th>
                </tr>
              </thead>
              <tbody className="text-stone-600">
                <tr className="border-b"><td className="p-3 font-medium">Refinish only (sand + stain + finish)</td><td className="p-3 text-center">2–3 days</td><td className="p-3">Socks OK after 24 hrs; shoes after 48–72 hrs</td></tr>
                <tr className="border-b bg-stone-50"><td className="p-3 font-medium">New treads (straight staircase)</td><td className="p-3 text-center">1–2 days</td><td className="p-3">Following day with care</td></tr>
                <tr className="border-b"><td className="p-3 font-medium">Vinyl stair caps</td><td className="p-3 text-center">1 day</td><td className="p-3">Same day</td></tr>
                <tr className="border-b bg-stone-50"><td className="p-3 font-medium">Full renovation (treads + rails + pickets + posts)</td><td className="p-3 text-center">3–5 days</td><td className="p-3">2–3 days for tread portions</td></tr>
                <tr><td className="p-3 font-medium">Carpet removal + new treads + railing upgrade</td><td className="p-3 text-center">4–6 days</td><td className="p-3">Day 2–3 for treads; full use day 4–5</td></tr>
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
            <p className="text-blue-800 font-semibold mb-2">📅 Booking &amp; Lead Time</p>
            <p className="text-blue-700 text-sm">From initial contact to project start is typically 7–14 days depending on season. Spring (April–June) is our busiest period — book early for summer timelines. Free in-home estimates available within 2–3 business days of your call.</p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <p className="text-emerald-800 font-semibold mb-2">💰 Save by Combining Projects</p>
            <p className="text-emerald-700 text-sm">Most GTA homeowners who do stairs also do at least one room of flooring. Combining stair renovation with a <Link href="/installation" className="text-amber-700 underline hover:text-amber-800">flooring installation project</Link> saves you a second mobilization fee and often gets you into a faster timeline. Use our <Link href="/quote-calculator" className="text-amber-700 underline hover:text-amber-800">quote calculator</Link> to estimate your combined project cost, or <Link href="/free-measurement" className="text-amber-700 underline hover:text-amber-800">book a free measurement</Link> for an exact quote covering everything.</p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Frequently Asked Questions</h2>

          <div className="space-y-4">
            {[
              { q: 'How much does a staircase renovation cost in Toronto?', a: 'Refinishing runs $125/step; new straight treads $185/step; pie/bullnose steps $225/step; iron or wood pickets $25/piece; new posts $150 each; railing refinish $25/lf; new railing $50/lf; stringers from $350/side. A full 13-step carpet-to-hardwood conversion with new treads (carpet removal included) runs $2,600–$3,000. A complete renovation with new rails, pickets, and posts runs $4,500–$6,000+. Use the calculator above or call for a free in-home estimate.' },
              { q: 'How much does it cost to replace a banister in Toronto?', a: 'Banister replacement at BBS Flooring: new posts $150 each, new railing $50/lf, new iron or wood pickets $25/piece. A typical banister upgrade on a 13-step staircase (2 posts + 26 pickets + 10 lf new rail) runs approximately $1,450–$1,700 installed. Refinishing an existing wood railing is $25/lf — a 10 lf railing is $250.' },
              { q: 'What is a stringer on stairs and how much does it cost?', a: 'The stringer is the angled side board that runs along the length of the staircase and supports the treads. BBS Flooring installs new stringers at $350/side (white painted) or $900/side (stained to match treads). Stained stringers are only available when installing new treads — refinishing mode locks stringers to white.' },
              { q: 'How much does a stair landing cost to install?', a: 'Stair landing installation at BBS Flooring: small landing (3×3 ft) is $300, large landing (6×3 ft) is $600. We use hardwood stained on-site to match your treads.' },
              { q: 'How many pickets do I need for my staircase?', a: 'Most residential staircases use 2–3 pickets per step, depending on tread width and Ontario Building Code requirements. A standard 13-step staircase typically needs 26–39 pickets. At $25/piece installed, that\'s $650–$975 for pickets alone. Iron and wood pickets are the same price at BBS Flooring. Use the calculator above for an exact count.' },
              { q: 'Should I refinish or replace my stair treads?', a: 'Refinish if: your existing treads are solid hardwood in good structural condition. Replace if: treads are damaged, too thin to sand again, MDF/composite, or you want a different species. Refinishing costs $125/step vs $185/step for new treads — that\'s 32% less. If stairs are carpeted, we check what\'s underneath during the free in-home assessment before you commit.' },
              { q: 'Can you match new stair treads to my existing hardwood floors?', a: 'Yes. We carry white oak, red oak, maple, and hickory treads and can stain-match to your existing floors. For perfect matches, we recommend doing stairs and adjacent flooring in the same project, using the same stain batch.' },
              { q: 'Are iron balusters better than wood?', a: 'For most 2026 GTA renovations, yes. Iron pickets are thinner (more open visual feel), zero maintenance, structurally stronger, and at BBS they\'re the same price as wood ($25/piece). Wood suits traditional or farmhouse styles and pairs well with painted white railings.' },
              { q: 'What areas do you serve for staircase renovation?', a: 'BBS Flooring provides staircase renovation across Markham, Toronto, Scarborough, Pickering, Ajax, Whitby, Oshawa, Richmond Hill, Vaughan, Stouffville, and the full GTA. Our showroom is at 6061 Highway 7, Unit B, Markham.' },
            ].map(({ q, a }, i) => (
              <div key={i} className="bg-stone-50 border border-stone-200 rounded-xl p-5">
                <p className="font-semibold text-stone-800 mb-2">{q}</p>
                <p className="text-stone-600 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-stone-900 to-amber-900 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Staircase?</h2>
          <p className="text-stone-300 text-lg mb-8 max-w-2xl mx-auto">
            Get a free, no-obligation in-home estimate. We&apos;ll assess your stairs, check what&apos;s under the carpet, and give you a line-item quote on the spot.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/free-measurement" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
              Book Free Estimate
            </Link>
            <a href="tel:6474281111" className="border-2 border-white/30 hover:bg-white/10 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
              Call (647) 428-1111
            </a>
          </div>
          <p className="text-stone-400 text-sm mt-6">
            BBS Flooring · 6061 Highway 7, Unit B, Markham · (647) 428-1111
          </p>
        </section>

      </main>

      <Footer />
    </div>
  );
}
