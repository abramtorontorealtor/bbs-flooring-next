'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
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
      const publicPrice = product.public_price || product.price_per_sqft;
      const item = await entities.SavedItem.create({ user_email: user.email, user_id: user.id, product_id: product.id, product_name: product.name, product_sku: product.sku, product_slug: product.slug, product_image_url: product.image_url, product_price: publicPrice, product_category: product.category });
      setSaved(true); setSavedItemId(item.id);
      toast.success('Saved to your profile!');
    }
    setLoading(false);
  };

  return (
    <button onClick={handleToggle} disabled={loading} title={saved ? 'Remove from saved' : 'Save to profile'} className={`flex items-center gap-1.5 transition-colors ${saved ? 'text-red-500' : 'text-slate-400 hover:text-red-400'} ${className}`}>
      <Heart className={`w-5 h-5 ${saved ? 'fill-red-500' : ''}`} />
    </button>
  );
}
