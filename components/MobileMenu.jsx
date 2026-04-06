'use client';

import React from 'react';
import Link from 'next/link';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export default function MobileMenu({ open, onOpenChange, navItems }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80">
        <div className="flex flex-col gap-6 mt-8 overflow-y-auto max-h-[calc(100vh-120px)] pb-8">
          {/* Free Measurement — prominent CTA */}
          <Link
            href="/free-measurement"
            onClick={() => onOpenChange(false)}
            className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3.5 rounded-xl transition-colors text-base"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/></svg>
            Book Free Measurement
          </Link>

          {navItems.map((item) =>
            item.submenu ? (
              <div key={item.name} className="py-2 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-700 mb-2">{item.name}</p>
                <div className="flex flex-col gap-2 ml-4">
                  {item.submenu.map((sub) => (
                    <Link
                      key={sub.name}
                      href={sub.path}
                      onClick={() => onOpenChange(false)}
                      className="text-sm text-slate-600 hover:text-amber-500 transition-colors"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => onOpenChange(false)}
                className="text-lg font-medium text-slate-700 hover:text-amber-500 transition-colors py-2 border-b border-slate-100"
              >
                {item.name}
              </Link>
            )
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
