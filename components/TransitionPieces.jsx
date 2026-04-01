'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Info } from 'lucide-react';
import { toast } from 'sonner';
import { entities } from '@/lib/base44-compat';

const TRANSITION_PRICES = {
  t_moulding: 25,
  reducer: 25,
  stair_nosing: 30,
};

const TRANSITION_LABELS = {
  t_moulding: 'T-Moulding',
  reducer: 'Reducer',
  stair_nosing: 'Stair Nosing',
};

export default function TransitionPieces({ product, sessionId, onTransitionAdded }) {
  const [quantities, setQuantities] = useState({
    t_moulding: 0,
    reducer: 0,
    stair_nosing: 0,
  });

  const handleQuantityChange = (type, value) => {
    const qty = Math.max(0, parseInt(value) || 0);
    setQuantities(prev => ({ ...prev, [type]: qty }));
  };

  const handleAddTransition = async (type) => {
    const qty = quantities[type];
    if (qty <= 0) {
      toast.error('Please enter a quantity greater than 0');
      return;
    }

    const transitionData = {
      session_id: sessionId,
      item_type: 'transition',
      transition_type: type,
      transition_quantity: qty,
      parent_product_id: product.product_id || product.id,
      parent_product_name: product.product_name || product.name,
      product_name: `${TRANSITION_LABELS[type]} (8ft) — Matches ${product.product_name || product.name}`,
      sku: `TRANS-${type.toUpperCase()}-${product.sku || product.id}`,
      line_total: qty * TRANSITION_PRICES[type],
    };

    try {
      await entities.CartItem.create(transitionData);
      toast.success(`Added ${qty}× ${TRANSITION_LABELS[type]}`);
      setQuantities(prev => ({ ...prev, [type]: 0 }));
      window.dispatchEvent(new Event('cartUpdated'));
      if (onTransitionAdded) onTransitionAdded();
    } catch (error) {
      toast.error('Failed to add transition piece');
      console.error(error);
    }
  };

  return (
    <Card className="border-2 border-amber-200 bg-amber-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Info className="w-5 h-5 text-amber-600" />
          Add Transition Pieces for {product.product_name || product.name}
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          Standard 8ft pieces that match your selected flooring.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(TRANSITION_PRICES).map(([type, price]) => (
          <div key={type} className="flex items-center gap-4 bg-white rounded-lg p-3 border border-slate-100">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-800 text-sm">{TRANSITION_LABELS[type]}</div>
              <div className="text-xs text-slate-500">C${price}/piece (8ft)</div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                value={quantities[type] || ''}
                onChange={(e) => handleQuantityChange(type, e.target.value)}
                placeholder="Qty"
                className="w-16 text-center h-8 text-sm"
              />
              <Button
                onClick={() => handleAddTransition(type)}
                disabled={quantities[type] <= 0}
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 h-8 w-8 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
