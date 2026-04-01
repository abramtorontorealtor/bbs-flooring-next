'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { entities } from '@/lib/base44-compat';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductEditDialog({ product, open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        name: '',
        sku: '',
        category: 'laminate',
        subcategory: '',
        brand: '',
        price_per_sqft: 0,
        sale_price_per_sqft: null,
        sqft_per_box: 0,
        species: '',
        colour: '',
        dimensions: '',
        thickness: '',
        wear_layer: '',
        finish: '',
        grade: '',
        is_waterproof: false,
        warranty: '',
        features: [],
        specifications: '',
        image_url: '',
        image_alt_text: '',
        is_new_arrival: false,
        is_on_sale: false,
        is_clearance: false,
        made_in: '',
        in_stock: true,
        seo_title: '',
        seo_description: '',
        slug: '',
        review_count: 0,
        review_rating: 0,
      });
    }
  }, [product]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (product) {
        return await entities.Product.update(product.id, data);
      } else {
        return await entities.Product.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(product ? 'Product updated successfully' : 'Product created successfully');
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error('Failed to save product: ' + error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {product ? 'Update product information' : 'Create a new product in your catalog'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="seo">SEO & Marketing</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku || ''}
                    onChange={(e) => handleChange('sku', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand || ''}
                    onChange={(e) => handleChange('brand', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category || 'laminate'}
                    onValueChange={(value) => handleChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid_hardwood">Solid Hardwood</SelectItem>
                      <SelectItem value="engineered_hardwood">Engineered Hardwood</SelectItem>
                      <SelectItem value="laminate">Laminate</SelectItem>
                      <SelectItem value="vinyl">Vinyl</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory || ''}
                    onChange={(e) => handleChange('subcategory', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price per Sqft (CAD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price_per_sqft || 0}
                    onChange={(e) => handleChange('price_per_sqft', parseFloat(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sale_price">Sale Price per Sqft (CAD)</Label>
                  <Input
                    id="sale_price"
                    type="number"
                    step="0.01"
                    value={formData.sale_price_per_sqft || ''}
                    onChange={(e) =>
                      handleChange(
                        'sale_price_per_sqft',
                        e.target.value ? parseFloat(e.target.value) : null
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="sqft_per_box">Sqft per Box *</Label>
                  <Input
                    id="sqft_per_box"
                    type="number"
                    step="0.01"
                    value={formData.sqft_per_box || 0}
                    onChange={(e) => handleChange('sqft_per_box', parseFloat(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url || ''}
                    onChange={(e) => handleChange('image_url', e.target.value)}
                  />
                </div>
                <div className="col-span-2 flex flex-wrap items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="in_stock"
                      checked={formData.in_stock || false}
                      onCheckedChange={(checked) => handleChange('in_stock', checked)}
                    />
                    <Label htmlFor="in_stock">In Stock</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_waterproof"
                      checked={formData.is_waterproof || false}
                      onCheckedChange={(checked) => handleChange('is_waterproof', checked)}
                    />
                    <Label htmlFor="is_waterproof">Waterproof</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_on_sale"
                      checked={formData.is_on_sale || false}
                      onCheckedChange={(checked) => handleChange('is_on_sale', checked)}
                    />
                    <Label htmlFor="is_on_sale">On Sale</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_canadian"
                      checked={formData.is_canadian || false}
                      onCheckedChange={(checked) => handleChange('is_canadian', checked)}
                    />
                    <Label htmlFor="is_canadian">🇨🇦 Canadian</Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Species</Label>
                  <Input
                    value={formData.species || ''}
                    onChange={(e) => handleChange('species', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Colour</Label>
                  <Input
                    value={formData.colour || ''}
                    onChange={(e) => handleChange('colour', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Dimensions</Label>
                  <Input
                    value={formData.dimensions || ''}
                    onChange={(e) => handleChange('dimensions', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Thickness</Label>
                  <Input
                    value={formData.thickness || ''}
                    onChange={(e) => handleChange('thickness', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Finish</Label>
                  <Input
                    value={formData.finish || ''}
                    onChange={(e) => handleChange('finish', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Grade</Label>
                  <Input
                    value={formData.grade || ''}
                    onChange={(e) => handleChange('grade', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Wear Layer</Label>
                  <Input
                    value={formData.wear_layer || ''}
                    onChange={(e) => handleChange('wear_layer', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Warranty</Label>
                  <Input
                    value={formData.warranty || ''}
                    onChange={(e) => handleChange('warranty', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Made In</Label>
                  <Input
                    value={formData.made_in || ''}
                    onChange={(e) => handleChange('made_in', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Specifications</Label>
                  <Textarea
                    value={formData.specifications || ''}
                    onChange={(e) => handleChange('specifications', e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>URL Slug</Label>
                  <Input
                    value={formData.slug || ''}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    placeholder="product-name-slug"
                  />
                </div>
                <div>
                  <Label>SEO Title</Label>
                  <Input
                    value={formData.seo_title || ''}
                    onChange={(e) => handleChange('seo_title', e.target.value)}
                  />
                </div>
                <div>
                  <Label>SEO Description</Label>
                  <Textarea
                    value={formData.seo_description || ''}
                    onChange={(e) => handleChange('seo_description', e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Image Alt Text</Label>
                  <Input
                    value={formData.image_alt_text || ''}
                    onChange={(e) => handleChange('image_alt_text', e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Label>Marketing Tags</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_new_arrival"
                        checked={formData.is_new_arrival || false}
                        onCheckedChange={(checked) => handleChange('is_new_arrival', checked)}
                      />
                      <Label htmlFor="is_new_arrival">New Arrival</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_clearance"
                        checked={formData.is_clearance || false}
                        onCheckedChange={(checked) => handleChange('is_clearance', checked)}
                      />
                      <Label htmlFor="is_clearance">Clearance</Label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {product ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
