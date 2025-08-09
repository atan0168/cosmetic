'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchInput, SearchResults } from '@/components/search';
import { Product, SearchResponse } from '@/types';

// API function to search products
async function searchProducts(query: string): Promise<SearchResponse> {
  if (!query.trim()) {
    return { products: [], total: 0 } as SearchResponse;
  }

  const response = await fetch(`/api/products/search?query=${encodeURIComponent(query)}&limit=10`);

  if (!response.ok) {
    type ErrorPayload = { error?: string };
    const errorData: ErrorPayload = await response.json().catch(() => ({}) as ErrorPayload);
    throw new Error(errorData.error || 'Search failed');
  }

  const data = (await response.json()) as { data?: SearchResponse } | SearchResponse;
  return 'data' in data && data.data ? data.data : (data as SearchResponse); // Handle both wrapped and direct responses
}

export default function SearchDemo() {
  const [searchQuery, setSearchQuery] = useState('');

  // React Query hook for search
  const {
    data: searchResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['products', 'search', searchQuery],
    queryFn: () => searchProducts(searchQuery),
    enabled: searchQuery.length >= 3, // Only search when query is long enough
    refetchOnWindowFocus: false,
    refetchInterval: false,
    retry: 2,
  });

  const handleProductClick = (product: Product) => {
    console.log('Product clicked:', product);
    // Here you could navigate to a product detail page or open a modal
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">Product Safety Search</h1>
        <p className="text-muted-foreground">
          Search for cosmetic products to check their safety status and find alternatives.
        </p>
      </div>

      <div className="space-y-6">
        {/* Search Input */}
        <SearchInput
          onSearch={setSearchQuery}
          placeholder="Search by product name or notification number..."
          className="w-full"
        />

        {/* Search Results */}
        <SearchResults
          products={searchResponse?.products || []}
          isLoading={isLoading}
          error={error?.message || null}
          query={searchQuery}
          onProductClick={handleProductClick}
          className="mt-6"
        />

        {/* Alternatives Section (if available) */}
        {searchResponse?.alternatives && searchResponse.alternatives.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-xl font-semibold">Safer Alternatives</h2>
            <SearchResults
              products={searchResponse.alternatives}
              isLoading={false}
              error={null}
              query=""
              onProductClick={handleProductClick}
              className="border-t pt-6"
            />
          </div>
        )}
      </div>
    </div>
  );
}
