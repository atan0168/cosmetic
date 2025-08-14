'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { SearchInput } from './SearchInput';
import { SearchResults } from './SearchResults';
import { StatusFilter } from './StatusFilter';
import { useProductSearch } from '@/hooks/useProductSearch';
import { Product, ProductStatus } from '@/types/product';
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
  const [statusFilter, setStatusFilter] = useState<ProductStatus | undefined>(undefined);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<Product[]>([]);

  const limit = 10;

  // Use React Query for search functionality
  const { data, isLoading, error } = useProductSearch(
    searchQuery,
    limit,
    currentOffset,
    statusFilter,
  );

  // Reset state when search query or status filter changes
  useEffect(() => {
    setCurrentOffset(0);
    setAllProducts([]);
  }, [searchQuery, statusFilter]);

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

  // Handle status filter changes
  const handleStatusFilterChange = useCallback((status?: ProductStatus) => {
    setStatusFilter(status);
  }, []);

  // Handle loading more results
  const handleLoadMore = useCallback(() => {
    if (data?.total && allProducts.length < data.total && !isLoading && !isLoadingMore) {
      setIsLoadingMore(true);
      setCurrentOffset((prev) => prev + limit);
    }
  }, [data?.total, allProducts.length, isLoading, isLoadingMore, limit]);

  // Handle product selection (from search results - clears navigation history)
  const handleProductClick = useCallback(
    (product: Product) => {
      if (showModal) {
        setSelectedProduct(product);
        setIsModalOpen(true);
        setNavigationHistory([]); // Clear history for new product selection
      }
      if (onProductSelect) {
        onProductSelect(product);
      }
    },
    [onProductSelect, showModal],
  );

  // Handle alternative product selection (adds to navigation history)
  const handleAlternativeClick = useCallback(
    (alternativeProduct: Product) => {
      if (showModal && selectedProduct) {
        setNavigationHistory((prev) => [...prev, selectedProduct]);
        setSelectedProduct(alternativeProduct);
      }
      if (onProductSelect) {
        onProductSelect(alternativeProduct);
      }
    },
    [onProductSelect, showModal, selectedProduct],
  );

  // Handle navigation back to previous product
  const handleNavigateBack = useCallback(() => {
    if (navigationHistory.length > 0) {
      const previousProduct = navigationHistory[navigationHistory.length - 1];
      const newHistory = navigationHistory.slice(0, -1);

      setSelectedProduct(previousProduct);
      setNavigationHistory(newHistory);
    }
  }, [navigationHistory]);

  // Handle modal close - clear navigation history
  const handleModalOpenChange = useCallback((open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setNavigationHistory([]);
    }
  }, []);

  // Calculate if there are more results to load
  const hasMoreResults = useMemo(() => {
    return data?.total ? allProducts.length < data.total : false;
  }, [data?.total, allProducts.length]);

  return (
    <ErrorBoundaryWrapper>
      <div className={className}>
        {/* Search Input Section */}
        <div className="mb-8 space-y-4">
          <div className="flex justify-center">
            <SearchInput
              onSearch={handleSearch}
              placeholder="Search by product name or notification number..."
              className="w-full"
              onClear={() => {
                setSearchQuery('');
                setAllProducts([]);
                setCurrentOffset(0);
                setStatusFilter(undefined);
              }}
            />
          </div>

          {/* Status Filter Section */}
          {allProducts.length > 0 ? (
            <div className="flex justify-center">
              <StatusFilter
                value={statusFilter}
                onValueChange={handleStatusFilterChange}
                className="flex w-full max-w-2xl justify-between"
              />
            </div>
          ) : null}
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
          className="mx-auto w-full max-w-2xl"
        />
      </div>

      {/* Product Details Modal */}
      {showModal && (
        <ProductDetailsModal
          product={selectedProduct}
          open={isModalOpen}
          onOpenChange={handleModalOpenChange}
          onAlternativeClick={handleAlternativeClick}
          navigationHistory={navigationHistory}
          onNavigateBack={handleNavigateBack}
        />
      )}
    </ErrorBoundaryWrapper>
  );
}
