'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entities } from '@/lib/base44-compat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Eye, Search, Upload, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import RichTextEditor from './RichTextEditor';

export default function AdminBlogPostsClient() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    author_name: '',
    featured_image: '',
    image_alt_text: '',
    category: 'flooring_tips',
    tags: [],
    status: 'draft',
    published_date: '',
    read_time: 5,
    seo_title: '',
    seo_description: '',
    keywords: [],
  });

  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: () => entities.BlogPost.list('-created_date', 500),
  });

  const createMutation = useMutation({
    mutationFn: (data) => entities.BlogPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast.success('Blog post created successfully!');
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => entities.BlogPost.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast.success('Blog post updated successfully!');
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => entities.BlogPost.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast.success('Blog post deleted successfully!');
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      author_name: '',
      featured_image: '',
      image_alt_text: '',
      category: 'flooring_tips',
      tags: [],
      status: 'draft',
      published_date: '',
      read_time: 5,
      seo_title: '',
      seo_description: '',
      keywords: [],
    });
    setEditingPost(null);
    setDialogOpen(false);
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      ...post,
      tags: post.tags || [],
      keywords: post.keywords || [],
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData };

    if (!data.slug && data.title) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '—';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Blog Post Management</h1>
          <p className="text-slate-600">Create and manage blog posts</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="auto-generated"
                  />
                </div>
                <div>
                  <Label>Author Name</Label>
                  <Input
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Content *</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsHtmlMode(!isHtmlMode)}
                    >
                      {isHtmlMode ? 'Rich Editor' : 'Raw HTML'}
                    </Button>
                  </div>
                </div>
                {isHtmlMode ? (
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full min-h-[400px] p-3 border border-slate-300 rounded-md font-mono text-sm"
                    placeholder="Paste your HTML here..."
                  />
                ) : (
                  <RichTextEditor
                    value={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    placeholder="Write your blog post content..."
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flooring_tips">Flooring Tips</SelectItem>
                      <SelectItem value="installation_guide">Installation Guide</SelectItem>
                      <SelectItem value="design_trends">Design Trends</SelectItem>
                      <SelectItem value="product_reviews">Product Reviews</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="company_news">Company News</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Read Time (minutes)</Label>
                  <Input
                    type="number"
                    value={formData.read_time}
                    onChange={(e) => setFormData({ ...formData, read_time: parseInt(e.target.value) || 5 })}
                  />
                </div>
              </div>

              <div>
                <Label>Featured Image</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={formData.featured_image}
                    onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                    placeholder="Image URL or upload below"
                    className="flex-1"
                  />
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border rounded-md cursor-pointer hover:bg-slate-50 transition">
                    <Upload className="w-4 h-4" />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          toast.info('Uploading image...');
                          const { getSupabaseBrowserClient } = await import('@/lib/supabase');
                          const supabase = getSupabaseBrowserClient();
                          const ext = file.name.split('.').pop();
                          const path = `blog/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
                          const { error: uploadErr } = await supabase.storage
                            .from('blog-images')
                            .upload(path, file, { contentType: file.type });
                          if (uploadErr) throw uploadErr;
                          const { data: urlData } = supabase.storage
                            .from('blog-images')
                            .getPublicUrl(path);
                          setFormData((prev) => ({ ...prev, featured_image: urlData.publicUrl }));
                          toast.success('Image uploaded!');
                        } catch (err) {
                          toast.error('Upload failed: ' + err.message);
                        }
                      }}
                    />
                  </label>
                </div>
                {formData.featured_image && (
                  <img src={formData.featured_image} alt="Preview" className="mt-2 h-32 rounded object-cover" />
                )}
              </div>

              <div>
                <Label>Image Alt Text</Label>
                <Input
                  value={formData.image_alt_text}
                  onChange={(e) => setFormData({ ...formData, image_alt_text: e.target.value })}
                />
              </div>

              <div>
                <Label>Tags (comma separated)</Label>
                <Input
                  value={formData.tags.join(', ')}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value.split(',').map((t) => t.trim()) })
                  }
                  placeholder="hardwood, installation, tips"
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">SEO Settings</h3>
                <div className="space-y-4">
                  <div>
                    <Label>SEO Title</Label>
                    <Input
                      value={formData.seo_title}
                      onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>SEO Description</Label>
                    <Input
                      value={formData.seo_description}
                      onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Excerpt</Label>
                    <Input
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Keywords (comma separated)</Label>
                    <Input
                      value={formData.keywords.join(', ')}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          keywords: e.target.value.split(',').map((k) => k.trim()),
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Publish Date/Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.published_date}
                    onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-amber-500 hover:bg-amber-600">
                  {editingPost ? 'Update' : 'Create'} Post
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading posts...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published Date</TableHead>
                <TableHead>Views</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{post.category?.replace(/_/g, ' ')}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        post.status === 'published'
                          ? 'default'
                          : post.status === 'scheduled'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(post.published_date)}</TableCell>
                  <TableCell>{post.view_count || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(post)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Delete this post?')) {
                            deleteMutation.mutate(post.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
