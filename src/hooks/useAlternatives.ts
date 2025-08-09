'use client';

import { useQuery } from '@tanstack/react-query';
import { Product } from '@/types/product';

interface AlternativesResponse {
  alternatives: Product[];
  total: number;
  message?: string;
}

interface UseAlternativesOptions {
  excludeId?: number;
  limit?: number;
  enabled?: boolean;
}

async function fetchAlternatives(excludeId?: number, limit: number = 3): Promise<AlternativesResponse> {
  const params = new URLSearchParams();
  
  if (excludeId) {
    params.append('excludeId', excludeId.toString());
  }
  params.append('limit', limit.toString());

  const response = await fetch(`/api/products/alternatives?${params.toString()}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch alternatives');
  }

  return response.json();
}

export function useAlternatives({ excludeId, limit = 3, enabled = true }: UseAlternativesOptions = {}) {
  return useQuery({
    queryKey: ['alternatives', excludeId, limit],
    queryFn: () => fetchAlternatives(excludeId, limit),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}