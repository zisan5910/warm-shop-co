import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="card-product">
      <Skeleton className="aspect-square" />
      <div className="p-3 sm:p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
};

export const OrderCardSkeleton: React.FC = () => {
  return (
    <div className="order-card">
      <div className="flex items-center justify-between mb-3">
        <div className="space-y-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex gap-2 mb-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="w-12 h-12 rounded-lg" />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-5 w-5" />
      </div>
    </div>
  );
};

export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="grid md:grid-cols-2 gap-6 md:gap-12">
      <div className="space-y-4">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="w-16 h-16 rounded-lg" />
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-8 w-3/4" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 4 }) => {
  return (
    <tr className="border-t border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
};
