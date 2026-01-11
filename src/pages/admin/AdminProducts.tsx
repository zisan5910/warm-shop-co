import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useProducts, useCategories, productService, categoryService } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '@/types';
import { useState } from 'react';

const AdminProducts = () => {
  const { products, loading } = useProducts();
  const { categories } = useCategories();
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    price: '', 
    stock: '', 
    categoryId: '', 
    images: '', 
    description: '' 
  });

  const resetForm = () => { 
    setForm({ name: '', price: '', stock: '', categoryId: '', images: '', description: '' }); 
    setEditingProduct(null); 
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({ 
      name: product.name, 
      price: String(product.price), 
      stock: String(product.stock), 
      categoryId: product.categoryId, 
      images: product.images.join(', '), 
      description: product.description 
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    
    if (!form.price || Number(form.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setFormLoading(true);
    try {
      const data = { 
        name: form.name.trim(), 
        price: Number(form.price), 
        stock: Number(form.stock) || 0, 
        categoryId: form.categoryId, 
        images: form.images.split(',').map(s => s.trim()).filter(Boolean), 
        description: form.description.trim() 
      };
      
      if (editingProduct) { 
        await productService.update(editingProduct.id, data); 
        toast.success('Product updated successfully'); 
      } else { 
        await productService.create(data); 
        toast.success('Product created successfully'); 
      }
      setOpen(false); 
      resetForm();
    } catch (e) { 
      toast.error('Operation failed'); 
    } finally { 
      setFormLoading(false); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try { 
      await productService.delete(id); 
      toast.success('Product deleted'); 
    } catch { 
      toast.error('Delete failed'); 
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">{products.length} products total</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input 
                  id="name"
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  placeholder="Enter product name"
                  required 
                  className="mt-1" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (৳) *</Label>
                  <Input 
                    id="price"
                    type="number" 
                    min="1"
                    value={form.price} 
                    onChange={e => setForm({...form, price: e.target.value})} 
                    placeholder="0"
                    required 
                    className="mt-1" 
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input 
                    id="stock"
                    type="number" 
                    min="0"
                    value={form.stock} 
                    onChange={e => setForm({...form, stock: e.target.value})} 
                    placeholder="0"
                    className="mt-1" 
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={form.categoryId} 
                  onValueChange={v => setForm({...form, categoryId: v})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {categories.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    No categories yet. Add categories in Settings.
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="images">Image URLs</Label>
                <Input 
                  id="images"
                  value={form.images} 
                  onChange={e => setForm({...form, images: e.target.value})} 
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" 
                  className="mt-1" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate multiple URLs with commas
                </p>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})} 
                  placeholder="Enter product description..."
                  className="mt-1" 
                  rows={3} 
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={formLoading}>
                  {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-2xl">📦</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">No products yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Start by adding your first product
          </p>
          <Button onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Product</th>
                  <th className="px-4 py-3 text-left text-sm font-medium hidden md:table-cell">Category</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Price</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Stock</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                              No img
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium text-sm block truncate">{p.name}</span>
                          <span className="text-xs text-muted-foreground block truncate md:hidden">
                            {categories.find(c => c.id === p.categoryId)?.name || 'Uncategorized'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                      {categories.find(c => c.id === p.categoryId)?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">৳{p.price.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        p.stock === 0 ? 'bg-destructive/10 text-destructive' : 
                        p.stock < 10 ? 'bg-warning/10 text-warning' : 
                        'bg-success/10 text-success'
                      }`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
