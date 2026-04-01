'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/lib/base44-compat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertCircle, Zap, Camera, Link2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export default function AdminSEOClient() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [altTextProgress, setAltTextProgress] = useState(0);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-seo-products'],
    queryFn: () => entities.Product.list('-created_date', 800),
  });

  const missingAltTexts = products.filter((p) => !p.image_alt_text);
  const productsWithSchema = products.filter((p) => p.sku && p.price_per_sqft);

  const seoScore = {
    altTextCompletion: products.length
      ? (((products.length - missingAltTexts.length) / products.length) * 100).toFixed(0)
      : 0,
    schemaMarkup: products.length
      ? ((productsWithSchema.length / products.length) * 100).toFixed(0)
      : 0,
    overall: 0,
  };
  seoScore.overall = (
    (parseInt(seoScore.altTextCompletion) + parseInt(seoScore.schemaMarkup)) /
    2
  ).toFixed(0);

  const handleOptimizeAltText = async () => {
    if (missingAltTexts.length === 0) {
      toast.info('All products already have alt text!');
      return;
    }
    setIsOptimizing(true);
    setAltTextProgress(0);

    const progressInterval = setInterval(() => {
      setAltTextProgress((prev) => (prev >= 90 ? prev : prev + Math.random() * 10));
    }, 500);

    try {
      // Generate alt text from product data (name + brand + category)
      let updated = 0;
      for (const product of missingAltTexts) {
        const altText = [product.brand, product.name, product.category?.replace(/_/g, ' ')]
          .filter(Boolean)
          .join(' — ');
        if (altText) {
          await entities.Product.update(product.id, { image_alt_text: altText });
          updated++;
        }
      }
      clearInterval(progressInterval);
      setAltTextProgress(100);
      toast.success(`Updated ${updated} product alt texts`);
    } catch (error) {
      clearInterval(progressInterval);
      toast.error('Error optimizing alt text: ' + error.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">SEO Optimization Dashboard</h1>
        <p className="text-slate-600">Monitor and improve your site&apos;s SEO health</p>
      </div>

      {/* SEO Score */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Overall SEO Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-amber-600">{seoScore.overall}%</div>
            <p className="text-sm text-slate-600 mt-2">Based on critical factors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Image Alt Text</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-amber-600">
              {seoScore.altTextCompletion}%
            </div>
            <p className="text-sm text-slate-600 mt-2">
              {missingAltTexts.length} products missing alt text
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Schema Markup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-amber-600">{seoScore.schemaMarkup}%</div>
            <p className="text-sm text-slate-600 mt-2">{productsWithSchema.length} products ready</p>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Actions */}
      <Card className="mb-8 border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            Optimization Tools
          </CardTitle>
          <CardDescription>Auto-generate SEO-optimized content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-white rounded-lg border border-amber-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Camera className="w-5 h-5 text-slate-600" />
                <div>
                  <h3 className="font-semibold text-slate-800">Generate Alt Text</h3>
                  <p className="text-sm text-slate-600">
                    Generate SEO-optimized alt text for all product images
                  </p>
                </div>
              </div>
              <Button
                onClick={handleOptimizeAltText}
                disabled={isOptimizing || missingAltTexts.length === 0}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Optimize {missingAltTexts.length} Products
                  </>
                )}
              </Button>
            </div>
            {isOptimizing && (
              <div className="space-y-2">
                <Progress value={altTextProgress} className="h-2" />
                <p className="text-xs text-slate-600 text-center">
                  {Math.round(altTextProgress)}% complete
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SEO Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Implementation Checklist</CardTitle>
          <CardDescription>Full-Stack SEO Overhaul Status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { done: true, text: 'Global Site Identity: "BBS Flooring" branding implemented site-wide' },
            { done: true, text: 'Programmatic Meta Data: Local keyword integration on product & collection pages' },
            {
              done: parseInt(seoScore.altTextCompletion) > 80,
              text: `Image Alt Text: ${seoScore.altTextCompletion}% complete (${missingAltTexts.length} remaining)`,
            },
            { done: true, text: 'Structured Data: Product & LocalBusiness schema on all pages' },
            { done: true, text: 'Internal Linking: Related products section with strategic link equity distribution' },
            { done: true, text: 'FAQ & Breadcrumbs: Active FAQPage and BreadcrumbList schema' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              {item.done ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              )}
              <span className="text-slate-700">{item.text}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
