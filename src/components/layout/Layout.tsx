import React, { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
  showFooter?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, showBottomNav = true, showFooter = true }) => {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className={`flex-1 ${showBottomNav ? 'pb-20 md:pb-0' : ''}`}>
        {children}
      </main>
      {/* Footer - hidden on mobile */}
      {showFooter && <Footer className="hidden md:block" />}
      {showBottomNav && <BottomNav />}
    </div>
  );
};