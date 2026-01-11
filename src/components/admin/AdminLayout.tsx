import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Package, ShoppingCart, Users, Image, Settings, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Image, label: 'Banners', path: '/admin/banners' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, userData } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/admin/login'); };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">S</span>
              </div>
              <span className="font-display font-bold">Admin</span>
            </Link>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></Button>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location.pathname === item.path ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>
                <item.icon className="w-5 h-5" /><span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><span className="font-medium text-primary">{userData?.name?.charAt(0)}</span></div>
              <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{userData?.name}</p><p className="text-xs text-muted-foreground">Admin</p></div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" />Logout</Button>
          </div>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}
      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        <header className="sticky top-0 z-30 bg-card border-b border-border h-16 flex items-center px-4 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></Button>
          <span className="ml-4 font-semibold">Admin Panel</span>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};
