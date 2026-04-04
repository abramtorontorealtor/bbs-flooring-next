'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/lib/base44-compat';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, Camera, Loader2, Sparkles, ArrowRight, Download, MessageSquare, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getStaticBreadcrumbs } from '@/lib/breadcrumbs';

// =========================================================================
// CONSTANTS
// =========================================================================

const SAMPLE_ROOMS = [
  {
    id: 'living-room',
    name: 'Living Room',
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    thumb: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&q=60',
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    url: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&q=80',
    thumb: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=200&q=60',
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    thumb: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&q=60',
  },
  {
    id: 'hallway',
    name: 'Hallway',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    thumb: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=60',
  },
];

// =========================================================================
// WEB WORKER (inline — runs SegFormer via Transformers.js in background)
// =========================================================================

const WORKER_CODE = `
let pipeline = null;
let segmenter = null;

self.onmessage = async (event) => {
  const { type } = event.data;
  
  try {
    if (type === 'init') {
      self.postMessage({ type: 'status', status: 'Loading AI model...', progress: 0 });
      
      const mod = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3');
      pipeline = mod.pipeline;
      mod.env.allowLocalModels = false;
      mod.env.useBrowserCache = true;
      
      segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
        dtype: 'q8',
        progress_callback: (p) => {
          if (p.status === 'progress' && p.progress) {
            self.postMessage({ type: 'status', status: 'Loading AI model... ' + Math.round(p.progress) + '%', progress: p.progress });
          }
        }
      });
      
      self.postMessage({ type: 'ready' });
      
    } else if (type === 'segment') {
      if (!segmenter) {
        self.postMessage({ type: 'error', message: 'Model not loaded yet' });
        return;
      }
      
      self.postMessage({ type: 'status', status: 'Analyzing your room...', progress: -1 });
      
      const results = await segmenter(event.data.imageUrl);
      
      let floorResult = null;
      for (const r of results) {
        const label = (r.label || '').toLowerCase();
        if (label.includes('floor') || label.includes('flooring')) {
          floorResult = r;
          break;
        }
      }
      if (!floorResult) {
        for (const r of results) {
          const label = (r.label || '').toLowerCase();
          if (label.includes('carpet') || label.includes('rug') || label.includes('tile')) {
            floorResult = r;
            break;
          }
        }
      }
      
      if (floorResult && floorResult.mask) {
        const mask = floorResult.mask;
        const w = mask.width;
        const h = mask.height;
        const data = new Uint8Array(w * h);
        for (let i = 0; i < mask.data.length; i++) {
          data[i] = mask.data[i] > 0 ? 255 : 0;
        }
        self.postMessage({ type: 'mask', mask: data.buffer, width: w, height: h, label: floorResult.label }, [data.buffer]);
      } else {
        self.postMessage({ type: 'no_floor', labels: results.map(r => r.label) });
      }
    }
  } catch (err) {
    self.postMessage({ type: 'error', message: err.message || 'Unknown error' });
  }
};
`;

// =========================================================================
// COMPOSITOR (runs in main thread on Canvas)
// =========================================================================

