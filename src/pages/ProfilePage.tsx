import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders, useSettings, bindReferral, generateLoyaltyCoupon, useMyCoupons } from '@/hooks/useFirestoreData';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, MapPin, Package, Gift, Settings, Star, Copy, Check, ExternalLink, Clock, Shield, FileText, RotateCcw, Save, Ticket, Share2, Link2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, userData, logout, refreshUserData } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [referralInput, setReferralInput] = useState('');
  const [referralMsg, setReferralMsg] = useState('');
  const [referralErr, setReferralErr] = useState('');
  const [profileForm, setProfileForm] = useState({ displayName: '', phone: '', deliveryAddress: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [generatingCoupon, setGeneratingCoupon] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState('');
  const [redeemMsg, setRedeemMsg] = useState('');
  const [redeemErr, setRedeemErr] = useState('');

  const { orders, loading: ordersLoading } = useOrders(user?.uid);
  const { coupons: myCoupons } = useMyCoupons(user?.uid);
  const [couponCopied, setCouponCopied] = useState('');

  // Default tab from URL param
  const defaultTab = searchParams.get('tab') || 'orders';

  useEffect(() => {
    if (userData) {
      setProfileForm({
        displayName: userData.displayName || user?.displayName || '',
        phone: userData.phone || '',
        deliveryAddress: (userData as any).deliveryAddress || '',
      });
    }
  }, [userData, user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center"><User size={36} className="text-muted-foreground" /></div>
        <h2 className="text-xl font-bold">Please Login</h2>
        <p className="text-muted-foreground text-sm">Sign in to access your profile</p>
        <Button onClick={() => navigate('/auth')} className="mt-2">Login / Register</Button>
      </div>
    );
  }

  const referralCode = userData?.referralCode || '';
  const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const shareReferralLink = async () => {
    const text = `${settings.appName} এ জয়েন করুন এবং বোনাস পয়েন্ট পান! আমার রেফারেল লিংক ব্যবহার করুন:`;
    if (navigator.share) {
      try {
        await navigator.share({ title: settings.appName, text, url: referralLink });
      } catch {}
    } else {
      copyReferralLink();
    }
  };

  const shareOnSocial = async (platform: string) => {
    const text = `${settings.appName} - সেরা অনলাইন শপিং অভিজ্ঞতা!`;
    let shareUrl = '';
    switch (platform) {
      case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`; break;
      case 'whatsapp': shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + referralLink)}`; break;
      case 'twitter': shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`; break;
      case 'linkedin': shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`; break;
    }
    if (shareUrl) window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleBindReferral = async () => {
    setReferralErr(''); setReferralMsg('');
    if (!referralInput.trim()) return;
    try {
      await bindReferral(user.uid, referralInput.trim());
      setReferralMsg('রেফারেল কোড সফলভাবে যুক্ত হয়েছে! ৫০ পয়েন্ট পেয়েছেন।');
      setReferralInput('');
      await refreshUserData();
    } catch (err: any) {
      setReferralErr(err.message || 'Invalid referral code');
    }
  };

  const handleRedeemPoints = async () => {
    setRedeemErr(''); setRedeemMsg('');
    const pts = Number(pointsToRedeem);
    if (!pts || pts <= 0) { setRedeemErr('কতটা পয়েন্ট ব্যবহার করবেন লিখুন'); return; }
    if (pts > (userData?.loyaltyPoints || 0)) { setRedeemErr('পর্যাপ্ত পয়েন্ট নেই'); return; }
    setGeneratingCoupon(true);
    try {
      const pointsPerTaka = settings.pointsPerTaka || 10;
      const coupon = await generateLoyaltyCoupon(user.uid, pts, pointsPerTaka);
      const discount = Math.floor(pts / pointsPerTaka);
      setRedeemMsg(`কুপন তৈরি হয়েছে: ${coupon.code} — ৳${discount} ডিসকাউন্ট পাবেন!`);
      setPointsToRedeem('');
      await refreshUserData();
    } catch (err: any) {
      setRedeemErr(err.message || 'কুপন তৈরি করতে সমস্যা হয়েছে');
    } finally {
      setGeneratingCoupon(false);
    }
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: profileForm.displayName,
        phone: profileForm.phone,
        deliveryAddress: profileForm.deliveryAddress,
      });
      await refreshUserData();
      toast({ title: 'সেভ হয়েছে', description: 'প্রোফাইল তথ্য আপডেট করা হয়েছে।' });
    } catch {
      toast({ title: 'Error', description: 'আপডেট করতে সমস্যা হয়েছে।', variant: 'destructive' });
    } finally {
      setProfileSaving(false);
    }
  };

  const pointsPerTaka = settings.pointsPerTaka || 10;
  const maxRedeemable = userData?.loyaltyPoints || 0;
  const previewDiscount = pointsToRedeem ? Math.floor(Number(pointsToRedeem) / pointsPerTaka) : 0;

  return (
    <div className="pb-nav lg:pb-8 max-w-screen-md mx-auto px-4 py-5">
      <div className="flex items-center gap-4 mb-6 p-4 bg-card border border-border rounded-2xl">
        <Avatar className="w-16 h-16">
          <AvatarImage src={user.photoURL || undefined} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">{(user.displayName || 'U')[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="font-bold text-lg">{profileForm.displayName || user.displayName || 'User'}</h1>
          <p className="text-muted-foreground text-sm">{user.email}</p>
          {userData?.loyaltyPoints !== undefined && (
            <div className="flex items-center gap-1 mt-1"><Star size={12} className="text-accent fill-accent" /><span className="text-xs font-semibold text-accent">{userData.loyaltyPoints} points</span></div>
          )}
        </div>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="w-full grid grid-cols-4 mb-5 h-auto rounded-xl">
          <TabsTrigger value="orders" className="py-2 text-xs rounded-lg flex-col gap-1 h-14"><Package size={14} />Orders</TabsTrigger>
          <TabsTrigger value="rewards" className="py-2 text-xs rounded-lg flex-col gap-1 h-14"><Gift size={14} />Rewards</TabsTrigger>
          <TabsTrigger value="profile" className="py-2 text-xs rounded-lg flex-col gap-1 h-14"><User size={14} />Profile</TabsTrigger>
          <TabsTrigger value="settings" className="py-2 text-xs rounded-lg flex-col gap-1 h-14"><Settings size={14} />Settings</TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <div className="space-y-3">
            {ordersLoading ? (
              <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : orders.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <Package size={40} className="mx-auto mb-3 text-muted-foreground opacity-30" />
                <p className="text-sm text-muted-foreground">No orders yet</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/')}>Start Shopping</Button>
              </div>
            ) : orders.map(order => (
              <Link key={order.id} to="/orders" state={{ orderId: order.id }} className="block bg-card border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-mono text-muted-foreground">#{order.id.slice(0, 8)}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${order.status === 'delivered' ? 'bg-green-500/10 text-green-600' : order.status === 'cancelled' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>{order.status}</span>
                </div>
                <p className="text-sm font-medium">{order.items?.length || 0} items &middot; ৳{order.total?.toFixed(0)}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Clock size={12} /> {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('bn-BD') : 'Recent'}
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-primary"><ExternalLink size={12} /> View Details</div>
              </Link>
            ))}
          </div>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-4">
          <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-primary-foreground/70 text-sm">Loyalty Points</p>
                <p className="text-4xl font-bold mt-1">{userData?.loyaltyPoints || 0}</p>
                <p className="text-primary-foreground/60 text-xs mt-1">{pointsPerTaka} points = ৳1 discount</p>
              </div>
              <Star size={40} className="opacity-30" />
            </div>
          </div>

          {/* Redeem Points for Coupon */}
          {(userData?.loyaltyPoints || 0) >= pointsPerTaka && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="font-semibold text-sm mb-1 flex items-center gap-2"><Ticket size={14} className="text-primary" /> পয়েন্ট দিয়ে কুপন তৈরি</h2>
              <p className="text-xs text-muted-foreground mb-3">আপনার পয়েন্ট ব্যবহার করে একটি ডিসকাউন্ট কুপন তৈরি করুন।</p>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input type="number" value={pointsToRedeem} onChange={e => setPointsToRedeem(e.target.value)} placeholder={`Max: ${maxRedeemable} pts`} className="h-9 text-sm flex-1" max={maxRedeemable} min={pointsPerTaka} />
                  <Button size="sm" onClick={handleRedeemPoints} disabled={generatingCoupon} className="h-9">{generatingCoupon ? 'Creating...' : 'Generate'}</Button>
                </div>
                {previewDiscount > 0 && <p className="text-xs text-primary font-medium">{pointsToRedeem} points = ৳{previewDiscount} discount</p>}
                {redeemMsg && <p className="text-xs text-green-600 bg-green-500/10 p-2 rounded-lg">{redeemMsg}</p>}
                {redeemErr && <p className="text-xs text-destructive">{redeemErr}</p>}
              </div>
            </div>
          )}

          {/* My Active Coupons */}
          {myCoupons.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="font-semibold text-sm mb-3 flex items-center gap-2"><Ticket size={14} className="text-primary" /> আপনার কুপন</h2>
              <div className="space-y-2">
                {myCoupons.map(c => (
                  <div key={c.id} className="flex items-center gap-3 bg-muted/50 rounded-xl p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold font-mono text-primary">{c.code}</p>
                      <p className="text-xs text-muted-foreground">{c.discountPercent > 0 ? `${c.discountPercent}% off` : `৳${c.maxDiscount} flat discount`}</p>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(c.code); setCouponCopied(c.id); setTimeout(() => setCouponCopied(''), 2000); }} className="p-2 hover:bg-border rounded-lg">
                      {couponCopied === c.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-muted-foreground" />}
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">কুপন একবার ব্যবহার করলে স্বয়ংক্রিয়ভাবে মুছে যাবে।</p>
            </div>
          )}

          {/* Referral Program with Deep Link */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h2 className="font-semibold text-sm mb-3 flex items-center gap-2"><Gift size={14} /> Referral Program</h2>
            <p className="text-xs text-muted-foreground mb-3">আপনার রেফারেল লিংক শেয়ার করুন এবং প্রতি রেফারেলে ৫০ পয়েন্ট পান। লিংকে ক্লিক করে রেজিস্টার করলেই রেফারেল সফল হবে!</p>
            
            {/* Referral Code */}
            <div className="flex items-center gap-2 bg-muted rounded-xl p-3 mb-3">
              <code className="flex-1 text-sm font-bold font-mono text-primary">{referralCode || '--------'}</code>
              <button onClick={copyReferralCode} className="p-1.5 hover:bg-border rounded-lg">{copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-muted-foreground" />}</button>
            </div>

            {/* Deep Link */}
            <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl p-3 mb-3">
              <Link2 size={14} className="text-primary shrink-0" />
              <span className="flex-1 text-xs font-mono text-primary truncate">{referralLink}</span>
              <button onClick={copyReferralLink} className="p-1.5 hover:bg-border rounded-lg shrink-0">
                {linkCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-muted-foreground" />}
              </button>
            </div>

            {/* Share buttons */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <button onClick={() => shareOnSocial('facebook')} className="h-9 w-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-80 transition-opacity" title="Facebook">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </button>
              <button onClick={() => shareOnSocial('whatsapp')} className="h-9 w-9 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-80 transition-opacity" title="WhatsApp">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </button>
              <button onClick={() => shareOnSocial('linkedin')} className="h-9 w-9 rounded-full bg-[#0A66C2] text-white flex items-center justify-center hover:opacity-80 transition-opacity" title="LinkedIn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </button>
              <button onClick={() => shareOnSocial('twitter')} className="h-9 w-9 rounded-full bg-[#000000] text-white flex items-center justify-center hover:opacity-80 transition-opacity" title="X / Twitter">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </button>
              <button onClick={shareReferralLink} className="h-9 w-9 rounded-full bg-muted text-foreground flex items-center justify-center hover:bg-muted/80 transition-colors" title="Share">
                <Share2 size={14} />
              </button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">রেফারেল কোড ব্যবহার করুন</Label>
              <div className="flex gap-2">
                <Input value={referralInput} onChange={e => setReferralInput(e.target.value)} placeholder="রেফারেল কোড দিন" className="flex-1 h-9 text-sm" disabled={!!userData?.referredBy} />
                <Button size="sm" onClick={handleBindReferral} className="h-9" disabled={!!userData?.referredBy}>Apply</Button>
              </div>
              {referralMsg && <p className="text-xs text-green-600">{referralMsg}</p>}
              {referralErr && <p className="text-xs text-destructive">{referralErr}</p>}
              {userData?.referredBy && <p className="text-xs text-muted-foreground">✓ Referred by: {userData.referredBy}</p>}
            </div>
          </div>

          {/* Share App for Rewards */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h2 className="font-semibold text-sm mb-2 flex items-center gap-2"><Share2 size={14} className="text-primary" /> Share & Earn</h2>
            <p className="text-xs text-muted-foreground mb-3">সোশ্যাল মিডিয়ায় অ্যাপ শেয়ার করুন এবং পয়েন্ট পান!</p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => shareOnSocial('facebook')} className="h-10 w-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-80" title="Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </button>
              <button onClick={() => shareOnSocial('whatsapp')} className="h-10 w-10 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-80" title="WhatsApp">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </button>
              <button onClick={() => shareOnSocial('linkedin')} className="h-10 w-10 rounded-full bg-[#0A66C2] text-white flex items-center justify-center hover:opacity-80" title="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </button>
              <button onClick={() => shareOnSocial('twitter')} className="h-10 w-10 rounded-full bg-[#000000] text-white flex items-center justify-center hover:opacity-80" title="X / Twitter">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </button>
              <button onClick={shareReferralLink} className="h-10 w-10 rounded-full bg-muted text-foreground flex items-center justify-center hover:bg-muted/80" title="Share">
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h2 className="font-semibold text-sm">Personal Information</h2>
            <div className="space-y-1.5"><Label className="text-xs">Full Name</Label><Input value={profileForm.displayName} onChange={e => setProfileForm(f => ({ ...f, displayName: e.target.value }))} className="h-10" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Email</Label><Input defaultValue={user.email || ''} disabled className="h-10 bg-muted" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Phone</Label><Input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} placeholder="+880" className="h-10" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Delivery Address</Label><Input value={profileForm.deliveryAddress} onChange={e => setProfileForm(f => ({ ...f, deliveryAddress: e.target.value }))} placeholder="আপনার ডেলিভারি ঠিকানা" className="h-10" /></div>
            <Button size="sm" className="w-full gap-2" onClick={handleSaveProfile} disabled={profileSaving}><Save size={14} /> {profileSaving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-3">
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {[
              { label: 'Privacy Policy', sub: 'প্রাইভেসি পলিসি দেখুন', path: '/privacy-policy', icon: Shield },
              { label: 'Terms & Conditions', sub: 'শর্তাবলী দেখুন', path: '/terms', icon: FileText },
              { label: 'Return Policy', sub: 'রিটার্ন পলিসি দেখুন', path: '/return-policy', icon: RotateCcw },
              { label: 'Support', sub: 'সাহায্য কেন্দ্র', path: '/support', icon: Settings },
            ].map(item => (
              <Link key={item.label} to={item.path} className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors text-left">
                <div className="flex items-center gap-3"><item.icon size={16} className="text-muted-foreground" /><div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.sub}</p></div></div>
                <span className="text-muted-foreground text-xs">›</span>
              </Link>
            ))}
          </div>
          <Button variant="destructive" className="w-full h-11" onClick={logout}>Logout</Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}