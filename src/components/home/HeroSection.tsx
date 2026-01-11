import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroBanner from '@/assets/hero-banner.jpg';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden rounded-2xl mb-8">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBanner}
          alt="Premium Shopping"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 py-12 md:py-20 px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg"
        >
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
            ✨ New Collection 2026
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Discover Premium
            <span className="text-gradient block">Quality Products</span>
          </h1>
          <p className="text-muted-foreground mb-6 md:text-lg">
            Shop the latest trends with fast delivery across Bangladesh. 
            Quality guaranteed, returns made easy.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link to="/">
                Shop Now <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/register">Create Account</Link>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Features Bar */}
      <div className="relative z-10 bg-card/80 backdrop-blur-sm border-t border-border">
        <div className="grid grid-cols-3 divide-x divide-border">
          <div className="flex items-center justify-center gap-2 py-4 px-2">
            <Truck className="w-5 h-5 text-primary hidden sm:block" />
            <span className="text-xs sm:text-sm font-medium text-center">Fast Delivery</span>
          </div>
          <div className="flex items-center justify-center gap-2 py-4 px-2">
            <Shield className="w-5 h-5 text-primary hidden sm:block" />
            <span className="text-xs sm:text-sm font-medium text-center">Secure Payment</span>
          </div>
          <div className="flex items-center justify-center gap-2 py-4 px-2">
            <RefreshCw className="w-5 h-5 text-primary hidden sm:block" />
            <span className="text-xs sm:text-sm font-medium text-center">Easy Returns</span>
          </div>
        </div>
      </div>
    </section>
  );
};
