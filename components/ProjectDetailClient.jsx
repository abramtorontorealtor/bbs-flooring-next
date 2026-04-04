'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/lib/base44-compat';
import Link from 'next/link';
import Image from 'next/image';
import { createPageUrl } from '@/lib/routes';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getGalleryProjectBreadcrumbs } from '@/lib/breadcrumbs';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Ruler, ArrowRight } from 'lucide-react';


export default function ProjectDetailClient({ slug }) {
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => entities.Project.list(),
  });

  const project = projects.find(p => p.slug === slug);

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product', project?.product_id],
    queryFn: () => project?.product_id ? entities.Product.filter({ id: project.product_id }).then(p => p[0]) : null,
    enabled: !!project?.product_id,
  });

  if (projectsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-slate-200 rounded w-2/3" />
          <div className="h-96 bg-slate-200 rounded-2xl" />
          <div className="h-32 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Project Not Found</h1>
        <p className="text-slate-600 mb-8">The project you're looking for doesn't exist.</p>
        <Link href={createPageUrl('Gallery')}>
          <Button>View All Projects</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Breadcrumbs items={getGalleryProjectBreadcrumbs(project.title)} />
      {/* Project Header */}
      <div className="mb-12">
        <Link 
          href={createPageUrl(`Location?city=${encodeURIComponent(project.location)}`)}
          className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 px-4 py-2 rounded-full mb-6 hover:bg-amber-100 transition-colors"
        >
          <MapPin className="w-4 h-4" />
          <span className="text-sm font-medium">{project.location}</span>
        </Link>

        <h1 className="text-5xl font-bold text-slate-800 mb-6">
          {project.title}
        </h1>

        <div className="flex flex-wrap gap-4 text-slate-600">
          {project.completion_date && (
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              <span>{new Date(project.completion_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
          )}
          {project.square_footage && (
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-amber-500" />
              <span>{project.square_footage.toLocaleString()} sq.ft installed</span>
            </div>
          )}
        </div>
      </div>

      {/* Featured Image */}
      {project.featured_image && (
        <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl relative h-[500px]">
          <Image 
            src={project.featured_image.split('?')[0]}
            alt={project.title}
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            priority
            quality={80}
          />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* The Story */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">The Story</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {project.story}
              </p>
            </div>
          </div>

          {/* Gallery Grid */}
          {project.gallery_images && project.gallery_images.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Project Gallery</h2>
              <div className="grid grid-cols-2 gap-4">
                {project.gallery_images.map((img, idx) => (
                  <div 
                    key={idx}
                    className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow relative h-64"
                  >
                    <Image 
                      src={(img.url || '').split('?')[0]}
                      alt={img.alt || `${project.title} - Photo ${idx + 1}`}
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      loading="lazy"
                      quality={75}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Shop the Look */}
          {product && !productLoading && (
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl border border-amber-200 shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Shop the Look</h3>
              <Link href={createPageUrl(`ProductDetail?slug=${product.slug || product.id}`)}>
                <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all group">
                  <div className="aspect-square overflow-hidden bg-slate-50 relative">
                    <Image 
                      src={(product.image_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop').split('?')[0]}
                      alt={product.name}
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      loading="lazy"
                      quality={75}
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-amber-600 uppercase tracking-wider mb-1">
                      {product.brand || product.category?.replace('_', ' ')}
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-3 line-clamp-2">
                      {product.name}
                    </h4>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-xl font-bold text-slate-900">
                        C${(product.sale_price_per_sqft || product.price_per_sqft).toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-500">/sq.ft</span>
                    </div>
                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                      View Product
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Get a Quote CTA */}
          <div className="bg-slate-900 text-white rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-3">Love This Look?</h3>
            <p className="text-slate-300 text-sm mb-6">
              Get a free quote for your {project.location} home with the same quality and craftsmanship.
            </p>
            <Link href={createPageUrl(`QuoteCalculator?city=${encodeURIComponent(project.location)}`)}>
              <Button className="w-full bg-amber-500 hover:bg-amber-600">
                Get Your Free Quote
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
