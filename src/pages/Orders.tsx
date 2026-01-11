import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { OrderCard } from '@/components/order/OrderCard';
import { OrderCardSkeleton } from '@/components/ui/loading-skeletons';
import { useOrders } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Package, ShoppingBag } from 'lucide-react';

const Orders = () => {
  const { orders, loading, error } = useOrders();

  return (
    <Layout>
      <div className="container-main py-4 md:py-8 max-w-3xl mx-auto">
        <h1 className="font-display text-xl md:text-2xl font-bold mb-4 md:mb-6">My Orders</h1>

        {error ? (
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="font-semibold mb-1">Couldn’t load orders</p>
            <p className="text-sm text-muted-foreground break-words">{error}</p>
            <p className="text-xs text-muted-foreground mt-3">
              If this happens after adding the “orders by userId + createdAt” index in Firebase, refresh the page.
            </p>
          </div>
        ) : loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-full bg-secondary flex items-center justify-center">
              <Package className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
            </div>
            <h2 className="font-semibold text-lg mb-2">No orders yet</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Start shopping to see your orders here
            </p>
            <Button asChild>
              <Link to="/">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Start Shopping
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;