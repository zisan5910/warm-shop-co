import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { useUsers } from '@/hooks/useUsers';
import { Package, ShoppingCart, Users, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';

const AdminDashboard = () => {
  const { products } = useProducts();
  const { orders } = useOrders();
  const { users } = useUsers();

  // Only count revenue from orders where payment is confirmed (paid)
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
  const revenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  
  const pendingPayments = orders.filter(o => o.paymentStatus === 'pending').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  const stats = [
    { label: 'Total Products', value: products.length, icon: Package, color: 'text-primary' },
    { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'text-info' },
    { label: 'Total Users', value: users.length, icon: Users, color: 'text-success' },
    { label: 'Revenue (Paid)', value: `৳${revenue.toLocaleString()}`, icon: DollarSign, color: 'text-primary', highlight: true },
  ];

  const secondaryStats = [
    { label: 'Pending Orders', value: pendingOrders, icon: Clock, color: 'text-warning' },
    { label: 'Pending Payments', value: pendingPayments, icon: TrendingUp, color: 'text-destructive' },
  ];

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Main Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className={`stats-card ${stat.highlight ? 'border-2 border-primary/20' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className={`text-2xl font-bold ${stat.highlight ? 'text-primary' : ''}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {secondaryStats.map((stat) => (
          <div key={stat.label} className="stats-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-4">Recent Orders</h2>
          {orders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">Order #{order.id.slice(-8)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <OrderStatusBadge status={order.status} />
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        order.paymentStatus === 'paid' 
                          ? 'bg-success/10 text-success' 
                          : 'bg-warning/10 text-warning'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold text-primary">৳{order.totalAmount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-4">Low Stock Products</h2>
          {products.filter(p => p.stock < 10).length === 0 ? (
            <p className="text-muted-foreground text-sm">All products are well stocked</p>
          ) : (
            <div className="space-y-3">
              {products.filter(p => p.stock < 10).slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                      {product.images?.[0] && (
                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                  </div>
                  <span className={`text-sm font-medium ${product.stock === 0 ? 'text-destructive' : 'text-warning'}`}>
                    {product.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
