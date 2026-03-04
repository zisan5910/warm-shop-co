import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProducts } from '@/hooks/useFirestoreData';
import { useCart } from '@/contexts/CartContext';
import { Star, Minus, Plus, ChevronLeft, ChevronRight, Truck, Shield, RotateCcw, ShoppingCart, ThumbsUp, CheckCircle, AlertTriangle, Banknote, Smartphone, ExternalLink, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ProductCard from '@/components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

const staticReviews = [
  { id: 'r1', userName: 'Rahim A.', rating: 5, comment: 'অসাধারণ পণ্য! খুবই সন্তুষ্ট।', date: '2025-01-15', helpful: 12 },
  { id: 'r2', userName: 'Fatima K.', rating: 4, comment: 'ভালো মানের, দামের তুলনায় অনেক ভালো।', date: '2025-01-10', helpful: 8 },
  { id: 'r3', userName: 'Kamal H.', rating: 5, comment: 'চমৎকার! আবারও কিনবো।', date: '2024-12-28', helpful: 15 },
  { id: 'r4', userName: 'Sumaiya R.', rating: 3, comment: 'পণ্য ভালো, তবে ডেলিভারি একটু দেরিতে এসেছে।', date: '2024-12-20', helpful: 3 },
];

function ShareButtons({ product }: { product: any }) {
  const url = window.location.href;
  const text = `${product.name} - ৳${product.price}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: product.name, text, url }); } catch {}
    }
  };

  return (
    <div className="flex items-center gap-2 mt-4">
      <span className="text-xs font-semibold text-muted-foreground">Share:</span>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-80 transition-opacity" title="Facebook">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
      </a>
      <a href={`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-80 transition-opacity" title="WhatsApp">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#0A66C2] text-white flex items-center justify-center hover:opacity-80 transition-opacity" title="LinkedIn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      </a>
      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#000000] text-white flex items-center justify-center hover:opacity-80 transition-opacity" title="X / Twitter">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </a>
      {typeof navigator.share === 'function' && (
        <button onClick={handleNativeShare} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors" title="Share">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        </button>
      )}
    </div>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useProducts();
  const product = products.find(p => p.id === id);
  const related = product ? products.filter(p => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4) : [];
  const otherCategoryProducts = product ? products.filter(p => p.categoryId !== product.categoryId).slice(0, 8) : [];
  const { addToCart } = useCart();
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-muted-foreground">পণ্য পাওয়া যায়নি</p>
    </div>
  );

  const isDigital = !!product.isDigital;
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  const handleAddToCart = async () => {
    await addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images?.[0] || '',
      stock: isDigital ? 999 : product.stock,
      selectedSize: selectedSize || product.sizes?.[0],
      selectedColor: selectedColor || product.colors?.[0],
      quantity: qty,
      isDigital,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    const item = {
      productId: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images?.[0] || '',
      stock: isDigital ? 999 : product.stock,
      selectedSize: selectedSize || product.sizes?.[0],
      selectedColor: selectedColor || product.colors?.[0],
      quantity: qty,
      isDigital,
    };
    navigate('/checkout', { state: { selectedItems: [item], isDigitalOrder: isDigital } });
  };

  return (
    <div className="pb-36 lg:pb-8">
      <div className="max-w-screen-xl mx-auto lg:px-6 lg:py-6">
        <div className="lg:grid lg:grid-cols-2 lg:gap-10">
          {/* Image Gallery */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <div className="relative overflow-hidden bg-muted lg:rounded-2xl">
              <AnimatePresence mode="wait">
                <motion.img key={currentImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} src={product.images?.[currentImage] || '/placeholder.svg'} alt={product.name} className="w-full aspect-square object-cover" />
              </AnimatePresence>
              {(product.images?.length || 0) > 1 && (<>
                <button onClick={() => setCurrentImage(prev => (prev - 1 + product.images.length) % product.images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card/80 backdrop-blur flex items-center justify-center shadow-md"><ChevronLeft size={18} /></button>
                <button onClick={() => setCurrentImage(prev => (prev + 1) % product.images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card/80 backdrop-blur flex items-center justify-center shadow-md"><ChevronRight size={18} /></button>
              </>)}
              {discount && discount > 0 && <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-sm font-bold px-2 py-1 rounded-lg">-{discount}%</span>}
              {isDigital && <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1"><Monitor size={12} /> Digital</span>}
            </div>
            {(product.images?.length || 0) > 1 && (
              <div className="flex gap-2 p-4 lg:p-0 lg:mt-3 overflow-x-auto scrollbar-hide">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setCurrentImage(i)} className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === currentImage ? 'border-primary' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="px-4 py-4 lg:px-0">
            <div>
              <div className="flex items-center gap-2">
                <Link to={`/category/${product.categoryId}`} className="text-primary text-xs font-medium">{product.category}</Link>
                {isDigital && <Badge variant="secondary" className="text-[10px] gap-1"><Monitor size={10} /> Digital Product</Badge>}
              </div>
              <h1 className="text-xl font-bold mt-1 leading-tight">{product.name}</h1>
            </div>

            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1">{[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= Math.floor(product.rating || 0) ? 'fill-accent text-accent' : 'text-muted'} />)}</div>
              <span className="text-sm font-semibold">{product.rating || 0}</span>
              <span className="text-sm text-muted-foreground">({product.reviewCount || 0} reviews)</span>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <span className="text-3xl font-bold">৳{product.price?.toFixed(0)}</span>
              {product.originalPrice && <span className="text-lg text-muted-foreground line-through">৳{product.originalPrice?.toFixed(0)}</span>}
              {discount && discount > 0 && <Badge className="bg-destructive/10 text-destructive border-destructive/20">Save {discount}%</Badge>}
            </div>

            {!isDigital && (
              <div className="mt-3">
                {product.stock > 10 ? <span className="text-green-600 text-sm font-medium flex items-center gap-1"><CheckCircle size={14} /> In Stock ({product.stock})</span>
                  : product.stock > 0 ? <span className="text-amber-500 text-sm font-semibold flex items-center gap-1"><AlertTriangle size={14} /> Only {product.stock} left!</span>
                  : <span className="text-destructive text-sm font-semibold">Out of Stock</span>}
              </div>
            )}

            {isDigital && (
              <div className="mt-3">
                <span className="text-green-600 text-sm font-medium flex items-center gap-1"><CheckCircle size={14} /> Instant Delivery After Payment</span>
              </div>
            )}

            {/* Live Demo Button for Digital Products */}
            {isDigital && product.demoUrl && (
              <a href={product.demoUrl} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-center gap-2 w-full h-11 rounded-xl border-2 border-primary text-primary font-semibold text-sm hover:bg-primary/5 transition-colors">
                <ExternalLink size={16} /> Live Demo দেখুন
              </a>
            )}

            {/* Social Share */}
            <ShareButtons product={product} />

            {!isDigital && product.colors && product.colors.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold mb-2">Color: <span className="font-normal text-muted-foreground">{selectedColor || product.colors[0]}</span></p>
                <div className="flex gap-2 flex-wrap">{product.colors.map(color => (
                  <button key={color} onClick={() => setSelectedColor(color)} className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${(selectedColor || product.colors![0]) === color ? 'border-primary bg-primary/10 text-primary' : 'border-border'}`}>{color}</button>
                ))}</div>
              </div>
            )}

            {!isDigital && product.sizes && product.sizes.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold mb-2">Size: <span className="font-normal text-muted-foreground">{selectedSize || product.sizes[0]}</span></p>
                <div className="flex gap-2 flex-wrap">{product.sizes.map(size => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`w-11 h-11 rounded-xl border text-sm font-medium transition-all ${(selectedSize || product.sizes![0]) === size ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>{size}</button>
                ))}</div>
              </div>
            )}

            {!isDigital && (
              <div className="mt-5 flex items-center gap-4">
                <p className="text-sm font-semibold">Quantity:</p>
                <div className="flex items-center gap-3 border border-border rounded-xl p-1">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted"><Minus size={14} /></button>
                  <span className="text-sm font-bold w-6 text-center">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted"><Plus size={14} /></button>
                </div>
              </div>
            )}

            {/* Desktop action buttons */}
            <div className="hidden lg:flex gap-3 mt-6">
              {isDigital ? (
                <Button className="flex-1 h-12 font-semibold" onClick={handleBuyNow}>Buy Now — ৳{product.price?.toFixed(0)}</Button>
              ) : (
                <>
                  <Button variant="outline" className="flex-1 h-12 font-semibold gap-2" onClick={handleAddToCart} disabled={product.stock === 0}>
                    {addedToCart ? <><CheckCircle size={16} /> Added to Cart!</> : <><ShoppingCart size={16} /> Add to Cart</>}
                  </Button>
                  <Button className="flex-1 h-12 font-semibold" onClick={handleBuyNow} disabled={product.stock === 0}>Buy Now</Button>
                </>
              )}
            </div>

            {/* Trust Badges */}
            <div className="mt-6 bg-muted/40 rounded-2xl p-4 border border-border">
              <h3 className="font-bold text-sm mb-3 text-foreground">{isDigital ? 'ডিজিটাল প্রোডাক্ট সুবিধা' : 'আমাদের সুবিধাসমূহ'}</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {(isDigital ? [
                  { icon: Smartphone, label: 'মোবাইল ব্যাংকিং', sub: 'bKash / Nagad', color: 'text-pink-500 bg-pink-500/10' },
                  { icon: CheckCircle, label: 'Instant Delivery', sub: 'পেমেন্টের পর ডাউনলোড', color: 'text-green-600 bg-green-500/10' },
                  { icon: Shield, label: '100% অরিজিনাল', sub: 'গ্যারান্টিযুক্ত ফাইল', color: 'text-amber-500 bg-amber-500/10' },
                  { icon: Monitor, label: 'লাইভ ডেমো', sub: 'কেনার আগে দেখুন', color: 'text-blue-500 bg-blue-500/10' },
                ] : [
                  { icon: Banknote, label: 'ক্যাশ অন ডেলিভারি', sub: 'পণ্য পেয়ে পেমেন্ট', color: 'text-green-600 bg-green-500/10' },
                  { icon: Smartphone, label: 'মোবাইল ব্যাংকিং', sub: 'bKash / Nagad', color: 'text-pink-500 bg-pink-500/10' },
                  { icon: RotateCcw, label: '7 দিনে পণ্য ফেরত', sub: 'সহজ রিটার্ন পলিসি', color: 'text-blue-500 bg-blue-500/10' },
                  { icon: Shield, label: '100% টাকা ফেরত', sub: 'মানি ব্যাক গ্যারান্টি', color: 'text-amber-500 bg-amber-500/10' },
                  { icon: CheckCircle, label: '99% অরিজিনাল', sub: 'প্রোডাক্ট গ্যারান্টি', color: 'text-emerald-600 bg-emerald-500/10' },
                  { icon: Truck, label: 'দ্রুত ডেলিভারি', sub: 'সারাদেশে পৌঁছে দেই', color: 'text-purple-500 bg-purple-500/10' },
                ]).map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-2.5 p-2.5 bg-card rounded-xl border border-border/50">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                        <ItemIcon size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold leading-tight">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Accordion type="multiple" className="mt-5" defaultValue={['description']}>
              <AccordionItem value="description"><AccordionTrigger className="text-sm font-semibold">Description</AccordionTrigger><AccordionContent className="text-sm text-muted-foreground leading-relaxed">{product.description}</AccordionContent></AccordionItem>
            </Accordion>

            {/* Reviews */}
            <div className="mt-6">
              <h2 className="font-bold text-base mb-4">Customer Reviews</h2>
              <div className="space-y-4">
                {staticReviews.map(review => (
                  <div key={review.id} className="border-b border-border/50 pb-4 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{review.userName[0]}</div>
                      <div>
                        <p className="text-sm font-semibold">{review.userName}</p>
                        <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= review.rating ? 'fill-accent text-accent' : 'text-muted'} />)}</div>
                      </div>
                      <span className="ml-auto text-xs text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                    <button className="text-xs text-muted-foreground mt-2 hover:text-primary flex items-center gap-1"><ThumbsUp size={12} /> Helpful ({review.helpful})</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {related.length > 0 && (
          <section className="mt-4 px-4 lg:px-0">
            <h2 className="font-bold text-base mb-4">Similar Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">{related.map(p => <ProductCard key={p.id} product={p} />)}</div>
          </section>
        )}

        {otherCategoryProducts.length > 0 && (
          <section className="mt-6 px-4 lg:px-0">
            <h2 className="font-bold text-base mb-4">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">{otherCategoryProducts.map(p => <ProductCard key={p.id} product={p} />)}</div>
          </section>
        )}
      </div>

      {/* Mobile sticky action bar */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 p-3 bg-card border-t border-border z-30">
        <div className="flex gap-3 max-w-screen-xl mx-auto">
          {isDigital ? (
            <Button className="flex-1 h-11 font-semibold text-sm" onClick={handleBuyNow}>Buy Now — ৳{product.price?.toFixed(0)}</Button>
          ) : (
            <>
              <Button variant="outline" className="flex-1 h-11 font-semibold text-sm gap-2" onClick={handleAddToCart} disabled={product.stock === 0}>
                {addedToCart ? <><CheckCircle size={14} /> Added!</> : <><ShoppingCart size={14} /> Add to Cart</>}
              </Button>
              <Button className="flex-1 h-11 font-semibold text-sm" onClick={handleBuyNow} disabled={product.stock === 0}>Buy Now</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
