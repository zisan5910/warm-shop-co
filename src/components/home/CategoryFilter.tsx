import React from 'react';
import { Category } from '@/types';
import { motion } from 'framer-motion';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelectCategory(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
          selectedCategory === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-foreground hover:bg-secondary/80'
        }`}
      >
        All Products
      </motion.button>
      {categories.map((category) => (
        <motion.button
          key={category.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectCategory(category.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            selectedCategory === category.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-foreground hover:bg-secondary/80'
          }`}
        >
          {category.name}
        </motion.button>
      ))}
    </div>
  );
};
