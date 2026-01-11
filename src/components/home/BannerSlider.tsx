import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Banner } from '@/types';
import { Link } from 'react-router-dom';

interface BannerSliderProps {
  banners: Banner[];
}

export const BannerSlider: React.FC<BannerSliderProps> = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <div className="w-full aspect-[21/9] md:aspect-[3/1] bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl md:text-4xl font-bold mb-2">Welcome to ShopHub</h2>
          <p className="text-muted-foreground">Discover amazing products</p>
        </div>
      </div>
    );
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="relative w-full aspect-[21/9] md:aspect-[3/1] rounded-xl overflow-hidden group">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <Link to={banners[currentIndex].targetUrl || '#'}>
            <img
              src={banners[currentIndex].imageUrl}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          </Link>
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-primary w-6'
                    : 'bg-card/60 hover:bg-card'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