function compositeFloor(canvas, roomImg, mask, maskW, maskH, texImg, opts = {}) {
  const { tileScale = 0.12, blendStrength = 0.88, shadowPreservation = 0.4 } = opts;
  const w = roomImg.naturalWidth || roomImg.width;
  const h = roomImg.naturalHeight || roomImg.height;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  ctx.drawImage(roomImg, 0, 0, w, h);
  const roomPx = ctx.getImageData(0, 0, w, h);

  const scaled = new Uint8Array(w * h);
  const xR = maskW / w, yR = maskH / h;
  for (let y = 0; y < h; y++) {
    const sy = Math.floor(y * yR);
    for (let x = 0; x < w; x++) {
      scaled[y * w + x] = mask[sy * maskW + Math.floor(x * xR)];
    }
  }

  const cleanMask = morphClose(scaled, w, h, 2);
  const softMask = boxBlur(cleanMask, w, h, 4);

  let topRow = h, bottomRow = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (cleanMask[y * w + x] > 127) {
        topRow = Math.min(topRow, y);
        bottomRow = Math.max(bottomRow, y);
      }
    }
  }

  const texCanvas = document.createElement('canvas');
  texCanvas.width = w;
  texCanvas.height = h;
  const texCtx = texCanvas.getContext('2d');
  const baseTileW = Math.round(w * tileScale);
  const baseTileH = Math.round(baseTileW * (texImg.naturalHeight / texImg.naturalWidth));
  const floorH = bottomRow - topRow;

  if (floorH > 10) {
    let y = bottomRow;
    let row = 0;
    while (y > topRow - baseTileH) {
      const progress = Math.max(0, (bottomRow - y) / floorH);
      const scale = 1.0 - progress * 0.45;
      const tH = Math.max(4, Math.round(baseTileH * scale));
      const tW = Math.max(4, Math.round(baseTileW * scale));
      const rowY = y - tH;
      for (let x = 0; x < w; x += tW) {
        const col = Math.floor(x / tW);
        texCtx.save();
        if (col % 2 === 1) { texCtx.translate(x + tW, rowY); texCtx.scale(-1, 1); }
        else if (row % 2 === 1) { texCtx.translate(x, rowY + tH); texCtx.scale(1, -1); }
        else { texCtx.translate(x, rowY); }
        texCtx.drawImage(texImg, 0, 0, tW, tH);
        texCtx.restore();
      }
      y -= tH;
      row++;
    }
  } else {
    for (let y = 0; y < h; y += baseTileH) {
      for (let x = 0; x < w; x += baseTileW) {
        texCtx.drawImage(texImg, x, y, baseTileW, baseTileH);
      }
    }
  }

  const texPx = texCtx.getImageData(0, 0, w, h);

  let rSum = 0, tSum = 0, rSqSum = 0, cnt = 0;
  for (let i = 0; i < w * h; i++) {
    if (cleanMask[i] > 127) {
      const idx = i * 4;
      const rL = 0.299 * roomPx.data[idx] + 0.587 * roomPx.data[idx+1] + 0.114 * roomPx.data[idx+2];
      const tL = 0.299 * texPx.data[idx] + 0.587 * texPx.data[idx+1] + 0.114 * texPx.data[idx+2];
      rSum += rL; tSum += tL; rSqSum += rL * rL; cnt++;
    }
  }
  if (cnt > 0) {
    const rMean = rSum / cnt;
    const tMean = tSum / cnt || 1;
    const rStd = Math.sqrt(rSqSum / cnt - rMean * rMean) || 1;
    for (let i = 0; i < w * h; i++) {
      if (cleanMask[i] > 127) {
        const idx = i * 4;
        const rL = 0.299 * roomPx.data[idx] + 0.587 * roomPx.data[idx+1] + 0.114 * roomPx.data[idx+2];
        const dev = (rL - rMean) / rStd;
        for (let c = 0; c < 3; c++) {
          let v = texPx.data[idx + c] * (rMean / tMean);
          v += dev * rStd * shadowPreservation;
          texPx.data[idx + c] = Math.max(0, Math.min(255, Math.round(v)));
        }
      }
    }
  }

  const out = ctx.getImageData(0, 0, w, h);
  for (let i = 0; i < w * h; i++) {
    const a = (softMask[i] / 255) * blendStrength;
    if (a > 0.01) {
      const idx = i * 4;
      out.data[idx]     = Math.round(roomPx.data[idx]     * (1-a) + texPx.data[idx]     * a);
      out.data[idx + 1] = Math.round(roomPx.data[idx + 1] * (1-a) + texPx.data[idx + 1] * a);
      out.data[idx + 2] = Math.round(roomPx.data[idx + 2] * (1-a) + texPx.data[idx + 2] * a);
    }
  }
  ctx.putImageData(out, 0, 0);
}

function morphClose(mask, w, h, r) {
  const dilated = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let found = false;
    outer: for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const ny = Math.max(0, Math.min(h-1, y+dy)), nx = Math.max(0, Math.min(w-1, x+dx));
      if (mask[ny*w+nx] > 127) { found = true; break outer; }
    }
    dilated[y*w+x] = found ? 255 : 0;
  }
  const closed = new Uint8Array(w * h);
  const kernelArea = (2*r+1)*(2*r+1);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let cnt = 0;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const ny = Math.max(0, Math.min(h-1, y+dy)), nx = Math.max(0, Math.min(w-1, x+dx));
      if (dilated[ny*w+nx] > 127) cnt++;
    }
    closed[y*w+x] = cnt >= kernelArea ? 255 : 0;
  }
  return closed;
}

function boxBlur(mask, w, h, r) {
  const temp = new Float32Array(w * h);
  const result = new Uint8Array(w * h);
  const k = 2 * r + 1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let s = 0;
    for (let dx = -r; dx <= r; dx++) s += mask[y*w + Math.max(0, Math.min(w-1, x+dx))];
    temp[y*w+x] = s / k;
  }
  for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) {
    let s = 0;
    for (let dy = -r; dy <= r; dy++) s += temp[Math.max(0, Math.min(h-1, y+dy))*w + x];
    result[y*w+x] = Math.round(s / k);
  }
  return result;
}

