'use client';

import { useQuery } from '@tanstack/react-query';
import { Product, ProductStatus } from '@/types/product';

interface SearchResponse {
  products: Product[];
  total: number;
  alternatives?: Product[];
}

interface SearchError {
  error: string;
  message: string;
}

interface SearchParams {
  query: string;
  limit?: number;
  offset?: number;
  status?: ProductStatus;
}

const searchProducts = async ({
  query,
  limit = 10,
  offset = 0,
  status,
}: SearchParams): Promise<SearchResponse> => {
  if (!query || query.length < 3) {
    return { products: [], total: 0 };
  }

  const searchParams = new URLSearchParams({
    query,
    limit: limit.toString(),
    offset: offset.toString(),
  });

  if (status) {
    searchParams.append('status', status);
  }

  const response = await fetch(`/api/products/search?${searchParams}`);

  if (!response.ok) {
    const errorData: SearchError = await response.json();
    throw new Error(errorData.message || 'Search failed');
  }

  const data = await response.json();

  return 'data' in data && data.data ? data.data : data;
};

export function useProductSearch(
  query: string,
  limit: number = 10,
  offset: number = 0,
  status?: ProductStatus,
) {
  return useQuery({
    queryKey: ['products', 'search', query, limit, offset, status],
    queryFn: () => searchProducts({ query, limit, offset, status }),
    enabled: query.length >= 3,
    refetchOnWindowFocus: false,
    refetchInterval: false,
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
