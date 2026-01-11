import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useBanners, bannerService } from '@/hooks/useBanners';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Banner } from '@/types';

const AdminBanners = () => {
  const { banners, loading } = useBanners();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState({ imageUrl: '', targetUrl: '', active: true });
  const [formLoading, setFormLoading] = useState(false);

  const resetForm = () => { setForm({ imageUrl: '', targetUrl: '', active: true }); setEditing(null); };

  const handleEdit = (b: Banner) => { setEditing(b); setForm({ imageUrl: b.imageUrl, targetUrl: b.targetUrl, active: b.active }); setOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true);
    try {
      if (editing) { await bannerService.update(editing.id, form); toast.success('Banner updated'); }
      else { await bannerService.create(form); toast.success('Banner created'); }
      setOpen(false); resetForm();
    } catch { toast.error('Operation failed'); } finally { setFormLoading(false); }
  };

  const handleDelete = async (id: string) => { if (!confirm('Delete?')) return; try { await bannerService.delete(id); toast.success('Deleted'); } catch { toast.error('Failed'); } };
  const toggleActive = async (b: Banner) => { try { await bannerService.update(b.id, { active: !b.active }); } catch { toast.error('Failed'); } };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Banners</h1>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Banner</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Edit Banner' : 'Add Banner'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Image URL</Label><Input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} required className="mt-1" /></div>
              <div><Label>Target URL</Label><Input value={form.targetUrl} onChange={e => setForm({...form, targetUrl: e.target.value})} className="mt-1" /></div>
              <div className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={c => setForm({...form, active: c})} /><Label>Active</Label></div>
              <Button type="submit" className="w-full" disabled={formLoading}>{formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map(b => (
            <div key={b.id} className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="aspect-[3/1] bg-secondary">{b.imageUrl && <img src={b.imageUrl} className="w-full h-full object-cover" />}</div>
              <div className="p-4 flex items-center justify-between">
                <Switch checked={b.active} onCheckedChange={() => toggleActive(b)} />
                <div><Button variant="ghost" size="icon" onClick={() => handleEdit(b)}><Pencil className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBanners;