// =========================================================================
// BEFORE/AFTER SLIDER COMPONENT
// =========================================================================

function BeforeAfterSlider({ beforeSrc, afterCanvas, width, height }) {
  const canvasRef = useRef(null);
  const [dividerPos, setDividerPos] = useState(0.5);
  const isDragging = useRef(false);

  const draw = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs || !afterCanvas) return;
    const ctx = cvs.getContext('2d');
    const w = cvs.width;
    const h = cvs.height;
    const dx = Math.round(dividerPos * w);

    ctx.drawImage(afterCanvas, 0, 0, w, h);

    const beforeImg = new Image();
    beforeImg.src = beforeSrc;
    if (beforeImg.complete) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, dx, h);
      ctx.clip();
      ctx.drawImage(beforeImg, 0, 0, w, h);
      ctx.restore();
    }

    ctx.save();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(dx, 0);
    ctx.lineTo(dx, h);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(dx, h/2, 18, 0, Math.PI*2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⟨ ⟩', dx, h/2);

    ctx.font = 'bold 12px system-ui';
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 4;
    if (dx > 80) { ctx.textAlign = 'left'; ctx.fillText('ORIGINAL', 10, h - 14); }
    if (dx < w - 80) { ctx.textAlign = 'right'; ctx.fillText('NEW FLOOR', w - 10, h - 14); }
    ctx.restore();
  }, [dividerPos, beforeSrc, afterCanvas]);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    cvs.width = width || 800;
    cvs.height = height || 600;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => draw();
    img.src = beforeSrc;
  }, [width, height, beforeSrc, draw]);

  useEffect(() => { draw(); }, [draw]);

  const handleMove = useCallback((clientX) => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const rect = cvs.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    setDividerPos(Math.max(0.02, Math.min(0.98, x)));
  }, []);

  const onPointerDown = (e) => { isDragging.current = true; handleMove(e.clientX); };
  const onPointerMove = (e) => { if (isDragging.current) handleMove(e.clientX); };
  const onPointerUp = () => { isDragging.current = false; };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      className="w-full rounded-xl cursor-ew-resize touch-none"
      style={{ aspectRatio: `${width || 800} / ${height || 600}` }}
    />
  );
}

// =========================================================================
// PRODUCT SWATCH GRID
// =========================================================================

