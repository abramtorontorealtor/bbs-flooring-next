'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/lib/routes';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X, CheckCircle, XCircle, Minus } from 'lucide-react';

export default function ProductComparison({ products, onRemove }) {
  const [open, setOpen] = useState(false);

  if (products.length === 0) return null;

  const comparisonAttributes = [
    { key: 'price_per_sqft', label: 'Price per Sq.Ft', format: (val, p) => {
      const price = p.sale_price_per_sqft || p.price_per_sqft;
      return price ? `C$${price.toFixed(2)}` : 'Call for price';
    }},
    { key: 'brand', label: 'Brand', format: (val) => val || '-' },
    { key: 'species', label: 'Species', format: (val) => val || '-' },
    { key: 'colour', label: 'Colour', format: (val) => val || '-' },
    { key: 'dimensions', label: 'Dimensions', format: (val) => val || '-' },
    { key: 'thickness', label: 'Thickness', format: (val) => val || '-' },
    { key: 'wear_layer', label: 'Wear Layer', format: (val) => val || '-' },
    { key: 'finish', label: 'Finish', format: (val) => val || '-' },
    { key: 'grade', label: 'Grade', format: (val) => val || '-' },
    { key: 'sqft_per_box', label: 'Sq.Ft per Box', format: (val) => val ? val.toFixed(2) : '-' },
    { key: 'is_waterproof', label: 'Waterproof', format: (val) => {
      if (val === true) return <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto" />;
      if (val === false) return <XCircle className="w-5 h-5 text-red-500 mx-auto" />;
      return <Minus className="w-5 h-5 text-slate-300 mx-auto" />;
    }},
    { key: 'warranty', label: 'Warranty', format: (val) => val || '-' },
    { key: 'made_in', label: 'Made In', format: (val) => val || '-' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 z-40 bg-amber-600 hover:bg-amber-700 shadow-2xl"
          size="lg"
        >
          Compare ({products.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Compare Products</DialogTitle>
        </DialogHeader>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 bg-white z-10 p-4 text-left font-semibold text-slate-700 border-b-2 border-slate-200 min-w-[180px]">
                  Specification
                </th>
                {products.map((product) => (
                  <th key={product.id} className="p-4 text-center border-b-2 border-slate-200 min-w-[220px]">
                    <div className="relative">
                      <button
                        onClick={() => onRemove(product.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <img
                        src={product.image_url || '/images/product-placeholder.svg'}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                      <Link
                        href={createPageUrl(`ProductDetail?slug=${product.slug || product.id}`)}
                        className="font-semibold text-slate-800 hover:text-amber-600 transition-colors text-sm line-clamp-2"
                        onClick={() => setOpen(false)}
                      >
                        {product.name}
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonAttributes.map((attr, idx) => (
                <tr key={attr.key} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                  <td className="sticky left-0 bg-inherit z-10 p-4 font-medium text-slate-700 border-b border-slate-200">
                    {attr.label}
                  </td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4 text-center border-b border-slate-200 text-slate-600">
                      {attr.format(product[attr.key], product)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="sticky left-0 bg-white z-10 p-4"></td>
                {products.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    <Link href={createPageUrl(`ProductDetail?slug=${product.slug || product.id}`)}>
                      <Button
                        className="w-full bg-amber-600 hover:bg-amber-700"
                        onClick={() => setOpen(false)}
                      >
                        View Details
                      </Button>
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
