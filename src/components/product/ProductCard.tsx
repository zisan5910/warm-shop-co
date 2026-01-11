import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { currentUser } = useAuth();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (product.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }

    await addToCart(product.id, 1);
    toast.success('Added to cart!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card-product group flex flex-col h-full"
    >
      <Link to={`/product/${product.id}`} className="flex flex-col h-full">
        {/* Image - Fixed aspect ratio */}
        <div className="relative aspect-square overflow-hidden bg-secondary flex-shrink-0">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-muted-foreground text-sm">No image</span>
            </div>
          )}
          
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="text-sm font-medium text-destructive">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Content - Fixed structure */}
        <div className="p-3 flex flex-col flex-1">
          {/* Product Name - Fixed 2 lines */}
          <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem] mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          {/* Price and Button Row - Always at bottom */}
          <div className="mt-auto flex items-center justify-between gap-2">
            <span className="text-base sm:text-lg font-bold text-primary">
              ৳{product.price.toLocaleString()}
            </span>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="h-8 px-3 text-xs flex-shrink-0"
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
