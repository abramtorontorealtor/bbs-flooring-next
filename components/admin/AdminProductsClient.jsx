'use client';
import React, { useState } from 'react';
import { entities } from '@/lib/base44-compat';
import { useAuth } from '@/lib/auth-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil, Trash2, Plus, Search, Loader2, Sparkles, CheckCircle2, Download } from 'lucide-react';
import { toast } from 'sonner';
import ProductEditDialog from '@/components/admin/ProductEditDialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminProductsClient() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [autoFillProgress, setAutoFillProgress] = useState(0);
  const [autoFillStatus, setAutoFillStatus] = useState('');
  const [settingInStock, setSettingInStock] = useState(false);
  const [downloadingUrls, setDownloadingUrls] = useState(false);
  const queryClient = useQueryClient();

  const isAdmin = !isLoadingAuth && isAuthenticated && user?.role === 'admin';

  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => entities.Product.list('-created_date', 1000),
    enabled: isAdmin,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (productId) => entities.Product.delete(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete product: ' + error.message);
    },
  });

  // Loading / auth guard
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

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      deleteMutation.mutate(product.id);
    }
  };

  const handleSetAllInStock = async () => {
    setSettingInStock(true);
    try {
      
      const response = await fetch('/api/admin/set-all-in-stock', { method: 'POST' });
      const data = await response.json();
      const { updated, total } = data;
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products-v2'] });
      toast.success(`Set ${updated} products in stock out of ${total} total!`);
    } catch (error) {
      toast.error('Update failed: ' + error.message);
    } finally {
      setSettingInStock(false);
    }
  };

  const handleDownloadUrls = async () => {
    setDownloadingUrls(true);
    try {
      
      const response = await fetch('/api/admin/get-all-product-urls');
      const data = await response.json();
      const { products: urlProducts } = data;

      const csvHeader = 'Brand,Colour,Slug,URL,Price,Sale Price\n';
      const csvRows = urlProducts
        .map(
          (p) =>
            `"${p.brand}","${p.colour}","${p.slug}","${p.url}","${p.price_per_sqft || ''}","${p.sale_price_per_sqft || ''}"`
        )
        .join('\n');
      const csvContent = csvHeader + csvRows;

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'product-urls.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast.success(`Downloaded ${urlProducts.length} product URLs!`);
    } catch (error) {
      toast.error('Download failed: ' + error.message);
    } finally {
      setDownloadingUrls(false);
    }
  };

  const handleAutoFillDetails = async () => {
    if (
      !window.confirm(
        'This will use AI to auto-fill missing product details (dimensions, finish, grade) from specifications. Continue?'
      )
    ) {
      return;
    }

    setIsAutoFilling(true);
    setAutoFillProgress(0);
    setAutoFillStatus('Starting auto-fill process...');

    try {
      
      const response = await fetch('/api/admin/fill-product-details', { method: 'POST' });
      const data = await response.json();

      setAutoFillProgress(100);
      setAutoFillStatus('Completed!');

      setTimeout(() => {
        setIsAutoFilling(false);
        setAutoFillProgress(0);
        setAutoFillStatus('');
      }, 3000);

      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products-v2'] });

      toast.success(`Auto-fill complete! Updated ${data.updated} products`, {
        description: data.failed > 0 ? `${data.failed} products failed` : undefined,
      });
    } catch (error) {
      setAutoFillStatus('Failed');
      toast.error('Auto-fill failed: ' + error.message);
      setTimeout(() => {
        setIsAutoFilling(false);
        setAutoFillProgress(0);
        setAutoFillStatus('');
      }, 2000);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Product Management</h1>
        <p className="text-slate-600">Manage your product catalog</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search products by name, SKU, or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={handleSetAllInStock}
            variant="outline"
            disabled={settingInStock}
            className="border-green-200 hover:bg-green-50 hover:text-green-700"
          >
            {settingInStock ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            Set All In Stock
          </Button>
          <Button
            onClick={handleAutoFillDetails}
            variant="outline"
            disabled={isAutoFilling}
            className="border-purple-200 hover:bg-purple-50 hover:text-purple-700"
          >
            {isAutoFilling ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            AI Auto-Fill Details
          </Button>
          <Button
            onClick={handleDownloadUrls}
            variant="outline"
            disabled={downloadingUrls}
            className="border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            {downloadingUrls ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download URLs
          </Button>
          <Button onClick={handleAdd} className="bg-amber-600 hover:bg-amber-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Auto-Fill Progress */}
        {isAutoFilling && (
          <Alert className="mb-6 border-purple-200 bg-purple-50">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-purple-900">{autoFillStatus}</span>
                  <span className="text-purple-700">{autoFillProgress}%</span>
                </div>
                <Progress value={autoFillProgress} className="h-2" />
                <p className="text-xs text-purple-600">
                  AI is analyzing product specifications and extracting dimensions, finish, and grade
                  details...
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Products Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img
                          src={
                            product.image_url ||
                            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop'
                          }
                          alt={product.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium max-w-xs truncate">{product.name}</TableCell>
                      <TableCell className="text-slate-600">{product.sku || '-'}</TableCell>
                      <TableCell className="text-slate-600">{product.brand || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {product.category?.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        C${product.price_per_sqft?.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.in_stock ? 'default' : 'destructive'}>
                          {product.in_stock ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(product)}
                            className="hover:bg-slate-100"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(product)}
                            className="hover:bg-red-100 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="mt-4 text-sm text-slate-600">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      <ProductEditDialog
        product={editingProduct}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
