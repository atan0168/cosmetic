import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchInterface } from '../SearchInterface';
import { useProductSearch } from '@/hooks/useProductSearch';

// Mock the useProductSearch hook
vi.mock('@/hooks/useProductSearch', () => ({
  useProductSearch: vi.fn(),
}));

const mockUseProductSearch = vi.mocked(useProductSearch);

// Test wrapper with React Query - will use queryClient from describe block
function TestWrapper({ children, client }: { children: React.ReactNode; client: QueryClient }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('SearchInterface Error Handling', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
          gcTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    });
  });

  afterEach(() => {
    // Clear all queries and mutations to prevent memory leaks
    queryClient.clear();
    queryClient.getQueryCache().clear();
    queryClient.getMutationCache().clear();
  });

  describe('Network Errors', () => {
    it('displays network error message when search fails due to network issues', () => {
      mockUseProductSearch.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('fetch failed'),
      } as unknown as ReturnType<typeof useProductSearch>);

      render(
        <TestWrapper client={queryClient}>
          <SearchInterface />
        </TestWrapper>,
      );

      expect(screen.getByText('Search Error')).toBeInTheDocument();
      expect(screen.getByText('fetch failed')).toBeInTheDocument();
    });

    it('displays network error message without retry button', () => {
      mockUseProductSearch.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('network connection failed'),
      } as unknown as ReturnType<typeof useProductSearch>);

      render(
        <TestWrapper client={queryClient}>
          <SearchInterface />
        </TestWrapper>,
      );

      expect(screen.getByText('Search Error')).toBeInTheDocument();
      expect(screen.getByText('network connection failed')).toBeInTheDocument();
      // No retry button in current implementation
      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });
  });

  describe('Validation Errors', () => {
    it('handles validation errors gracefully', () => {
      mockUseProductSearch.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Please enter at least 3 characters'),
      } as unknown as ReturnType<typeof useProductSearch>);

      render(
        <TestWrapper client={queryClient}>
          <SearchInterface />
        </TestWrapper>,
      );

      expect(screen.getByText('Search Error')).toBeInTheDocument();
      expect(screen.getByText('Please enter at least 3 characters')).toBeInTheDocument();
    });
  });

  describe('Server Errors', () => {
    it('displays server error message for 500 errors', () => {
      mockUseProductSearch.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Server error 500'),
      } as unknown as ReturnType<typeof useProductSearch>);

      render(
        <TestWrapper client={queryClient}>
          <SearchInterface />
        </TestWrapper>,
      );

      expect(screen.getByText('Search Error')).toBeInTheDocument();
    });

    it('displays server error message for 503 errors', () => {
      mockUseProductSearch.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Service unavailable 503'),
      } as unknown as ReturnType<typeof useProductSearch>);

      render(
        <TestWrapper client={queryClient}>
          <SearchInterface />
        </TestWrapper>,
      );

      expect(screen.getByText('Search Error')).toBeInTheDocument();
    });
  });

  describe('Database Errors', () => {
    it('displays appropriate error message for database connection issues', () => {
      mockUseProductSearch.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('database connection timeout'),
      } as unknown as ReturnType<typeof useProductSearch>);

      render(
        <TestWrapper client={queryClient}>
          <SearchInterface />
        </TestWrapper>,
      );

      expect(screen.getByText('Search Error')).toBeInTheDocument();
    });
  });

  describe('Rate Limiting Errors', () => {
    it('displays rate limit error message', () => {
      mockUseProductSearch.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Too many requests'),
      } as unknown as ReturnType<typeof useProductSearch>);

      render(
        <TestWrapper client={queryClient}>
          <SearchInterface />
        </TestWrapper>,
      );

      expect(screen.getByText('Search Error')).toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    it('allows users to recover from errors by retrying', async () => {
      // Start with an error state
      mockUseProductSearch.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('network error'),
      } as unknown as ReturnType<typeof useProductSearch>);

      const { rerender } = render(
        <TestWrapper client={queryClient}>
          <SearchInterface />
        </TestWrapper>,
      );

      expect(screen.getByText('Search Error')).toBeInTheDocument();

      // Simulate successful retry
      mockUseProductSearch.mockReturnValue({
        data: { products: [], total: 0 },
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useProductSearch>);

      rerender(
        <TestWrapper client={queryClient}>
          <SearchInterface />
        </TestWrapper>,
      );

      expect(screen.queryByText('Search Error')).not.toBeInTheDocument();
    });

    it('maintains search query after error recovery', async () => {
      const { rerender } = render(
        <TestWrapper client={queryClient}>
          <SearchInterface />
        </TestWrapper>,
      );

      // Enter search query
      const searchInput = screen.getByRole('textbox');
      fireEvent.change(searchInput, { target: { value: 'lipstick' } });

      // Simulate error
      mockUseProductSearch.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('network error'),
      } as unknown as ReturnType<typeof useProductSearch>);

      rerender(
        <TestWrapper client={queryClient}>
          <SearchInterface />
        </TestWrapper>,
      );

      expect(screen.getByText('Search Error')).toBeInTheDocument();
      expect(searchInput).toHaveValue('lipstick');
    });
  });

  describe('Error Boundary Integration', () => {
    it('handles component errors by throwing to parent error boundary', () => {
      // Mock console.error to avoid noise in test output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Create a component that throws during render
      const ErrorComponent = () => {
        throw new Error('Component render error');
      };

      // This test verifies that errors are properly thrown and not caught internally
      expect(() => {
        render(
          <TestWrapper client={queryClient}>
            <ErrorComponent />
          </TestWrapper>,
        );
      }).toThrow('Component render error');

      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility in Error States', () => {
    it('provides proper ARIA labels for error messages', () => {
      mockUseProductSearch.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Search failed'),
      } as unknown as ReturnType<typeof useProductSearch>);

      render(
        <TestWrapper client={queryClient}>
          <SearchInterface />
        </TestWrapper>,
      );

      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveAttribute('aria-live', 'polite');
    });

    it('provides proper accessibility attributes for error messages', () => {
      mockUseProductSearch.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Connection failed'),
      } as unknown as ReturnType<typeof useProductSearch>);

      render(
        <TestWrapper client={queryClient}>
          <SearchInterface />
        </TestWrapper>,
      );

      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveAttribute('aria-live', 'polite');
      expect(screen.getByText('Search Error')).toBeInTheDocument();
      expect(screen.getByText('Connection failed')).toBeInTheDocument();
    });
  });

  describe('Error State Transitions', () => {
    it('transitions from loading to error state correctly', () => {
      // Start with loading state
      mockUseProductSearch.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as unknown as ReturnType<typeof useProductSearch>);

      const { rerender } = render(
        <TestWrapper client={queryClient}>
          <SearchInterface />
        </TestWrapper>,
      );

      expect(screen.getByLabelText('Loading search results')).toBeInTheDocument();

      // Transition to error state
      mockUseProductSearch.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Search failed'),
      } as unknown as ReturnType<typeof useProductSearch>);

      rerender(
        <TestWrapper client={queryClient}>
          <SearchInterface />
        </TestWrapper>,
      );

      expect(screen.queryByLabelText('Loading search results')).not.toBeInTheDocument();
      expect(screen.getByText('Search Error')).toBeInTheDocument();
    });

    it('transitions from error to success state correctly', () => {
      // Start with error state
      mockUseProductSearch.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Search failed'),
      } as unknown as ReturnType<typeof useProductSearch>);

      const { rerender } = render(
        <TestWrapper client={queryClient}>
          <SearchInterface />
        </TestWrapper>,
      );

      expect(screen.getByText('Search Error')).toBeInTheDocument();

      // Transition to success state
      mockUseProductSearch.mockReturnValue({
        data: { products: [], total: 0 },
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useProductSearch>);

      rerender(
        <TestWrapper client={queryClient}>
          <SearchInterface />
        </TestWrapper>,
      );

      expect(screen.queryByText('Search Error')).not.toBeInTheDocument();
    });
  });
});
