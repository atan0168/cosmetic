import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SearchInterface } from '../SearchInterface';
import { Product, ProductStatus, RiskLevel } from '@/types/product';

// Mock the useProductSearch hook
import { vi } from 'vitest';

vi.mock('@/hooks/useProductSearch', () => ({
  useProductSearch: vi.fn(),
}));

import { useProductSearch } from '@/hooks/useProductSearch';
const mockUseProductSearch = vi.mocked(useProductSearch);

// Mock product data
const mockProduct: Product = {
  id: 1,
  name: 'Test Lipstick',
  notifNo: 'CPNP-123456',
  category: 'Lip Products',
  status: ProductStatus.APPROVED,
  riskLevel: RiskLevel.SAFE,
  dateNotified: '2023-01-01',
  isVerticallyIntegrated: false,
  recencyScore: 0.8,
  applicantCompany: {
    id: 1,
    name: 'Test Company',
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

describe('SearchInterface', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input and empty state initially', () => {
    mockUseProductSearch.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useProductSearch>);

    render(
      <TestWrapper>
        <SearchInterface />
      </TestWrapper>,
    );

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText('Search for Products')).toBeInTheDocument();
  });

  it('shows loading state when searching', () => {
    mockUseProductSearch.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as unknown as ReturnType<typeof useProductSearch>);

    render(
      <TestWrapper>
        <SearchInterface />
      </TestWrapper>,
    );

    // The loading state should be shown in SearchResults - look for the specific loading message
    expect(screen.getByLabelText('Loading search results')).toBeInTheDocument();
  });

  it('displays search results when products are found', async () => {
    // Mock the hook to return results for the specific query
    mockUseProductSearch.mockImplementation((query) => {
      if (query === 'lipstick') {
        return {
          data: {
            products: [mockProduct],
            total: 1,
          },
          isLoading: false,
          error: null,
        } as unknown as ReturnType<typeof useProductSearch>;
      }
      return {
        data: undefined,
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useProductSearch>;
    });

    render(
      <TestWrapper>
        <SearchInterface />
      </TestWrapper>,
    );

    // First enter a search query to trigger the search
    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'lipstick' } });

    // Wait for the results to appear
    await waitFor(() => {
      expect(screen.getByText('Search Results')).toBeInTheDocument();
      expect(screen.getByText('Test Lipstick')).toBeInTheDocument();
    });
  });

  it('displays error message when search fails', () => {
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

    expect(screen.getByText('Search Error')).toBeInTheDocument();
    expect(screen.getByText('Search failed')).toBeInTheDocument();
  });

  it('calls onProductSelect when a product is clicked', async () => {
    const mockOnProductSelect = vi.fn();

    // Mock the hook to return results for the specific query
    mockUseProductSearch.mockImplementation((query) => {
      if (query === 'lipstick') {
        return {
          data: {
            products: [mockProduct],
            total: 1,
          },
          isLoading: false,
          error: null,
        } as unknown as ReturnType<typeof useProductSearch>;
      }
      return {
        data: undefined,
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useProductSearch>;
    });

    render(
      <TestWrapper>
        <SearchInterface onProductSelect={mockOnProductSelect} />
      </TestWrapper>,
    );

    // First enter a search query to trigger the search
    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'lipstick' } });

    // Wait for the product to appear and then click it
    await waitFor(() => {
      const productCard = screen.getByText('Test Lipstick').closest('div');
      if (productCard) {
        fireEvent.click(productCard);
        expect(mockOnProductSelect).toHaveBeenCalledWith(mockProduct);
      }
    });
  });

  it('updates search query when input changes', async () => {
    mockUseProductSearch.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useProductSearch>);

    render(
      <TestWrapper>
        <SearchInterface />
      </TestWrapper>,
    );

    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'lipstick' } });

    await waitFor(() => {
      expect(mockUseProductSearch).toHaveBeenCalledWith('lipstick');
    });
  });

  it('handles error boundary gracefully', async () => {
    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Import ErrorBoundary from the correct path
    const { ErrorBoundary } = await import('@/components/ui/error-boundary');

    // Create a component that throws an error during render
    const ErrorComponent = () => {
      throw new Error('Test error');
    };

    render(
      <TestWrapper>
        <ErrorBoundary>
          <ErrorComponent />
        </ErrorBoundary>
      </TestWrapper>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
