'use client';

import React, { useState } from 'react';
import { stairsImages, flooringImages, commercialImages } from '@/data/galleryImages';

export default function GalleryInteractive() {
  const [activeTab, setActiveTab] = useState('stairs');
  const [selectedImage, setSelectedImage] = useState(null);

  const tabs = [
    { id: 'stairs', label: 'Staircase Projects', count: stairsImages.length },
    { id: 'flooring', label: 'Flooring Installations', count: flooringImages.length },
    { id: 'commercial', label: 'Commercial Projects', count: commercialImages.length },
  ];

  const images = { stairs: stairsImages, flooring: flooringImages, commercial: commercialImages }[activeTab];

  return (
    <>
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
    </>
  );
}
