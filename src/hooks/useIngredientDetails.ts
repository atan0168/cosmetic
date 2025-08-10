'use client';

import { useQuery } from '@tanstack/react-query';

interface Ingredient {
  id: number;
  name: string;
  alternativeNames: string | null;
  healthRiskDescription: string;
  regulatoryStatus: string | null;
  sourceUrl: string | null;
  ewgRating: number | null;
  pubchemCid: string | null;
  pubchemUrl: string | null;
  occurrencesCount: number | null;
  firstAppearanceDate: string | null;
  lastAppearanceDate: string | null;
  riskScore: string | null;
}

interface Product {
  id: number;
  notifNo: string;
  name: string;
  category: string;
  dateNotified: string;
  status: string;
  reasonForCancellation: string | null;
}

interface IngredientDetailsResponse {
  ingredient: Ingredient;
  affectedProducts: Product[];
}

const fetchIngredientDetails = async (ingredientId: string): Promise<IngredientDetailsResponse> => {
  const response = await fetch(`/api/ingredients/${ingredientId}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch ingredient details');
  }

  const data = await response.json();
  return 'data' in data && data.data ? data.data : data;
};

export function useIngredientDetails(ingredientId: string | undefined) {
  return useQuery({
    queryKey: ['ingredient', ingredientId],
    queryFn: () => fetchIngredientDetails(ingredientId!),
    enabled: !!ingredientId,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
