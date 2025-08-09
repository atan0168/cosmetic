import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AlternativesSection } from '../alternatives-section';
import { useAlternatives } from '@/hooks/useAlternatives';
import { Product, ProductStatus, RiskLevel } from '@/types/product';

// Mock the useAlternatives hook
vi.mock('@/hooks/useAlternatives', () => ({
  useAlternatives: vi.fn(),
}));

const mockUseAlternatives = vi.mocked(useAlternatives);

// Mock product data
const mockCancelledProduct: Product = {
  id: 1,
  name: 'Cancelled Lipstick',
  notifNo: 'CPNP-123456',
  category: 'Lip Products',
  status: ProductStatus.CANCELLED,
  riskLevel: RiskLevel.UNSAFE,
  dateNotified: '2023-01-01',
  isVerticallyIntegrated: false,
  recencyScore: 0.8,
  applicantCompany: {
    id: 1,
    name: 'Test Company',
  },
};

const mockSafeProduct: Product = {
  id: 2,
  name: 'Safe Lipstick',
  notifNo: 'CPNP-789012',
  category: 'Lip Products',
  status: ProductStatus.NOTIFIED,
  riskLevel: RiskLevel.SAFE,
  dateNotified: '2023-01-01',
  isVerticallyIntegrated: false,
  recencyScore: 0.9,
  applicantCompany: {
    id: 2,
    name: 'Safe Company',
  },
};

