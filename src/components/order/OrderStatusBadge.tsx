import React from 'react';
import { OrderStatus } from '@/types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-warning/10 text-warning' },
  confirmed: { label: 'Confirmed', className: 'bg-info/10 text-info' },
  shipped: { label: 'Shipped', className: 'bg-primary/10 text-primary' },
  delivered: { label: 'Delivered', className: 'bg-success/10 text-success' },
  canceled: { label: 'Canceled', className: 'bg-destructive/10 text-destructive' },
  returned: { label: 'Returned', className: 'bg-muted text-muted-foreground' },
  refunded: { label: 'Refunded', className: 'bg-muted text-muted-foreground' },
};

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};
