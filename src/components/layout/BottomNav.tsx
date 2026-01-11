import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Package, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: ShoppingCart, label: 'Cart', path: '/cart', protected: true },
  { icon: Package, label: 'Orders', path: '/orders', protected: true },
  { icon: User, label: 'Profile', path: '/profile', protected: true },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around h-16 px-2 pb-safe">
        {navItems.map((item) => {
          // If protected and not logged in, redirect to login
          const targetPath = item.protected && !currentUser ? '/login' : item.path;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={targetPath}
              className={`flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[60px] transition-colors relative ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};