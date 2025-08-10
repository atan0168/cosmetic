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

interface Product {
  id: number;
  notifNo: string;
  name: string;
  category: string;
  dateNotified: string;
  status: string;
  reasonForCancellation: string | null;
}

interface CompanyDetailsResponse {
  company: Company;
  recentProducts: Product[];
}

const fetchCompanyDetails = async (companyId: string): Promise<CompanyDetailsResponse> => {
  const response = await fetch(`/api/companies/${companyId}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch company details');
  }

  const data = await response.json();
  return 'data' in data && data.data ? data.data : data;
};

export function useCompanyDetails(companyId: string | undefined) {
  return useQuery({
    queryKey: ['company', companyId],
    queryFn: () => fetchCompanyDetails(companyId!),
    enabled: !!companyId,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
