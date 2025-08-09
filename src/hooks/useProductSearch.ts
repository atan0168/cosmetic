'use client';

import { useQuery } from '@tanstack/react-query';
import { Product } from '@/types/product';

interface SearchResponse {
  products: Product[];
  total: number;
  alternatives?: Product[];
}

interface SearchError {
  error: string;
  message: string;
}

const searchProducts = async (query: string): Promise<SearchResponse> => {
  if (!query || query.length < 3) {
    return { products: [], total: 0 };
  }

  const searchParams = new URLSearchParams({
    query,
    limit: '10',
    offset: '0',
  });

  const response = await fetch(`/api/products/search?${searchParams}`);

  if (!response.ok) {
    const errorData: SearchError = await response.json();
    throw new Error(errorData.message || 'Search failed');
  }

  return response.json();
};

export function useProductSearch(query: string) {
  return useQuery({
    queryKey: ['products', 'search', query],
    queryFn: () => searchProducts(query),
    enabled: query.length >= 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry validation errors
      if (error.message.includes('Invalid') || error.message.includes('validation')) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
