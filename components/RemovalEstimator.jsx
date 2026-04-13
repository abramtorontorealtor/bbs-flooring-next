'use client';

import { useState } from 'react';

/**
 * Reusable removal estimator — adapts the CarpetRemovalEstimator pattern
 * for any removal type (hardwood, tile, vinyl/laminate).
 *
 * @param {number}   ratePerSqft   - Price per sqft for this removal type
 * @param {number}   haulAwayFee   - Flat haul-away fee (default 75)
 * @param {string}   removalType   - Label for the removal type (e.g. 'Hardwood Removal')
 * @param {string}   source        - Source tag for contact form (e.g. 'hardwood-removal-estimator')
 * @param {number}   maxSqft       - Maximum slider value (default 3000)
 * @param {string}   creditLabel   - CTA label for the credit/incentive
 */
export default function RemovalEstimator({
  ratePerSqft = 1.5,
  haulAwayFee = 75,
  removalType = 'Floor Removal',
  source = 'removal-estimator',
  maxSqft = 3000,
  creditLabel = '$100 Floor Replacement Credit',
}) {
  const [sqft, setSqft] = useState(500);
  const [hauling, setHauling] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const basePrice = sqft * ratePerSqft;
  const haulingFeeTotal = hauling ? haulAwayFee : 0;
  const total = basePrice + haulingFeeTotal;

  const handleSlider = (e) => setSqft(Number(e.target.value));
  const handleSqftInput = (e) => {
    const val = Math.max(0, Math.min(maxSqft, Number(e.target.value) || 0));
    setSqft(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !email) { setError('Please fill in all fields.'); return; }
    setError('');
    setLoading(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          message: `${removalType.toUpperCase()} ESTIMATE — Sqft: ${sqft} | Haul-Away: ${hauling ? `Yes (+$${haulAwayFee})` : 'No'} | Estimated Total: $${total.toFixed(2)} CAD`,
          source,
        }),
      });
      setSubmitted(true);
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'generate_lead', { event_category: 'removal_estimator', event_label: source, value: total });
      }
    } catch {
      setError('Something went wrong. Please try again or call us directly.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center border border-green-100">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Estimate Submitted!</h3>
        <p className="text-slate-600 text-lg">A flooring specialist will contact you shortly to confirm your {removalType.toLowerCase()} details.</p>
        <div className="mt-6 bg-amber-50 rounded-xl p-4 border border-amber-200">
          <p className="text-sm font-semibold text-amber-800">Your {creditLabel} has been reserved.</p>
          <p className="text-sm text-amber-700 mt-1">Estimated Total: <strong>${total.toFixed(2)} CAD</strong></p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5 md:px-8">
        <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">Instant Price Calculator</p>
        <h2 className="text-white text-xl md:text-2xl font-bold">Get Your {removalType} Estimate</h2>
        <p className="text-slate-300 text-sm mt-1">Transparent flat-rate pricing. No surprises.</p>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* Sqft Input */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-slate-700">Area to Remove (sq ft)</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={sqft}
                onChange={handleSqftInput}
                min={0} max={maxSqft}
                className="w-20 text-right border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-400"
              />
              <span className="text-xs text-slate-500 font-medium">sqft</span>
            </div>
          </div>
          <input
            type="range" min={0} max={maxSqft} step={50} value={sqft}
            onChange={handleSlider}
            className="w-full h-2 rounded-full accent-amber-500 cursor-pointer"
            style={{ background: `linear-gradient(to right, #f59e0b ${(sqft / maxSqft) * 100}%, #e2e8f0 ${(sqft / maxSqft) * 100}%)` }}
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>0 sqft</span><span>{(maxSqft / 2).toLocaleString()}</span><span>{maxSqft.toLocaleString()}+ sqft</span>
          </div>
        </div>

        {/* Haul-Away Toggle */}
        <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200 cursor-pointer hover:border-amber-300 transition-colors">
          <div>
            <p className="text-sm font-semibold text-slate-700">Include Disposal &amp; Haul-Away</p>
            <p className="text-xs text-slate-400 mt-0.5">We remove all debris from your property</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-green-600">+ ${haulAwayFee}</span>
            <button
              type="button"
              onClick={() => setHauling(!hauling)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${hauling ? 'bg-amber-500' : 'bg-slate-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${hauling ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </label>

        {/* Price Breakdown */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Price Breakdown</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>{removalType} ({sqft.toLocaleString()} sqft × ${ratePerSqft.toFixed(2)})</span>
              <span className="font-semibold">${basePrice.toFixed(2)}</span>
            </div>
            {hauling && (
              <div className="flex justify-between text-sm text-slate-600">
                <span>Disposal &amp; Haul-Away</span>
                <span className="font-semibold">${haulAwayFee.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-3 mt-3 flex justify-between items-center">
              <span className="text-base font-bold text-slate-800">Estimated Total</span>
              <div className="text-right">
                <span className="text-2xl font-black text-amber-600">${total.toFixed(2)}</span>
                <span className="text-xs text-slate-400 block">CAD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Form */}
        <div className="border-t border-slate-100 pt-6">
          <div className="mb-4">
            <p className="text-lg font-bold text-slate-800">Lock In Your Price &amp; Get a {creditLabel}</p>
            <p className="text-sm text-slate-500 mt-1">No commitment. A specialist will call to confirm your date.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
            <input
              type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
            <input
              type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold py-4 rounded-xl text-base transition-colors disabled:opacity-60 shadow-lg shadow-amber-200"
            >
              {loading ? 'Submitting...' : `🔒 Lock In My ${creditLabel} →`}
            </button>
            <p className="text-xs text-center text-slate-400">No spam. No obligation. We&apos;ll call within 1 business hour.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
