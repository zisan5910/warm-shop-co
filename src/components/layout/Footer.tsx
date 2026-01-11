import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Mail, MapPin, HelpCircle, Store, Banknote, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettings } from '@/hooks/useSettings';
import { Skeleton } from '@/components/ui/skeleton';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  const { settings, loading } = useSettings();

  return (
    <footer className={cn("bg-card border-t border-border mt-12", className)}>
      <div className="container-main py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              {loading ? (
                <>
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <Skeleton className="w-20 h-6" />
                </>
              ) : (
                <>
                  {settings.appLogo ? (
                    <img 
                      src={settings.appLogo} 
                      alt={settings.appName} 
                      className="w-10 h-10 rounded-xl object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-10 h-10 rounded-xl bg-primary flex items-center justify-center ${settings.appLogo ? 'hidden' : ''}`}>
                    <Store className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="font-display font-bold text-xl">{settings.appName}</span>
                </>
              )}
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Your one-stop destination for quality products at amazing prices.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/cart" className="text-sm text-muted-foreground hover:text-primary transition-colors">Cart</Link></li>
              <li><Link to="/orders" className="text-sm text-muted-foreground hover:text-primary transition-colors">My Orders</Link></li>
              <li><Link to="/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors">Profile</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li><Link to="/support" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"><HelpCircle className="w-3 h-3" /> Help Center</Link></li>
              <li><span className="text-sm text-muted-foreground">Shipping Policy</span></li>
              <li><span className="text-sm text-muted-foreground">Return Policy</span></li>
              <li><span className="text-sm text-muted-foreground">Privacy Policy</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              {loading ? (
                <>
                  <li><Skeleton className="h-5 w-32" /></li>
                  <li><Skeleton className="h-5 w-24" /></li>
                  <li><Skeleton className="h-5 w-36" /></li>
                  <li><Skeleton className="h-5 w-28" /></li>
                </>
              ) : (
                <>
                  {settings.phone && (
                    <li>
                      <a href={`tel:${settings.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Phone className="w-4 h-4" />
                        <span>{settings.phone}</span>
                      </a>
                    </li>
                  )}
                  {settings.whatsapp && (
                    <li>
                      <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-success transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span>WhatsApp</span>
                      </a>
                    </li>
                  )}
                  {settings.email && (
                    <li>
                      <a href={`mailto:${settings.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Mail className="w-4 h-4" />
                        <span>{settings.email}</span>
                      </a>
                    </li>
                  )}
                  {settings.location && (
                    <li>
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mt-0.5" />
                        <span>{settings.location}</span>
                      </div>
                    </li>
                  )}
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {loading ? (
            <Skeleton className="h-5 w-48" />
          ) : (
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {settings.appName}. All rights reserved.
            </p>
          )}
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">We accept:</span>
            <span className="px-2 py-1 bg-secondary rounded text-xs font-medium flex items-center gap-1">
              <Banknote className="w-3 h-3" /> COD
            </span>
            <span className="px-2 py-1 bg-pink-100 text-pink-600 rounded text-xs font-medium flex items-center gap-1">
              <Smartphone className="w-3 h-3" /> bKash
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
