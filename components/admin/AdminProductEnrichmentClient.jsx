'use client';
import React, { useState } from 'react';
import { entities } from '@/lib/base44-compat';
import { useAuth } from '@/lib/auth-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Wand2, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProductEnrichmentClient() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichedData, setEnrichedData] = useState(null);
  const [editedDetails, setEditedDetails] = useState('');
  const [editedDescription, setEditedDescription] = useState('');

  const queryClient = useQueryClient();

  const isAdmin = !isLoadingAuth && isAuthenticated && user?.role === 'admin';

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => entities.Product.list('-created_date', 500),
    enabled: isAdmin,
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ productId, data }) => entities.Product.update(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Product updated successfully!');
      setEnrichedData(null);
      setSelectedProductId('');
      setManualUrl('');
      setEditedDetails('');
      setEditedDescription('');
    },
    onError: (error) => {
      toast.error('Failed to update product: ' + error.message);
    },
  });

  // Auth guard
  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
          <p className="text-slate-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const handleAutoEnrich = async () => {
    if (!selectedProductId) {
      toast.error('Please select a product');
      return;
    }

    setIsEnriching(true);
    setEnrichedData(null);

    try {
      // TODO: replace base44.functions.invoke('scrapeProductData', {...}) with:
      const response = await fetch('/api/admin/scrape-product-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductId,
          manualUrl: manualUrl || undefined,
        }),
      });
      const data = await response.json();

      if (data.success) {
        setEnrichedData(data);
        setEditedDetails(data.data.product_details || '');
        setEditedDescription(data.data.product_description || '');
        toast.success('Product data enriched successfully!');
      } else if (data.requiresManualUrl) {
        toast.error('Auto-search failed. Please provide a manual URL.');
      } else {
        toast.error(data.error || 'Failed to enrich product');
      }
    } catch (error) {
      console.error('Enrichment error:', error);
      toast.error('Error: ' + error.message);
    } finally {
      setIsEnriching(false);
    }
  };

  const handleSave = () => {
    if (!enrichedData) return;

    updateProductMutation.mutate({
      productId: enrichedData.productId,
      data: {
        product_details: editedDetails,
        product_description: editedDescription,
      },
    });
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Product Enrichment Portal</h1>
        <p className="text-slate-600">Auto-generate product details and descriptions using AI</p>
      </div>

      {/* Product Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Product</CardTitle>
          <CardDescription>Choose a product to enrich with AI-generated content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Product</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a product..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.brand} - {product.name} ({product.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProduct && (
            <div className="p-4 bg-slate-50 rounded-lg space-y-2">
              <p className="text-sm">
                <strong>Brand:</strong> {selectedProduct.brand}
              </p>
              <p className="text-sm">
                <strong>Name:</strong> {selectedProduct.name}
              </p>
              <p className="text-sm">
                <strong>SKU:</strong> {selectedProduct.sku}
              </p>
              <p className="text-sm">
                <strong>Category:</strong> {selectedProduct.category}
              </p>
            </div>
          )}

          <div>
            <Label>Manual Product URL (Optional)</Label>
            <Input
              type="url"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="https://example.com/product-page (leave empty for auto-search)"
            />
            <p className="text-xs text-slate-500 mt-1">
              Leave empty to use auto-search. Provide a URL if auto-search fails.
            </p>
          </div>

          <Button
            onClick={handleAutoEnrich}
            disabled={!selectedProductId || isEnriching}
            className="w-full bg-amber-600 hover:bg-amber-700"
            size="lg"
          >
            {isEnriching ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Enriching with AI...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 mr-2" />
                Auto-Enrich Product
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Enriched Data Preview */}
      {enrichedData && (
        <div className="space-y-6">
          <Card className="border-emerald-200 bg-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <CheckCircle2 className="w-5 h-5" />
                Enrichment Successful
              </CardTitle>
              <CardDescription className="text-emerald-700">
                Product: {enrichedData.productName} | Source: {enrichedData.url}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>Review and edit the structured specifications</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={editedDetails}
                onChange={(e) => setEditedDetails(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Description</CardTitle>
              <CardDescription>Review and edit the SEO-optimized marketing copy</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                rows={12}
                className="text-sm"
              />
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <p className="text-xs font-semibold text-slate-700 mb-2">Preview (HTML Rendered):</p>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: editedDescription.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              disabled={updateProductMutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {updateProductMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save to Product
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                setEnrichedData(null);
                setEditedDetails('');
                setEditedDescription('');
              }}
              variant="outline"
              size="lg"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
