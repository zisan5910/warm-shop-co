import React from 'react';
import { Link } from 'react-router-dom';
import { Order } from '@/types';
import { OrderStatusBadge } from './OrderStatusBadge';
import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react';

interface OrderCardProps {
  order: Order;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  return (
    <Link to={`/orders/${order.id}`} className="block">
      <div className="bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-colors">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground mb-1">
              {format(order.createdAt, 'MMM dd, yyyy • h:mm a')}
            </p>
            <p className="text-sm font-medium">Order #{order.id.slice(-8)}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Product Images */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {order.items.slice(0, 4).map((item, index) => (
            <div
              key={index}
              className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0"
            >
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                  ?
                </div>
              )}
            </div>
          ))}
          {order.items.length > 4 && (
            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-muted-foreground">
                +{order.items.length - 4}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {order.items.length} item{order.items.length > 1 ? 's' : ''}
            </p>
            <p className="font-bold text-primary">
              ৳{order.totalAmount.toLocaleString()}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </div>
      </div>
    </Link>
  );
};
