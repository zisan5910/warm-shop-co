import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useOrders, orderService } from '@/hooks/useOrders';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { OrderStatus, PaymentStatus } from '@/types';
import { toast } from 'sonner';

const statuses: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'canceled', 'returned', 'refunded'];
const paymentStatuses: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded'];

const paymentStatusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-warning/10 text-warning border-warning/20' },
  paid: { label: 'Paid', className: 'bg-success/10 text-success border-success/20' },
  failed: { label: 'Failed', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  refunded: { label: 'Refunded', className: 'bg-muted text-muted-foreground border-border' },
};

const AdminOrders = () => {
  const { orders, loading } = useOrders();

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try { 
      await orderService.updateStatus(orderId, status); 
      toast.success('Order status updated'); 
    } catch { 
      toast.error('Update failed'); 
    }
  };

  const handlePaymentStatusChange = async (orderId: string, paymentStatus: PaymentStatus) => {
    try { 
      await orderService.updatePaymentStatus(orderId, paymentStatus); 
      toast.success('Payment status updated'); 
    } catch { 
      toast.error('Update failed'); 
    }
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold mb-6">Orders</h1>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No orders yet
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-card rounded-xl border border-border p-4 md:p-6">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {format(order.createdAt, 'MMM dd, yyyy h:mm a')}
                  </p>
                  <p className="font-semibold text-lg">Order #{order.id.slice(-8)}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              {/* Order Items Preview */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {order.items.slice(0, 4).map((item, index) => (
                  <div key={index} className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">?</div>
                    )}
                  </div>
                ))}
                {order.items.length > 4 && (
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium">+{order.items.length - 4}</span>
                  </div>
                )}
              </div>

              {/* Info Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Delivery Address</p>
                  <p className="font-medium line-clamp-2">{order.deliveryAddress}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Payment Method</p>
                  <p className="font-medium">{order.paymentMethod.toUpperCase()}</p>
                  {order.paymentReference && (
                    <p className="text-xs text-muted-foreground">Ref: {order.paymentReference}</p>
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Items</p>
                  <p className="font-medium">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Total</p>
                  <p className="font-bold text-primary text-lg">৳{order.totalAmount.toLocaleString()}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
                {/* Order Status */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Select value={order.status} onValueChange={(v) => handleStatusChange(order.id, v as OrderStatus)}>
                    <SelectTrigger className="w-32 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map(s => (
                        <SelectItem key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Status */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Payment:</span>
                  <Select value={order.paymentStatus} onValueChange={(v) => handlePaymentStatusChange(order.id, v as PaymentStatus)}>
                    <SelectTrigger className="w-32 h-9">
                      <Badge variant="outline" className={paymentStatusConfig[order.paymentStatus]?.className}>
                        {paymentStatusConfig[order.paymentStatus]?.label}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      {paymentStatuses.map(s => (
                        <SelectItem key={s} value={s}>
                          <Badge variant="outline" className={paymentStatusConfig[s]?.className}>
                            {paymentStatusConfig[s]?.label}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
