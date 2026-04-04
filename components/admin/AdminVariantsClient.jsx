'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { entities } from '@/lib/base44-compat';
import { useAuth } from '@/lib/auth-context';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Layers } from 'lucide-react';
import { toast } from 'sonner';

// ─── ProductVariantCard ───────────────────────────────────────────────────────
function ProductVariantCard({ product, expanded, onToggle, onSave, saving, onChange }) {
  const variants = useMemo(() => {
    try {
      return JSON.parse(product.variants_json || '[]');
    } catch {
      return [];
    }
  }, [product.variants_json]);

  function updateVariantField(index, field, value) {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...product, variants_json: JSON.stringify(updated) });
  }

  function addVariant() {
    const newVariant = {
      sku: '',
      label: '',
      dimensions: '',
      width: '',
      pattern: 'Standard',
      grade: '',
      thickness: '',
      length: 'RL',
      price_per_sqft: 0,
      sale_price: null,
      sqft_box: 20,
      in_stock: true,
      on_sale: false,
    };
    onChange({ ...product, variants_json: JSON.stringify([...variants, newVariant]) });
  }

  function removeVariant(index) {
    if (!window.confirm('Remove this variant?')) return;
    const updated = variants.filter((_, i) => i !== index);
    onChange({ ...product, variants_json: JSON.stringify(updated) });
  }

  function bulkPriceUpdate() {
    const adjustment = window.prompt(
      'Enter price adjustment for ALL variants of this product.\n' +
        'Examples: "+0.50" or "-0.25" or "=4.99" (set exact)\n' +
        'This adjusts the regular price (price_per_sqft).'
    );
    if (!adjustment) return;

    const updated = variants.map((v) => {
      let newPrice;
      if (adjustment.startsWith('=')) {
        newPrice = parseFloat(adjustment.slice(1));
      } else {
        newPrice = (v.price_per_sqft || 0) + parseFloat(adjustment);
      }
      newPrice = Math.round(newPrice * 100) / 100;
      return { ...v, price_per_sqft: newPrice };
    });
    onChange({ ...product, variants_json: JSON.stringify(updated) });
  }

  const lowestPrice = variants.length ? Math.min(...variants.map((v) => v.price_per_sqft || 0)) : 0;

  return (
    <div className="border rounded-xl mb-4 overflow-hidden shadow-sm">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 bg-white hover:bg-slate-50 transition text-left"
      >
        <div className="flex items-center gap-4">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-10 h-10 rounded object-cover flex-shrink-0"
            />
          )}
          <div>
            <span className="text-base font-semibold text-slate-900">{product.name}</span>
            <span className="text-sm text-slate-500 ml-3">
              {variants.length} variant{variants.length !== 1 ? 's' : ''}
              {' · '}From ${lowestPrice.toFixed(2)}/sqft
            </span>
            {product.brand && (
              <span className="text-xs text-slate-400 ml-2">· {product.brand}</span>
            )}
          </div>
        </div>
        <span className="text-slate-400 text-sm">{expanded ? '▲' : '▼'}</span>
      </button>

      {/* Expanded editor */}
      {expanded && (
        <div className="px-6 pb-6 bg-slate-50 border-t border-slate-200">
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 uppercase text-xs border-b border-slate-200">
                  <th className="pb-2 pr-2">SKU</th>
                  <th className="pb-2 pr-2">Label</th>
                  <th className="pb-2 pr-2">Grade</th>
                  <th className="pb-2 pr-2">Dimensions</th>
                  <th className="pb-2 pr-2">Price $/sqft</th>
                  <th className="pb-2 pr-2">Sale $</th>
                  <th className="pb-2 pr-2">Sqft/Box</th>
                  <th className="pb-2 pr-2">Stock</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {variants.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-slate-400 text-sm">
                      No variants yet. Click &quot;+ Add Variant&quot; below.
                    </td>
                  </tr>
                )}
                {variants.map((v, i) => (
                  <tr key={i} className="border-t border-slate-200">
                    <td className="py-2 pr-2">
                      <input
                        value={v.sku || ''}
                        onChange={(e) => updateVariantField(i, 'sku', e.target.value)}
                        className="border rounded px-2 py-1 w-32 text-xs font-mono bg-white"
                        placeholder="VID-XXX-5-SEL"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        value={v.label || ''}
                        onChange={(e) => updateVariantField(i, 'label', e.target.value)}
                        className="border rounded px-2 py-1 w-40 bg-white text-sm"
                        placeholder='5" Herringbone — Select'
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        value={v.grade || ''}
                        onChange={(e) => updateVariantField(i, 'grade', e.target.value)}
                        className="border rounded px-2 py-1 w-28 bg-white text-sm"
                        placeholder="Select"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        value={v.dimensions || ''}
                        onChange={(e) => updateVariantField(i, 'dimensions', e.target.value)}
                        className="border rounded px-2 py-1 w-40 bg-white text-sm"
                        placeholder='5"x¾"xRL'
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        step="0.01"
                        value={v.price_per_sqft || ''}
                        onChange={(e) =>
                          updateVariantField(i, 'price_per_sqft', parseFloat(e.target.value) || 0)
                        }
                        className="border rounded px-2 py-1 w-20 font-medium text-green-700 bg-white"
                        placeholder="3.99"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        step="0.01"
                        value={v.sale_price || ''}
                        onChange={(e) => {
                          const val = e.target.value ? parseFloat(e.target.value) : null;
                          updateVariantField(i, 'sale_price', val);
                          updateVariantField(i, 'on_sale', val != null && val > 0);
                        }}
                        className="border rounded px-2 py-1 w-20 text-red-600 bg-white"
                        placeholder="—"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        value={v.sqft_box || 20}
                        onChange={(e) =>
                          updateVariantField(i, 'sqft_box', parseFloat(e.target.value) || 20)
                        }
                        className="border rounded px-2 py-1 w-16 bg-white text-sm"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="checkbox"
                        checked={v.in_stock !== false}
                        onChange={(e) => updateVariantField(i, 'in_stock', e.target.checked)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="py-2">
                      <button
                        onClick={() => removeVariant(i)}
                        className="text-red-400 hover:text-red-600 text-sm font-bold px-1"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-4 mt-5">
            <button
              onClick={addVariant}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              + Add Variant
            </button>
            <button
              onClick={bulkPriceUpdate}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Bulk Price Update
            </button>
            <div className="flex-1" />
            <button
              onClick={() => onSave(product)}
              disabled={saving}
              className="px-5 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 transition flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Variant Manager ──────────────────────────────────────────────────────────
function VariantManager() {
  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    async function load() {
      setLoadingProducts(true);
      try {
        // Paginate through all products to get variant ones
        let all = [];
        let skip = 0;
        const limit = 200;
        while (true) {
          const page = await entities.Product.list('-created_date', limit, skip);
          all = [...all, ...page];
          if (page.length < limit) break;
          skip += limit;
        }
        setAllProducts(all.filter((p) => p.has_variants && p.variants_json));
      } finally {
        setLoadingProducts(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(
    () =>
      allProducts.filter(
        (p) =>
          !search ||
          (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
          (p.sku || '').toLowerCase().includes(search.toLowerCase()) ||
          (p.brand || '').toLowerCase().includes(search.toLowerCase())
      ),
    [allProducts, search]
  );

  async function saveProduct(product) {
    setSaving(product.id);
    try {
      const variants = JSON.parse(product.variants_json || '[]');
      const prices = variants.map((v) => v.on_sale && v.sale_price ? v.sale_price : v.price_per_sqft).filter((p) => p > 0);
      const lowestPrice = prices.length ? Math.min(...prices) : null;

      await entities.Product.update(product.id, {
        variants_json: product.variants_json,
        has_variants: variants.length > 0,
        variant_count: variants.length,
        ...(lowestPrice != null && { starting_price: lowestPrice }),
      });
      toast.success('Variants saved!');
    } catch (err) {
      toast.error('Save failed: ' + err.message);
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-6 h-6 text-amber-500" />
          Variant Manager
        </h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loadingProducts ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-6">
            {filtered.length} products with variants
            {search ? ` (filtered from ${allProducts.length})` : ''}
          </p>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">No products match your search.</div>
          ) : (
            filtered.map((product) => (
              <ProductVariantCard
                key={product.id}
                product={product}
                expanded={expandedId === product.id}
                onToggle={() =>
                  setExpandedId(expandedId === product.id ? null : product.id)
                }
                onSave={saveProduct}
                saving={saving === product.id}
                onChange={(updated) =>
                  setAllProducts((prev) =>
                    prev.map((p) => (p.id === updated.id ? updated : p))
                  )
                }
              />
            ))
          )}
        </>
      )}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function AdminVariantsClient() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
          <p className="text-slate-600">Admin privileges required.</p>
        </div>
      </div>
    );
  }

  return <VariantManager />;
}
