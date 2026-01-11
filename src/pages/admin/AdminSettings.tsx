import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useSettings, settingsService } from '@/hooks/useSettings';
import { useCategories, categoryService } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Loader2, Pencil, Check, X, Banknote, Smartphone, Store, Phone, Mail, MapPin, MessageCircle, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

const AdminSettings = () => {
  const { settings, loading } = useSettings();
  const { categories } = useCategories();
  
  // Payment Methods
  const [cod, setCod] = useState(true);
  const [bkash, setBkash] = useState(true);
  
  // Delivery
  const [dhaka, setDhaka] = useState('60');
  const [outside, setOutside] = useState('120');
  
  // Branding
  const [appName, setAppName] = useState('ShopHub');
  const [appLogo, setAppLogo] = useState('');
  
  // Contact Info
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  
  // Payment Info
  const [bkashNumber, setBkashNumber] = useState('');
  
  // Categories
  const [newCat, setNewCat] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');

  useEffect(() => {
    if (settings) {
      setCod(settings.paymentMethods?.cod ?? true);
      setBkash(settings.paymentMethods?.bkash ?? true);
      setDhaka(String(settings.deliveryCharges?.dhaka ?? 60));
      setOutside(String(settings.deliveryCharges?.outside_dhaka ?? 120));
      setAppName(settings.appName || 'ShopHub');
      setAppLogo(settings.appLogo || '');
      setPhone(settings.phone || '');
      setWhatsapp(settings.whatsapp || '');
      setEmail(settings.email || '');
      setLocation(settings.location || '');
      setBkashNumber(settings.bkashNumber || '');
    }
  }, [settings]);

  const savePayment = async () => { 
    setSaving(true); 
    try { 
      await settingsService.updatePaymentMethods({ cod, bkash }); 
      toast.success('Payment settings saved'); 
    } catch { 
      toast.error('Failed to save'); 
    } finally { 
      setSaving(false); 
    } 
  };

  const saveDelivery = async () => { 
    setSaving(true); 
    try { 
      await settingsService.updateDeliveryCharges({ 
        dhaka: Number(dhaka), 
        outside_dhaka: Number(outside), 
        default: Number(dhaka) 
      }); 
      toast.success('Delivery charges saved'); 
    } catch { 
      toast.error('Failed to save'); 
    } finally { 
      setSaving(false); 
    } 
  };

  const saveBranding = async () => {
    setSaving(true);
    try {
      await settingsService.updateBranding({ appName, appLogo });
      toast.success('Branding saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const saveContactInfo = async () => {
    setSaving(true);
    try {
      await settingsService.updateContactInfo({ phone, whatsapp, email, location });
      toast.success('Contact info saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const savePaymentInfo = async () => {
    setSaving(true);
    try {
      await settingsService.updatePaymentInfo({ bkashNumber });
      toast.success('Payment info saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const addCategory = async () => { 
    if (!newCat.trim()) {
      toast.error('Please enter a category name');
      return;
    }
    try { 
      await categoryService.create(newCat.trim()); 
      setNewCat(''); 
      toast.success('Category added'); 
    } catch { 
      toast.error('Failed to add category'); 
    } 
  };

  const updateCategory = async (id: string) => {
    if (!editCatName.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }
    try {
      await categoryService.update(id, editCatName.trim());
      setEditingCat(null);
      setEditCatName('');
      toast.success('Category updated');
    } catch {
      toast.error('Failed to update category');
    }
  };

  const deleteCategory = async (id: string) => { 
    if (!confirm('Delete this category? Products in this category will become uncategorized.')) return; 
    try { 
      await categoryService.delete(id); 
      toast.success('Category deleted'); 
    } catch { 
      toast.error('Failed to delete'); 
    } 
  };

  const startEditCategory = (id: string, name: string) => {
    setEditingCat(id);
    setEditCatName(name);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold mb-6">Settings</h1>
      
      <div className="grid lg:grid-cols-2 gap-6">
        {/* App Branding */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">App Branding</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Customize your app name and logo
          </p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="appName">App Name</Label>
              <Input 
                id="appName"
                value={appName} 
                onChange={e => setAppName(e.target.value)} 
                placeholder="Your App Name"
                className="mt-1" 
              />
            </div>
            <div>
              <Label htmlFor="appLogo">Logo URL</Label>
              <Input 
                id="appLogo"
                value={appLogo} 
                onChange={e => setAppLogo(e.target.value)} 
                placeholder="https://example.com/logo.png"
                className="mt-1" 
              />
              {appLogo && (
                <div className="mt-2 p-2 bg-secondary rounded-lg inline-block">
                  <img src={appLogo} alt="Logo Preview" className="h-10 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
            </div>
          </div>
          <Button onClick={saveBranding} className="mt-4 w-full" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Branding
          </Button>
        </div>

        {/* Contact Information */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">Contact Information</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Contact details shown to customers
          </p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> Phone Number
              </Label>
              <Input 
                id="phone"
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="01XXXXXXXXX"
                className="mt-1" 
              />
            </div>
            <div>
              <Label htmlFor="whatsapp" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" /> WhatsApp Number
              </Label>
              <Input 
                id="whatsapp"
                value={whatsapp} 
                onChange={e => setWhatsapp(e.target.value)} 
                placeholder="8801XXXXXXXXX (with country code)"
                className="mt-1" 
              />
            </div>
            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email Address
              </Label>
              <Input 
                id="email"
                type="email"
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="support@example.com"
                className="mt-1" 
              />
            </div>
            <div>
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Location / Address
              </Label>
              <Textarea 
                id="location"
                value={location} 
                onChange={e => setLocation(e.target.value)} 
                placeholder="Shop address..."
                className="mt-1" 
              />
            </div>
          </div>
          <Button onClick={saveContactInfo} className="mt-4 w-full" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Contact Info
          </Button>
        </div>

        {/* Payment Methods */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">Payment Methods</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Enable or disable payment options for customers
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <Banknote className="w-5 h-5 text-success" />
                <div>
                  <Label className="font-medium">Cash on Delivery</Label>
                  <p className="text-xs text-muted-foreground">Pay when order arrives</p>
                </div>
              </div>
              <Switch checked={cod} onCheckedChange={setCod} />
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-pink-500" />
                <div>
                  <Label className="font-medium">bKash</Label>
                  <p className="text-xs text-muted-foreground">Mobile payment</p>
                </div>
              </div>
              <Switch checked={bkash} onCheckedChange={setBkash} />
            </div>
          </div>
          <Button onClick={savePayment} className="mt-4 w-full" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Payment Settings
          </Button>
        </div>

        {/* Payment Number */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5 text-pink-500" />
            <h2 className="font-semibold text-lg">bKash Payment Number</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            bKash merchant/personal number for receiving payments
          </p>
          <div>
            <Label htmlFor="bkashNumber">bKash Number</Label>
            <Input 
              id="bkashNumber"
              value={bkashNumber} 
              onChange={e => setBkashNumber(e.target.value)} 
              placeholder="01XXXXXXXXX"
              className="mt-1" 
            />
          </div>
          <Button onClick={savePaymentInfo} className="mt-4 w-full" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Payment Number
          </Button>
        </div>

        {/* Delivery Charges */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">Delivery Charges</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Set delivery charges by location
          </p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dhaka">Inside Dhaka (৳)</Label>
              <Input 
                id="dhaka"
                type="number" 
                min="0"
                value={dhaka} 
                onChange={e => setDhaka(e.target.value)} 
                className="mt-1" 
              />
            </div>
            <div>
              <Label htmlFor="outside">Outside Dhaka (৳)</Label>
              <Input 
                id="outside"
                type="number" 
                min="0"
                value={outside} 
                onChange={e => setOutside(e.target.value)} 
                className="mt-1" 
              />
            </div>
          </div>
          <Button onClick={saveDelivery} className="mt-4 w-full" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Delivery Charges
          </Button>
        </div>

        {/* Categories */}
        <div className="bg-card rounded-xl border border-border p-6 lg:col-span-2">
          <h2 className="font-semibold text-lg mb-4">Product Categories</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Manage product categories for better organization
          </p>
          
          <div className="flex gap-2 mb-6">
            <Input 
              value={newCat} 
              onChange={e => setNewCat(e.target.value)} 
              placeholder="Enter category name"
              onKeyDown={(e) => e.key === 'Enter' && addCategory()}
            />
            <Button onClick={addCategory}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
          
          {categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No categories yet. Add your first category above.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map(c => (
                <div 
                  key={c.id} 
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg group"
                >
                  {editingCat === c.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input 
                        value={editCatName}
                        onChange={e => setEditCatName(e.target.value)}
                        className="h-8"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') updateCategory(c.id);
                          if (e.key === 'Escape') setEditingCat(null);
                        }}
                      />
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => updateCategory(c.id)}>
                        <Check className="w-4 h-4 text-success" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingCat(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium">{c.name}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8"
                          onClick={() => startEditCategory(c.id, c.name)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8"
                          onClick={() => deleteCategory(c.id)}
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;