import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { BannerSlider } from '@/components/home/BannerSlider';
import { CategoryFilter } from '@/components/home/CategoryFilter';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/loading-skeletons';
import { useBanners } from '@/hooks/useBanners';
import { useProducts, useCategories } from '@/hooks/useProducts';

const Index = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { banners, loading: bannersLoading } = useBanners(true);
  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.categoryId === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

  const loading = productsLoading || categoriesLoading;

  return (
    <Layout>
      <div className="container-main py-4 md:py-6">
        {/* Hero Section - show when no search */}
        {!searchQuery && (
          bannersLoading ? (
            <section className="mb-6 md:mb-8">
              <div className="aspect-[21/9] md:aspect-[3/1] rounded-xl bg-secondary animate-pulse" />
            </section>
          ) : banners.length > 0 ? (
            <section className="mb-6 md:mb-8">
              <BannerSlider banners={banners} />
            </section>
          ) : (
            <HeroSection />
          )
        )}

        {/* Categories */}
        {categoriesLoading ? (
          <section className="mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-9 w-24 rounded-full bg-secondary animate-pulse flex-shrink-0" />
              ))}
            </div>
          </section>
        ) : categories.length > 0 && (
          <section className="mb-6">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </section>
        )}

        {/* Search Results Header */}
        {searchQuery && (
          <div className="mb-4">
            <h2 className="font-display text-xl font-semibold">
              Search results for "{searchQuery}"
            </h2>
            <p className="text-muted-foreground text-sm">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </p>
          </div>
        )}

        {/* Products Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl md:text-2xl font-semibold">
              {selectedCategory
                ? categories.find((c) => c.id === selectedCategory)?.name || 'Products'
                : searchQuery ? 'Results' : 'Featured Products'}
            </h2>
            {!loading && products.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {filteredProducts.length} items
              </span>
            )}
          </div>

          {loading ? (
            <div className="product-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No products found</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Products will appear here once added by the admin'}
              </p>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Index;