// Test wrapper with React Query
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('AlternativesSection Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Error States', () => {
    it('displays error message when alternatives fail to load', () => {
      mockUseAlternatives.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch alternatives'),
        refetch: vi.fn(),
        isRefetching: false,
      } as unknown as ReturnType<typeof useAlternatives>);

      render(
        <TestWrapper>
          <AlternativesSection currentProduct={mockCancelledProduct} />
        </TestWrapper>,
      );

      expect(screen.getByText('Alternatives Unavailable')).toBeInTheDocument();
      expect(screen.getByText(/couldn't load safer alternatives/i)).toBeInTheDocument();
    });

    it('provides retry functionality when alternatives fail to load', async () => {
      const mockRefetch = vi.fn();
      mockUseAlternatives.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
        refetch: mockRefetch,
        isRefetching: false,
      } as unknown as ReturnType<typeof useAlternatives>);

      render(
        <TestWrapper>
          <AlternativesSection currentProduct={mockCancelledProduct} />
        </TestWrapper>,
      );

      const retryButton = screen.getByRole('button', { name: /retry alternatives/i });
      fireEvent.click(retryButton);

      expect(mockRefetch).toHaveBeenCalled();
    });

    it('shows loading state during retry', () => {
      mockUseAlternatives.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
        refetch: vi.fn(),
        isRefetching: true,
      } as unknown as ReturnType<typeof useAlternatives>);

      render(
        <TestWrapper>
          <AlternativesSection currentProduct={mockCancelledProduct} />
        </TestWrapper>,
      );

      expect(screen.getByText('Retrying...')).toBeInTheDocument();
    });

    it('handles network errors gracefully', () => {
      mockUseAlternatives.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('fetch failed'),
        refetch: vi.fn(),
        isRefetching: false,
      } as unknown as ReturnType<typeof useAlternatives>);

      render(
        <TestWrapper>
          <AlternativesSection currentProduct={mockCancelledProduct} />
        </TestWrapper>,
      );

      expect(screen.getByText('Alternatives Unavailable')).toBeInTheDocument();
    });

    it('handles database errors gracefully', () => {
      mockUseAlternatives.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('database connection failed'),
        refetch: vi.fn(),
        isRefetching: false,
      } as unknown as ReturnType<typeof useAlternatives>);

      render(
        <TestWrapper>
          <AlternativesSection currentProduct={mockCancelledProduct} />
        </TestWrapper>,
      );

      expect(screen.getByText('Alternatives Unavailable')).toBeInTheDocument();
    });

    it('handles timeout errors gracefully', () => {
      mockUseAlternatives.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('request timeout'),
        refetch: vi.fn(),
        isRefetching: false,
      } as unknown as ReturnType<typeof useAlternatives>);

      render(
        <TestWrapper>
          <AlternativesSection currentProduct={mockCancelledProduct} />
        </TestWrapper>,
      );

      expect(screen.getByText('Alternatives Unavailable')).toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    it('recovers from error state when retry succeeds', () => {
      // Start with error state
      mockUseAlternatives.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
        refetch: vi.fn(),
        isRefetching: false,
      } as unknown as ReturnType<typeof useAlternatives>);

      const { rerender } = render(
        <TestWrapper>
          <AlternativesSection currentProduct={mockCancelledProduct} />
        </TestWrapper>,
      );

      expect(screen.getByText('Alternatives Unavailable')).toBeInTheDocument();

      // Simulate successful retry
      mockUseAlternatives.mockReturnValue({
        data: { alternatives: [mockSafeProduct], total: 1 },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      } as unknown as ReturnType<typeof useAlternatives>);

      rerender(
        <TestWrapper>
          <AlternativesSection currentProduct={mockCancelledProduct} />
        </TestWrapper>,
      );

      expect(screen.queryByText('Alternatives Unavailable')).not.toBeInTheDocument();
      expect(screen.getByText('Safe Lipstick')).toBeInTheDocument();
    });

    it('maintains section visibility during error recovery', () => {
      mockUseAlternatives.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
        refetch: vi.fn(),
        isRefetching: false,
      } as unknown as ReturnType<typeof useAlternatives>);

      render(
        <TestWrapper>
          <AlternativesSection currentProduct={mockCancelledProduct} />
        </TestWrapper>,
      );

      expect(screen.getByText('Safer Alternatives')).toBeInTheDocument();
      expect(screen.getByText('Alternatives Unavailable')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows loading state while fetching alternatives', () => {
      mockUseAlternatives.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      } as unknown as ReturnType<typeof useAlternatives>);

      render(
        <TestWrapper>
          <AlternativesSection currentProduct={mockCancelledProduct} />
        </TestWrapper>,
      );

      expect(screen.getByLabelText('Loading alternatives')).toBeInTheDocument();
      expect(screen.getByText('Finding safer alternatives...')).toBeInTheDocument();
    });

    it('does not show error message during loading', () => {
      mockUseAlternatives.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      } as unknown as ReturnType<typeof useAlternatives>);

      render(
        <TestWrapper>
          <AlternativesSection currentProduct={mockCancelledProduct} />
        </TestWrapper>,
      );

      expect(screen.queryByText('Alternatives Unavailable')).not.toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('shows appropriate message when no alternatives are found', () => {
      mockUseAlternatives.mockReturnValue({
        data: { alternatives: [], total: 0 },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      } as unknown as ReturnType<typeof useAlternatives>);

      render(
        <TestWrapper>
          <AlternativesSection currentProduct={mockCancelledProduct} />
        </TestWrapper>,
      );

      expect(screen.getByText('No safer alternatives found.')).toBeInTheDocument();
      expect(screen.getByText(/couldn't find similar approved products/i)).toBeInTheDocument();
    });

    it('does not show error message when no alternatives are found', () => {
      mockUseAlternatives.mockReturnValue({
        data: { alternatives: [], total: 0 },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      } as unknown as ReturnType<typeof useAlternatives>);

      render(
        <TestWrapper>
          <AlternativesSection currentProduct={mockCancelledProduct} />
        </TestWrapper>,
      );

      expect(screen.queryByText('Alternatives Unavailable')).not.toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('does not render for safe products', () => {
      mockUseAlternatives.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      } as unknown as ReturnType<typeof useAlternatives>);

      render(
        <TestWrapper>
          <AlternativesSection currentProduct={mockSafeProduct} />
        </TestWrapper>,
      );

      expect(screen.queryByText('Safer Alternatives')).not.toBeInTheDocument();
    });

    it('renders for cancelled products even with errors', () => {
      mockUseAlternatives.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
        refetch: vi.fn(),
        isRefetching: false,
      } as unknown as ReturnType<typeof useAlternatives>);

      render(
        <TestWrapper>
          <AlternativesSection currentProduct={mockCancelledProduct} />
        </TestWrapper>,
      );

      expect(screen.getByText('Safer Alternatives')).toBeInTheDocument();
      expect(screen.getByText('Alternatives Unavailable')).toBeInTheDocument();
    });

    it('renders for unknown risk products even with errors', () => {
      const unknownProduct = { ...mockSafeProduct, riskLevel: RiskLevel.UNKNOWN };

      mockUseAlternatives.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
        refetch: vi.fn(),
        isRefetching: false,
      } as unknown as ReturnType<typeof useAlternatives>);

      render(
        <TestWrapper>
          <AlternativesSection currentProduct={unknownProduct} />
        </TestWrapper>,
      );

      expect(screen.getByText('Safer Alternatives')).toBeInTheDocument();
      expect(screen.getByText('Alternatives Unavailable')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels for error states', () => {
      mockUseAlternatives.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
        refetch: vi.fn(),
        isRefetching: false,
      } as unknown as ReturnType<typeof useAlternatives>);

      render(
        <TestWrapper>
          <AlternativesSection currentProduct={mockCancelledProduct} />
        </TestWrapper>,
      );

      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveAttribute('aria-live', 'polite');
    });

    it('provides proper ARIA labels for loading states', () => {
      mockUseAlternatives.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      } as unknown as ReturnType<typeof useAlternatives>);

      render(
        <TestWrapper>
          <AlternativesSection currentProduct={mockCancelledProduct} />
        </TestWrapper>,
      );

      expect(screen.getByLabelText('Loading alternatives')).toBeInTheDocument();
    });

    it('provides proper button labels for retry actions', () => {
      mockUseAlternatives.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
        refetch: vi.fn(),
        isRefetching: false,
      } as unknown as ReturnType<typeof useAlternatives>);

      render(
        <TestWrapper>
          <AlternativesSection currentProduct={mockCancelledProduct} />
        </TestWrapper>,
      );

      const retryButton = screen.getByRole('button', { name: /retry alternatives/i });
      expect(retryButton).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Retry alternatives'),
      );
    });
  });
});
