'use client';

import React, { useState, useEffect } from 'react';
/* Heart inline SVG — avoids importing entire lucide-react */
function HeartIcon({ className, filled }) {
  return <svg className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>;
}
import { entities } from '@/lib/base44-compat';
import { toast } from 'sonner';

export default function SaveButton({ product, user, isSaved: isSavedProp, className = '' }) {
  const [saved, setSaved] = useState(isSavedProp ?? false);
  const [savedItemId, setSavedItemId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSavedProp !== undefined) setSaved(isSavedProp);
  }, [isSavedProp]);

  useEffect(() => {
    if (isSavedProp !== undefined || !user) return;
    entities.SavedItem.filter({ user_email: user.email, product_id: product.id })
      .then(items => {
        if (items.length > 0) { setSaved(true); setSavedItemId(items[0].id); }
      })
      .catch(() => {});
  }, [user, product.id, isSavedProp]);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { window.location.href = '/login'; return; }
    setLoading(true);
    if (saved && savedItemId) {
      await entities.SavedItem.delete(savedItemId);
      setSaved(false); setSavedItemId(null);
      toast.success('Removed from saved items');
    } else {
      const publicPrice = product.price_per_sqft;
      const item = await entities.SavedItem.create({ user_email: user.email, user_id: user.id, product_id: product.id, product_name: product.name, product_sku: product.sku, product_slug: product.slug, product_image_url: product.image_url, product_price: publicPrice, product_category: product.category });
      setSaved(true); setSavedItemId(item.id);
      toast.success('Saved to your profile!');
    }
    setLoading(false);
  };

  return (
    <button onClick={handleToggle} disabled={loading} title={saved ? 'Remove from saved' : 'Save to profile'} className={`flex items-center gap-1.5 transition-colors ${saved ? 'text-red-500' : 'text-slate-400 hover:text-red-400'} ${className}`}>
      <HeartIcon className={`w-5 h-5 ${saved ? 'text-red-500' : ''}`} filled={saved} />
    </button>
  );
}
