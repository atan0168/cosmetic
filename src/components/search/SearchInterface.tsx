'use client';

import { useState, useCallback } from 'react';
import { SearchInput } from './SearchInput';
import { SearchResults } from './SearchResults';
import { useProductSearch } from '@/hooks/useProductSearch';
import { Product } from '@/types/product';
import { ErrorBoundaryWrapper } from '@/components/ui/error-boundary';

interface SearchInterfaceProps {
  className?: string;
  onProductSelect?: (product: Product) => void;
}

export function SearchInterface({ className, onProductSelect }: SearchInterfaceProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Use React Query for search functionality
  const { data, isLoading, error } = useProductSearch(searchQuery);

  // Handle search input changes
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query.trim());
  }, []);

  // Handle product selection
  const handleProductClick = useCallback(
    (product: Product) => {
      if (onProductSelect) {
        onProductSelect(product);
      }
    },
    [onProductSelect],
  );

  return (
    <ErrorBoundaryWrapper>
      <div className={className}>
        {/* Search Input Section */}
        <div className="mb-8">
          <SearchInput
            onSearch={handleSearch}
            placeholder="Search by product name or notification number..."
            className="w-full"
          />
        </div>

        {/* Search Results Section */}
        <SearchResults
          products={data?.products || []}
          isLoading={isLoading}
          error={error?.message || null}
          query={searchQuery}
          onProductClick={handleProductClick}
          className="w-full"
        />
      </div>
    </ErrorBoundaryWrapper>
  );
}