function ProductSwatchGrid({ products, selectedId, onSelect }) {
  const categories = {};
  products.forEach(p => {
    const cat = p.category || 'Other';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(p);
  });

  return (
    <div className="space-y-4">
      {Object.entries(categories).map(([cat, items]) => (
        <div key={cat}>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{cat}</h3>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
            {items.slice(0, 12).map(product => (
              <button
                key={product.id}
                onClick={() => onSelect(product)}
                className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  selectedId === product.id
                    ? 'border-amber-500 ring-2 ring-amber-200 scale-105'
                    : 'border-slate-200 hover:border-amber-300'
                }`}
              >
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1">
                  <span className="text-white text-[10px] leading-tight font-medium truncate">{product.name}</span>
                </div>
                {selectedId === product.id && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// =========================================================================
// MAIN COMPONENT
// =========================================================================

export default function RoomVisualizerClient() {
  const [roomImageUrl, setRoomImageUrl] = useState(null);
  const [roomImageObj, setRoomImageObj] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [modelStatus, setModelStatus] = useState('idle');
  const [modelProgress, setModelProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [resultCanvas, setResultCanvas] = useState(null);
  const [resultDimensions, setResultDimensions] = useState({ w: 800, h: 600 });

  const workerRef = useRef(null);
  const maskRef = useRef(null);

  const { data: products = [] } = useQuery({
    queryKey: ['products-visualizer'],
    queryFn: async () => {
      const res = await fetch('/api/products/grid?limit=100');
      if (!res.ok) return [];
      const data = await res.json();
      return data.filter(p => p.in_stock !== false);
    },
  });

  useEffect(() => {
    const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url, { type: 'module' });
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const { type } = e.data;
      if (type === 'status') {
        setStatusText(e.data.status);
        if (e.data.progress >= 0) setModelProgress(e.data.progress);
      } else if (type === 'ready') {
        setModelStatus('ready');
        setStatusText('AI model ready');
      } else if (type === 'mask') {
        const mask = new Uint8Array(e.data.mask);
        maskRef.current = { data: mask, width: e.data.width, height: e.data.height };
        doComposite(mask, e.data.width, e.data.height);
      } else if (type === 'no_floor') {
        setIsGenerating(false);
        toast.error('No floor detected. Try a photo with more visible floor area.', { duration: 5000 });
      } else if (type === 'error') {
        setIsGenerating(false);
        setModelStatus('error');
        toast.error('AI Error: ' + e.data.message);
      }
    };

    setModelStatus('loading');
    worker.postMessage({ type: 'init' });

    return () => {
      worker.terminate();
      URL.revokeObjectURL(url);
    };
  }, []);

  const doComposite = useCallback((mask, maskW, maskH) => {
    if (!roomImageObj || !selectedProduct?.image_url) {
      setIsGenerating(false);
      return;
    }

    setStatusText('Applying flooring...');

    const texImg = new Image();
    texImg.crossOrigin = 'anonymous';
    texImg.onload = () => {
      const canvas = document.createElement('canvas');
      compositeFloor(canvas, roomImageObj, mask, maskW, maskH, texImg);

      setResultCanvas(canvas);
      setResultDimensions({ w: canvas.width, h: canvas.height });
      setIsGenerating(false);
      setStatusText('');
    };
    texImg.onerror = () => {
      setIsGenerating(false);
      toast.error('Failed to load product texture');
    };
    texImg.src = selectedProduct.image_url;
  }, [roomImageObj, selectedProduct]);

  useEffect(() => {
    if (maskRef.current && selectedProduct && roomImageObj) {
      setIsGenerating(true);
      setStatusText('Applying new flooring...');
      requestAnimationFrame(() => {
        doComposite(maskRef.current.data, maskRef.current.width, maskRef.current.height);
      });
    }
  }, [selectedProduct, doComposite]);

  // Handle room image upload — uses local blob URL + FileReader data URL for worker
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsUploading(true);
    setResultCanvas(null);
    maskRef.current = null;

    try {
      const localUrl = URL.createObjectURL(file);
      setRoomImageUrl(localUrl);

      // Read file as data URL for the worker (needs a fetchable URL)
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        const img = new Image();
        img.onload = () => {
          setRoomImageObj(img);
          setIsUploading(false);
        };
        img.src = localUrl;
        // Store the data URL for the worker
        img.dataset.remoteUrl = dataUrl;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
      setIsUploading(false);
    }
  };

  const handleSampleRoom = (room) => {
    setResultCanvas(null);
    maskRef.current = null;
    setRoomImageUrl(room.url);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setRoomImageObj(img);
    img.src = room.url;
  };

  const handleGenerate = () => {
    if (!roomImageUrl) {
      toast.error('Please select or upload a room photo first');
      return;
    }
    if (!selectedProduct) {
      toast.error('Please select a flooring product');
      return;
    }
    if (modelStatus !== 'ready') {
      toast.error('AI model is still loading. Please wait a moment.');
      return;
    }

    setIsGenerating(true);
    setStatusText('Analyzing your room...');

    if (maskRef.current) {
      doComposite(maskRef.current.data, maskRef.current.width, maskRef.current.height);
      return;
    }

    const imageUrl = roomImageObj?.dataset?.remoteUrl || roomImageUrl;
    workerRef.current?.postMessage({ type: 'segment', imageUrl });
  };

  const handleDownload = () => {
    if (!resultCanvas) return;
    const link = document.createElement('a');
    link.download = `bbs-flooring-visualizer-${selectedProduct?.name?.replace(/\s+/g, '-') || 'result'}.jpg`;
    link.href = resultCanvas.toDataURL('image/jpeg', 0.92);
    link.click();
  };

  const canGenerate = roomImageUrl && selectedProduct && modelStatus === 'ready' && !isGenerating;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      {/* Hero Header */}
      <div className="bg-slate-900 text-white py-10 md:py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <Breadcrumbs items={getStaticBreadcrumbs('/room-visualizer')} />
          <h1 className="text-3xl md:text-5xl font-bold mb-3">
            Room Visualizer
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            See exactly how our flooring looks in your space — powered by AI.
            Upload your room photo and try any product instantly.
          </p>

          {modelStatus === 'loading' && (
            <div className="mt-4 flex items-center justify-center gap-2 text-amber-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{statusText || 'Preparing AI...'}</span>
            </div>
          )}
          {modelStatus === 'ready' && (
            <div className="mt-4 flex items-center justify-center gap-2 text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">AI Ready</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">

        {/* Result Section */}
        {resultCanvas && (
          <div className="mb-10">
            <Card className="border-2 border-emerald-200 overflow-hidden">
              <CardContent className="p-0">
                <BeforeAfterSlider
                  beforeSrc={roomImageUrl}
                  afterCanvas={resultCanvas}
                  width={resultDimensions.w}
                  height={resultDimensions.h}
                />

                <div className="p-4 md:p-6 bg-white border-t flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <img
                      src={selectedProduct?.image_url}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover border"
                    />
                    <div>
                      <h3 className="font-semibold text-slate-800">{selectedProduct?.name}</h3>
                      <p className="text-sm text-amber-600 font-medium">
                        ${selectedProduct?.price_per_sqft?.toFixed(2)}/sq.ft
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" size="sm" onClick={handleDownload} className="flex-1 md:flex-none">
                      <Download className="w-4 h-4 mr-1" /> Save
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 md:flex-none bg-amber-500 hover:bg-amber-600 text-white"
                      onClick={() => window.location.href = `/quote-calculator?product=${encodeURIComponent(selectedProduct?.name || '')}`}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" /> Get Free Quote
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-sm text-slate-500 mt-3">
              ↓ Select a different product below to instantly update the visualization
            </p>
          </div>
        )}

        {/* Main Controls */}
        <div className="grid lg:grid-cols-5 gap-6">

          {/* Left: Room Selection (2 cols) */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                  <h2 className="text-lg font-bold text-slate-800">Your Room</h2>
                </div>

                <label className="flex flex-col items-center justify-center gap-2 w-full p-5 border-2 border-dashed border-slate-300 rounded-xl hover:border-amber-500 hover:bg-amber-50/50 transition-all cursor-pointer mb-4">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <Upload className="w-5 h-5 text-amber-600" />
                        <Camera className="w-5 h-5 text-amber-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-600">Upload or take a photo</span>
                    </>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>

                <p className="text-xs text-slate-500 mb-2">Or try a sample room:</p>
                <div className="grid grid-cols-4 gap-2">
                  {SAMPLE_ROOMS.map(room => (
                    <button
                      key={room.id}
                      onClick={() => handleSampleRoom(room)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        roomImageUrl === room.url ? 'border-amber-500 ring-1 ring-amber-200' : 'border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      <img src={room.thumb} alt={room.name} className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>

                {roomImageUrl && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-slate-200">
                    <img src={roomImageUrl} alt="Selected room" className="w-full object-contain max-h-48" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Product Selection (3 cols) */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                  <h2 className="text-lg font-bold text-slate-800">Choose Flooring</h2>
                </div>

                <ProductSwatchGrid
                  products={products}
                  selectedId={selectedProduct?.id}
                  onSelect={setSelectedProduct}
                />

                {selectedProduct && (
                  <div className="mt-4 bg-amber-50 rounded-xl p-3 flex items-center gap-3">
                    <img src={selectedProduct.image_url} alt="" className="w-14 h-14 rounded-lg object-cover border" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 text-sm truncate">{selectedProduct.name}</h3>
                      <p className="text-xs text-slate-600">{selectedProduct.colour} · {selectedProduct.brand}</p>
                      <p className="text-sm font-bold text-amber-600">
                        ${selectedProduct.price_per_sqft?.toFixed(2)}/sq.ft
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  size="lg"
                  className="w-full mt-5 bg-amber-500 hover:bg-amber-600 text-white py-5 text-base font-semibold disabled:opacity-50"
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {statusText || 'Processing...'}
                    </span>
                  ) : modelStatus === 'loading' ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      AI Loading... {Math.round(modelProgress)}%
                    </span>
                  ) : resultCanvas ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5" />
                      Update Visualization
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      See It In Your Room
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
          {[
            { icon: '📸', title: 'Upload Your Room', desc: 'Take a photo or choose a sample room' },
            { icon: '🪵', title: 'Pick Your Floor', desc: 'Browse our full product catalog' },
            { icon: '✨', title: 'See The Result', desc: 'AI shows your exact product in your space' },
          ].map((step, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-slate-100">
              <div className="text-3xl mb-2">{step.icon}</div>
              <h3 className="font-bold text-slate-800 mb-1">{step.title}</h3>
              <p className="text-sm text-slate-600">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>🔒 Your photos are processed directly in your browser — never uploaded to external servers.</p>
          <p className="mt-1">No account needed. No cost. Try it as many times as you want.</p>
        </div>
      </div>
    </div>
  );
}
