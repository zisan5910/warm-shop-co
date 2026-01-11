import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { useOrder } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, MapPin, CreditCard, Phone, MessageCircle, Mail } from 'lucide-react';
import { format } from 'date-fns';

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { order, loading, error } = useOrder(id || '');

  if (loading) {
    return (
      <Layout>
        <div className="container-main py-4 md:py-8 max-w-3xl mx-auto">
          <Skeleton className="h-6 w-32 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="container-main py-12 text-center">
          <h1 className="text-xl font-bold mb-4">Order not found</h1>
          <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-main py-4 md:py-8 max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </button>

        <div className="space-y-4">
          {/* Header */}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-xs text-muted-foreground">
                  {format(order.createdAt, 'MMM dd, yyyy • h:mm a')}
                </p>
                <h1 className="font-display text-lg md:text-xl font-bold">
                  Order #{order.id.slice(-8)}
                </h1>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            {/* Order Timeline */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {['pending', 'confirmed', 'shipped', 'delivered'].map((status, index) => {
                const statusIndex = ['pending', 'confirmed', 'shipped', 'delivered'].indexOf(order.status);
                const isCompleted = index <= statusIndex;
                const isCurrent = status === order.status;

                return (
                  <React.Fragment key={status}>
                    <div
                      className={`flex-shrink-0 px-2 py-1 rounded-full text-[10px] font-medium ${
                        isCurrent
                          ? 'bg-primary text-primary-foreground'
                          : isCompleted
                          ? 'bg-success/10 text-success'
                          : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </div>
                    {index < 3 && (
                      <div
                        className={`w-4 h-0.5 flex-shrink-0 ${
                          index < statusIndex ? 'bg-success' : 'bg-border'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h2 className="font-semibold mb-3">Order Items</h2>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      ৳{item.price.toLocaleString()} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-sm">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h2 className="font-semibold mb-3">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>৳{(order.totalAmount - order.deliveryCharge).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>৳{order.deliveryCharge}</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-primary">৳{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h2 className="font-semibold mb-3">Delivery Address</h2>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h2 className="font-semibold mb-3">Payment</h2>
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'bKash'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Status:{' '}
                  <span
                    className={
                      order.paymentStatus === 'paid'
                        ? 'text-success'
                        : order.paymentStatus === 'failed'
                        ? 'text-destructive'
                        : 'text-warning'
                    }
                  >
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Need Help */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h2 className="font-semibold mb-3">Need Help?</h2>
            <div className="grid grid-cols-3 gap-2">
              <a
                href="tel:+8801XXXXXXXXX"
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-xs">Call</span>
              </a>
              <a
                href="https://wa.me/8801XXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-success/10 hover:bg-success/20 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-success" />
                <span className="text-xs">WhatsApp</span>
              </a>
              <a
                href="mailto:support@shophub.com"
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-xs">Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderDetail;