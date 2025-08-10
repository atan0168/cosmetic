'use client';

import { useQuery } from '@tanstack/react-query';

interface Ingredient {
  id: number;
  name: string;
  alternativeNames: string | null;
  healthRiskDescription: string;
  regulatoryStatus: string | null;
  ewgRating: number | null;
  occurrencesCount: number | null;
  firstAppearanceDate: string | null;
  lastAppearanceDate: string | null;
  riskScore: string | null;
}

interface IngredientsResponse {
  ingredients: Ingredient[];
  total: number;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface IngredientsParams {
  query?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: string;
}

const fetchIngredients = async ({
  query = '',
  limit = 20,
  offset = 0,
  sortBy = 'name',
  sortOrder = 'asc',
}: IngredientsParams): Promise<IngredientsResponse> => {
  const searchParams = new URLSearchParams({
    query,
    limit: limit.toString(),
    offset: offset.toString(),
    sortBy,
    sortOrder,
  });

  const response = await fetch(`/api/ingredients?${searchParams}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch ingredients');
  }

  const data = await response.json();
  return 'data' in data && data.data ? data.data : data;
};

export function useIngredients({
  query = '',
  limit = 20,
  offset = 0,
  sortBy = 'name',
  sortOrder = 'asc',
}: IngredientsParams = {}) {
  return useQuery({
    queryKey: ['ingredients', query, limit, offset, sortBy, sortOrder],
    queryFn: () => fetchIngredients({ query, limit, offset, sortBy, sortOrder }),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
