import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, Package, User, Menu, Search, HelpCircle, Store } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useSettings } from '@/hooks/useSettings';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export const Navbar: React.FC = () => {
  const { currentUser, userData, logout } = useAuth();
  const { totalItems } = useCart();
  const { settings, loading: settingsLoading } = useSettings();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-soft">
      <div className="container-main">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo - Mobile shows app name */}
          <Link to="/" className="flex items-center gap-2">
            {settingsLoading ? (
              <>
                <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-xl" />
                <Skeleton className="w-16 md:w-20 h-5 md:h-6" />
              </>
            ) : (
              <>
                {settings.appLogo ? (
                  <img 
                    src={settings.appLogo} 
                    alt={settings.appName} 
                    className="w-8 h-8 md:w-10 md:h-10 rounded-xl object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary flex items-center justify-center ${settings.appLogo ? 'hidden' : ''}`}>
                  <Store className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-lg md:text-xl text-foreground">{settings.appName}</span>
              </>
            )}
          </Link>

          {/* Search - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-0"
              />
            </div>
          </form>

          {/* Mobile: Cart Icon + Menu */}
          <div className="flex items-center gap-2 md:hidden">
            {currentUser && (
              <Link to="/cart" className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>
            )}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-6 mt-6">
                  <form onSubmit={(e) => { handleSearch(e); setIsMenuOpen(false); }}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </form>
                  
                  {currentUser ? (
                    <>
                      <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{userData?.name}</p>
                          <p className="text-sm text-muted-foreground">{userData?.email}</p>
                        </div>
                      </div>
                      <nav className="flex flex-col gap-2">
                        <Link
                          to="/profile"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
                        >
                          <User className="w-5 h-5" />
                          <span>Profile</span>
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
                        >
                          <Package className="w-5 h-5" />
                          <span>My Orders</span>
                        </Link>
                        <Link
                          to="/support"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
                        >
                          <HelpCircle className="w-5 h-5" />
                          <span>Help & Support</span>
                        </Link>
                      </nav>
                      <Button variant="outline" onClick={() => { handleLogout(); setIsMenuOpen(false); }}>
                        Logout
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button asChild>
                        <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to="/register" onClick={() => setIsMenuOpen(false)}>Register</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-4">
            {currentUser ? (
              <>
                <Link to="/cart" className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
                <Link to="/orders" className="p-2 rounded-lg hover:bg-secondary transition-colors">
                  <Package className="w-5 h-5" />
                </Link>
                <div className="h-6 w-px bg-border" />
                <div className="flex items-center gap-3">
                  <Link to="/profile" className="flex items-center gap-2 hover:text-primary transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{userData?.name || 'Profile'}</span>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
