'use client';

import { useQuery } from '@tanstack/react-query';

interface Company {
  id: number;
  name: string;
  totalNotifs: number | null;
  firstNotifiedDate: string | null;
  cancelledCount: number | null;
  reputationScore: string | null;
}

interface CompaniesResponse {
  companies: Company[];
  total: number;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface CompaniesParams {
  query?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: string;
}

const fetchCompanies = async ({
  query = '',
  limit = 20,
  offset = 0,
  sortBy = 'name',
  sortOrder = 'asc',
}: CompaniesParams): Promise<CompaniesResponse> => {
  const searchParams = new URLSearchParams({
    query,
    limit: limit.toString(),
    offset: offset.toString(),
    sortBy,
    sortOrder,
  });

  const response = await fetch(`/api/companies?${searchParams}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch companies');
  }

  const data = await response.json();
  return 'data' in data && data.data ? data.data : data;
};

export function useCompanies({
  query = '',
  limit = 20,
  offset = 0,
  sortBy = 'name',
  sortOrder = 'asc',
}: CompaniesParams = {}) {
  return useQuery({
    queryKey: ['companies', query, limit, offset, sortBy, sortOrder],
    queryFn: () => fetchCompanies({ query, limit, offset, sortBy, sortOrder }),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
