'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/lib/routes';
import { stairsImages, flooringImages, commercialImages } from '@/data/galleryImages';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getStaticBreadcrumbs } from '@/lib/breadcrumbs';

export default function GalleryClient() {
  const [activeTab, setActiveTab] = useState('stairs');
  const [selectedImage, setSelectedImage] = useState(null);

  const tabs = [
    { id: 'stairs', label: 'Staircase Projects', count: stairsImages.length },
    { id: 'flooring', label: 'Flooring Installations', count: flooringImages.length },
    { id: 'commercial', label: 'Commercial Projects', count: commercialImages.length },
  ];

  const images = { stairs: stairsImages, flooring: flooringImages, commercial: commercialImages }[activeTab];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Breadcrumbs items={getStaticBreadcrumbs('/gallery')} />
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">Our Project Gallery</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Browse our recent flooring and staircase projects across Markham, Toronto, and Durham Region.
        </p>
      </div>

      <div className="flex justify-center gap-4 mb-10 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="group cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
            onClick={() => setSelectedImage(img)}
          >
            <img
              src={img.url}
              alt={img.alt_text || img.alt || 'BBS Flooring project'}
              className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white text-3xl hover:text-amber-400"
            >
              ✕
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.alt_text || selectedImage.alt || 'BBS Flooring project'}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Ready to Start Your Project?</h2>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href={createPageUrl('FreeMeasurement')}>
            <button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              Book Free Measurement
            </button>
          </Link>
          <Link href={createPageUrl('Contact')}>
            <button className="bg-white hover:bg-slate-50 text-slate-800 font-semibold px-6 py-3 rounded-xl border border-slate-200 transition-colors">
              Contact Us
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
