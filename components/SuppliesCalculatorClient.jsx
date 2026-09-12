'use client';

// ─────────────────────────────────────────────────────────────────────────────
// SuppliesCalculatorClient — standalone floor type + subfloor + sqft → kit
// recommendation (S3, Sep 12 2026). Small, mobile-first, one screen.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Package, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { entities } from '@/lib/base44-compat';
import { Analytics } from '@/components/analytics';
import { FLOOR_TYPE_OPTIONS, SUBFLOOR_OPTIONS, recommendSupplyKit } from '@/lib/supplyCalculator';

function getSessionId() {
  let sid = typeof window !== 'undefined' && localStorage.getItem('bbs_session_id');
  if (!sid) {
    sid = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    if (typeof window !== 'undefined') localStorage.setItem('bbs_session_id', sid);
  }
  return sid;
}

export default function SuppliesCalculatorClient({ catalog }) {
  const [floorType, setFloorType] = useState('laminate');
  const [subfloor, setSubfloor] = useState('plywood');
  const [sqft, setSqft] = useState('');
  const [checked, setChecked] = useState({});
  const [usedOnce, setUsedOnce] = useState(false);

  const result = useMemo(() => {
    if (!sqft || parseFloat(sqft) <= 0) return null;
    if (!usedOnce) {
      setUsedOnce(true);
      Analytics.trackEvent('supplies_calculator_use', 'accessory', `${floorType}:${subfloor}`);
    }
    return recommendSupplyKit({ floorType, subfloor, sqft }, catalog);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floorType, subfloor, sqft, catalog]);

  const toggle = (key) => setChecked((c) => ({ ...c, [key]: !c[key] }));

  const addOne = async (l) => {
    const sid = getSessionId();
    const unitDesc = l.item.pack_size || (l.item.coverage_sqft ? `${l.item.coverage_sqft} sqft ${l.item.unit}` : l.item.unit);
    const data = {
      session_id: sid,
      item_type: 'accessory',
      transition_type: l.item.key,
      sku: l.item.key,
      quantity: l.qty,
      transition_quantity: l.qty,
      product_name: `${l.item.label} (${unitDesc})`,
      parent_product_id: null,
      parent_product_name: null,
      image_url: l.item.image,
      line_total: Math.round(l.item.price * l.qty * 100) / 100,
    };
    await entities.CartItem.create(data);
  };

  const addAll = async () => {
    if (!result) return;
    const toAdd = result.lines.filter((l) => l.required !== false || checked[l.key]);
    if (toAdd.length === 0) {
      toast.error('Nothing selected to add');
      return;
    }
    try {
      for (const l of toAdd) await addOne(l);
      toast.success(`Added ${toAdd.length} item${toAdd.length > 1 ? 's' : ''} to cart`);
      window.dispatchEvent(new Event('cartUpdated'));
      Analytics.trackEvent(
        'supplies_calculator_use',
        'accessory',
        `add_all:${floorType}:${subfloor}:${toAdd.length}items`
      );
    } catch (err) {
      toast.error('Failed to add to cart');
      console.error(err);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 p-5 sm:p-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-semibold text-slate-700">Floor type</label>
          <select
            value={floorType}
            onChange={(e) => setFloorType(e.target.value)}
            className="mt-1.5 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm bg-white"
          >
            {FLOOR_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700">Subfloor</label>
          <select
            value={subfloor}
            onChange={(e) => setSubfloor(e.target.value)}
            className="mt-1.5 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm bg-white"
          >
            {SUBFLOOR_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700">Square footage</label>
          <Input
            type="number"
            min="0"
            inputMode="decimal"
            placeholder="e.g. 500"
            value={sqft}
            onChange={(e) => setSqft(e.target.value)}
            className="mt-1.5 h-10"
          />
        </div>
      </div>

      {result && (
        <div className="mt-6 border-t border-slate-100 pt-6">
          <p className="text-slate-700 text-sm leading-relaxed">{result.headline}</p>

          {result.lines.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No extra supplies recommended for this combination — just your flooring and finish pieces.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {result.lines.map((l) => (
                <div key={l.key} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                    {l.item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={l.item.image} alt={l.item.label} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {l.required === false && (
                        <Checkbox checked={!!checked[l.key]} onCheckedChange={() => toggle(l.key)} aria-label={`Include ${l.item.label}`} />
                      )}
                      <Link href={`/flooring-accessories/${l.item.code}`} className="text-sm font-semibold text-slate-800 hover:text-amber-700 hover:underline truncate">
                        {l.item.label}
                      </Link>
                      {l.required === false && <span className="text-[10px] font-semibold uppercase text-slate-400">Optional</span>}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{l.qty} {l.qty === 1 ? l.item.unit : `${l.item.unit}s`} {l.hint && `— ${l.hint}`}</div>
                    {l.note && <div className="text-xs text-slate-400 mt-0.5">{l.note}</div>}
                  </div>
                  <div className="text-sm font-bold text-slate-900 shrink-0">${(l.item.price * l.qty).toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}

          {result.lines.length > 0 && (
            <div className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-amber-50 border border-amber-200 p-4">
              <div>
                <div className="text-xs text-amber-800 font-semibold uppercase tracking-wide">Estimated total</div>
                <div className="text-xl font-bold text-slate-900">${result.total.toFixed(2)}</div>
              </div>
              <Button type="button" onClick={addAll} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold">
                <Plus className="w-4 h-4 mr-1" /> Add all to cart
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
