'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { SearchInput } from './SearchInput';
import { SearchResults } from './SearchResults';
import { useProductSearch } from '@/hooks/useProductSearch';
import { Product } from '@/types/product';
import { ErrorBoundaryWrapper } from '@/components/ui/error-boundary';
import { ProductDetailsModal } from '@/components/ui';

interface SearchInterfaceProps {
  className?: string;
  onProductSelect?: (product: Product) => void;
  showModal?: boolean;
}

export function SearchInterface({
  className,
  onProductSelect,
  showModal = true,
}: SearchInterfaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentOffset, setCurrentOffset] = useState(0);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const limit = 10;

  // Use React Query for search functionality
  const { data, isLoading, error } = useProductSearch(searchQuery, limit, currentOffset);

  // Reset pagination when search query changes
  useEffect(() => {
    if (searchQuery.length >= 3) {
      setCurrentOffset(0);
      setAllProducts([]);
    }
  }, [searchQuery]);

  // Accumulate products when new data arrives
  useEffect(() => {
    if (data?.products) {
      if (currentOffset === 0) {
        // New search - replace all products
        setAllProducts(data.products);
      } else {
        // Loading more - append to existing products
        setAllProducts((prev) => {
          // Avoid duplicates by filtering out products that already exist
          const existingIds = new Set(prev.map((p) => p.id));
          const newProducts = data.products.filter((p) => !existingIds.has(p.id));
          return [...prev, ...newProducts];
        });
      }
      setIsLoadingMore(false);
    }
  }, [data, currentOffset]);

  // Handle search input changes
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query.trim());
  }, []);

  // Handle loading more results
  const handleLoadMore = useCallback(() => {
    if (data?.total && allProducts.length < data.total && !isLoading && !isLoadingMore) {
      setIsLoadingMore(true);
      setCurrentOffset((prev) => prev + limit);
    }
  }, [data?.total, allProducts.length, isLoading, isLoadingMore, limit]);

  // Handle product selection
  const handleProductClick = useCallback(
    (product: Product) => {
      if (showModal) {
        setSelectedProduct(product);
        setIsModalOpen(true);
      }
      if (onProductSelect) {
        onProductSelect(product);
      }
    },
    [onProductSelect, showModal],
  );

  // Calculate if there are more results to load
  const hasMoreResults = useMemo(() => {
    return data?.total ? allProducts.length < data.total : false;
  }, [data?.total, allProducts.length]);

  return (
    <ErrorBoundaryWrapper>
      <div className={className}>
        {/* Search Input Section */}
        <div className="mb-8 flex justify-center">
          <SearchInput
            onSearch={handleSearch}
            placeholder="Search by product name or notification number..."
            className="w-full"
          />
        </div>

        {/* Search Results Section */}
        <SearchResults
          products={allProducts}
          isLoading={isLoading && currentOffset === 0}
          isLoadingMore={isLoadingMore}
          error={error?.message || null}
          query={searchQuery}
          onProductClick={handleProductClick}
          onLoadMore={handleLoadMore}
          hasMoreResults={hasMoreResults}
          totalResults={data?.total || 0}
          className="w-full"
        />
      </div>

      {/* Product Details Modal */}
      {showModal && (
        <ProductDetailsModal
          product={selectedProduct}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </ErrorBoundaryWrapper>
  );
}
