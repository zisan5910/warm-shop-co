import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/hooks/useSettings';
import { orderService } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check, ChevronLeft, ChevronRight, Loader2, MapPin, CreditCard, Package } from 'lucide-react';
import { toast } from 'sonner';
import { PaymentMethod } from '@/types';

const steps = [
  { id: 1, name: 'Address', icon: MapPin },
  { id: 2, name: 'Payment', icon: CreditCard },
  { id: 3, name: 'Review', icon: Package },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { cartProducts, totalAmount, clearCart, loading: cartLoading } = useCart();
  const { userData, currentUser, updateUserData } = useAuth();
  const { settings } = useSettings();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [bkashNumber, setBkashNumber] = useState('');
  const [bkashReference, setBkashReference] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState<'dhaka' | 'outside_dhaka'>('dhaka');

  // Initialize form with user data
  useEffect(() => {
    if (userData) {
      setAddress(userData.address || '');
      setPhone(userData.phone || '');
    }
  }, [userData]);

  const deliveryCharge = settings.deliveryCharges?.[deliveryLocation] || settings.deliveryCharges?.default || 60;
  const grandTotal = totalAmount + deliveryCharge;

  const handleNext = () => {
    if (currentStep === 1) {
      if (!address.trim()) {
        toast.error('Please enter your delivery address');
        return;
      }
      if (!phone.trim()) {
        toast.error('Please enter your phone number');
        return;
      }
    }

    if (currentStep === 2) {
      if (paymentMethod === 'bkash') {
        if (!bkashNumber.trim()) {
          toast.error('Please enter your bKash number');
          return;
        }
        if (!bkashReference.trim()) {
          toast.error('Please enter bKash transaction ID');
          return;
        }
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handlePlaceOrder = async () => {
    if (!currentUser || !userData) {
      toast.error('Please login to place order');
      navigate('/login');
      return;
    }

    if (cartProducts.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    setLoading(true);

    try {
      // Update user profile with new address/phone
      await updateUserData({ address, phone });

      // Create order
      const orderId = await orderService.create({
        userId: currentUser.uid,
        items: cartProducts.map((item) => ({
          productId: item.productId,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images?.[0] || '',
        })),
        totalAmount: grandTotal,
        paymentMethod,
        paymentStatus: 'pending',
        paymentReference: paymentMethod === 'bkash' ? `${bkashNumber} - ${bkashReference}` : undefined,
        deliveryAddress: address,
        deliveryCharge,
        status: 'pending',
      });

      // Clear cart
      await clearCart();

      toast.success('Order placed successfully!');
      navigate(`/orders/${orderId}`);
    } catch (error: any) {
      console.error('Order error:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Redirect if cart is empty (after loading)
  useEffect(() => {
    if (!cartLoading && cartProducts.length === 0) {
      navigate('/cart');
    }
  }, [cartLoading, cartProducts.length, navigate]);

  if (cartLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (cartProducts.length === 0) {
    return null;
  }

  return (
    <Layout showFooter={false}>
      <div className="container-main py-4 md:py-8">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </button>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div
                className={`flex items-center gap-2 ${
                  currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep > step.id
                      ? 'bg-primary text-primary-foreground'
                      : currentStep === step.id
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-secondary'
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium">{step.name}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 sm:w-24 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
              {/* Step 1: Address */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="font-display text-xl font-semibold">Delivery Address</h2>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Full Address *</Label>
                      <Textarea
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House no, Road no, Area, City"
                        className="mt-1"
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <Label>Delivery Location</Label>
                      <RadioGroup
                        value={deliveryLocation}
                        onValueChange={(v) => setDeliveryLocation(v as 'dhaka' | 'outside_dhaka')}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="dhaka" id="dhaka" />
                          <Label htmlFor="dhaka" className="font-normal">
                            Inside Dhaka (৳{settings.deliveryCharges?.dhaka || 60})
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="outside_dhaka" id="outside_dhaka" />
                          <Label htmlFor="outside_dhaka" className="font-normal">
                            Outside Dhaka (৳{settings.deliveryCharges?.outside_dhaka || 120})
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Payment */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="font-display text-xl font-semibold">Payment Method</h2>

                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                    className="space-y-4"
                  >
                    {settings.paymentMethods?.cod && (
                      <div
                        className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          paymentMethod === 'cod'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setPaymentMethod('cod')}
                      >
                        <RadioGroupItem value="cod" id="cod" className="sr-only" />
                        <div className="flex-1">
                          <Label htmlFor="cod" className="font-medium cursor-pointer">
                            Cash on Delivery
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Pay when you receive your order
                          </p>
                        </div>
                        <span className="text-2xl">💵</span>
                      </div>
                    )}

                    {settings.paymentMethods?.bkash && (
                      <div
                        className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          paymentMethod === 'bkash'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setPaymentMethod('bkash')}
                      >
                        <RadioGroupItem value="bkash" id="bkash" className="sr-only" />
                        <div className="flex-1">
                          <Label htmlFor="bkash" className="font-medium cursor-pointer">
                            bKash
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Pay via bKash mobile banking
                          </p>
                        </div>
                        <span className="text-2xl">📱</span>
                      </div>
                    )}
                  </RadioGroup>

                  {paymentMethod === 'bkash' && (
                    <div className="p-4 bg-secondary rounded-lg space-y-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <p className="text-sm font-medium mb-1">Send Payment To:</p>
                        <p className="text-lg font-bold text-primary">01XXXXXXXXX</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Amount: <span className="font-bold">৳{grandTotal.toLocaleString()}</span>
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="bkashNumber">Your bKash Number *</Label>
                        <Input
                          id="bkashNumber"
                          type="tel"
                          value={bkashNumber}
                          onChange={(e) => setBkashNumber(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="bkashRef">Transaction ID (TrxID) *</Label>
                        <Input
                          id="bkashRef"
                          value={bkashReference}
                          onChange={(e) => setBkashReference(e.target.value)}
                          placeholder="e.g., 8ABCD1234E"
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          You will receive a TrxID after successful payment
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="font-display text-xl font-semibold">Review Order</h2>

                  <div className="space-y-4">
                    <div className="p-4 bg-secondary rounded-lg">
                      <h3 className="font-medium mb-2">Delivery Address</h3>
                      <p className="text-sm text-muted-foreground">{phone}</p>
                      <p className="text-sm text-muted-foreground">{address}</p>
                    </div>

                    <div className="p-4 bg-secondary rounded-lg">
                      <h3 className="font-medium mb-2">Payment Method</h3>
                      <p className="text-sm text-muted-foreground">
                        {paymentMethod === 'cod' ? 'Cash on Delivery' : 'bKash'}
                      </p>
                      {paymentMethod === 'bkash' && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <p>bKash Number: {bkashNumber}</p>
                          <p>Transaction ID: {bkashReference}</p>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-secondary rounded-lg">
                      <h3 className="font-medium mb-3">Order Items</h3>
                      <div className="space-y-2">
                        {cartProducts.map((item) => (
                          <div key={item.productId} className="flex justify-between text-sm">
                            <span className="line-clamp-1 flex-1 mr-2">
                              {item.product.name} × {item.quantity}
                            </span>
                            <span className="font-medium">৳{(item.product.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                {currentStep > 1 ? (
                  <Button variant="outline" onClick={handleBack}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < 3 ? (
                  <Button onClick={handleNext}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button onClick={handlePlaceOrder} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-4 sm:p-6 sticky top-24">
              <h2 className="font-semibold text-lg mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {cartProducts.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                      {item.product.images?.[0] && (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ৳{item.product.price.toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>৳{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>৳{deliveryCharge}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary text-lg">৳{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
