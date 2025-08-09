import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchInterface } from '../SearchInterface';
import { useProductSearch } from '@/hooks/useProductSearch';

// Mock the useProductSearch hook
vi.mock('@/hooks/useProductSearch', () => ({
  useProductSearch: vi.fn(),
}));

const mockUseProductSearch = vi.mocked(useProductSearch);

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

describe('SearchInterface Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Network Errors', () => {
    it('displays network error message when search fails due to network issues', () => {
      mockUseProductSearch.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('fetch failed'),
      } as unknown as ReturnType<typeof useProductSearch>);

      render(
        <TestWrapper>
          <SearchInterface />
        </TestWrapper>,
      );

      expect(screen.getByText('Search Unavailable')).toBeInTheDocument();
      expect(screen.getByText(/couldn't complete your search/i)).toBeInTheDocument();
    });

    it('provides retry functionality for network errors', async () => {
      const mockRefetch = vi.fn();
      mockUseProductSearch.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('network connection failed'),
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof useProductSearch>);

      // Mock window.location.reload for the retry button
      const mockReload = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true,
      });

      render(
        <TestWrapper>
          <SearchInterface />
        </TestWrapper>,
      );

      const retryButton = screen.getByRole('button', { name: /retry search/i });
      fireEvent.click(retryButton);

      expect(mockReload).toHaveBeenCalled();
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
        <TestWrapper>
          <SearchInterface />
        </TestWrapper>,
      );

      expect(screen.getByText('Search Unavailable')).toBeInTheDocument();
      expect(screen.getByText(/couldn't complete your search/i)).toBeInTheDocument();
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
        <TestWrapper>
          <SearchInterface />
        </TestWrapper>,
      );

      expect(screen.getByText('Search Unavailable')).toBeInTheDocument();
    });

    it('displays server error message for 503 errors', () => {
      mockUseProductSearch.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Service unavailable 503'),
      } as unknown as ReturnType<typeof useProductSearch>);

      render(
        <TestWrapper>
          <SearchInterface />
        </TestWrapper>,
      );

      expect(screen.getByText('Search Unavailable')).toBeInTheDocument();
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
        <TestWrapper>
          <SearchInterface />
        </TestWrapper>,
      );

      expect(screen.getByText('Search Unavailable')).toBeInTheDocument();
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
        <TestWrapper>
          <SearchInterface />
        </TestWrapper>,
      );

      expect(screen.getByText('Search Unavailable')).toBeInTheDocument();
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
        <TestWrapper>
          <SearchInterface />
        </TestWrapper>,
      );

      expect(screen.getByText('Search Unavailable')).toBeInTheDocument();

      // Simulate successful retry
      mockUseProductSearch.mockReturnValue({
        data: { products: [], total: 0 },
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useProductSearch>);

      rerender(
        <TestWrapper>
          <SearchInterface />
        </TestWrapper>,
      );

      expect(screen.queryByText('Search Unavailable')).not.toBeInTheDocument();
    });

    it('maintains search query after error recovery', async () => {
      const { rerender } = render(
        <TestWrapper>
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
        <TestWrapper>
          <SearchInterface />
        </TestWrapper>,
      );

      expect(screen.getByText('Search Unavailable')).toBeInTheDocument();
      expect(searchInput).toHaveValue('lipstick');
    });
  });

  describe('Error Boundary Integration', () => {
    it('catches and handles component errors gracefully', () => {
      // Mock console.error to avoid noise in test output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Create a component that throws during render
      const ErrorComponent = () => {
        throw new Error('Component render error');
      };

      render(
        <TestWrapper>
          <ErrorComponent />
        </TestWrapper>,
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();

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
        <TestWrapper>
          <SearchInterface />
        </TestWrapper>,
      );

      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveAttribute('aria-live', 'polite');
    });

    it('provides proper button labels for retry actions', () => {
      mockUseProductSearch.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Connection failed'),
      } as unknown as ReturnType<typeof useProductSearch>);

      render(
        <TestWrapper>
          <SearchInterface />
        </TestWrapper>,
      );

      const retryButton = screen.getByRole('button', { name: /retry search/i });
      expect(retryButton).toHaveAttribute('aria-label', expect.stringContaining('Retry search'));
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
        <TestWrapper>
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
        <TestWrapper>
          <SearchInterface />
        </TestWrapper>,
      );

      expect(screen.queryByLabelText('Loading search results')).not.toBeInTheDocument();
      expect(screen.getByText('Search Unavailable')).toBeInTheDocument();
    });

    it('transitions from error to success state correctly', () => {
      // Start with error state
      mockUseProductSearch.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Search failed'),
      } as unknown as ReturnType<typeof useProductSearch>);

      const { rerender } = render(
        <TestWrapper>
          <SearchInterface />
        </TestWrapper>,
      );

      expect(screen.getByText('Search Unavailable')).toBeInTheDocument();

      // Transition to success state
      mockUseProductSearch.mockReturnValue({
        data: { products: [], total: 0 },
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useProductSearch>);

      rerender(
        <TestWrapper>
          <SearchInterface />
        </TestWrapper>,
      );

      expect(screen.queryByText('Search Unavailable')).not.toBeInTheDocument();
    });
  });
});
