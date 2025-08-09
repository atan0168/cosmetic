import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SearchInterface } from '../search/SearchInterface';
import { AlternativesSection } from '../ui/alternatives-section';
import { Product, ProductStatus, RiskLevel } from '@/types/product';

// Mock the API endpoints
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock product data
const mockProducts: Product[] = [
  {
    id: '1',
    notifNo: 'CPNP-123456',
    name: 'Safe Product',
    category: 'Skincare',
    status: ProductStatus.APPROVED,
    riskLevel: RiskLevel.SAFE,
    applicantCompany: {
      id: '1',
      name: 'Safe Company'
    }
  },
  {
    id: '2',
    notifNo: 'CPNP-789012',
    name: 'Cancelled Product',
    category: 'Makeup',
    status: ProductStatus.CANCELLED,
    riskLevel: RiskLevel.UNSAFE,
    reasonForCancellation: 'Safety concerns identified',
    applicantCompany: {
      id: '2',
      name: 'Test Company'
    }
  }
];

const mockAlternatives: Product[] = [
  {
    id: '3',
    notifNo: 'CPNP-345678',
    name: 'Alternative Product 1',
    category: 'Makeup',
    status: ProductStatus.APPROVED,
    riskLevel: RiskLevel.SAFE,
    applicantCompany: {
      id: '3',
      name: 'Alternative Company'
    }
  },
  {
    id: '4',
    notifNo: 'CPNP-456789',
    name: 'Alternative Product 2',
    category: 'Makeup',
    status: ProductStatus.APPROVED,
    riskLevel: RiskLevel.SAFE,
    applicantCompany: {
      id: '4',
      name: 'Another Company'
    }
  }
];

// Test wrapper with React Query
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('SearchInterface with React Query', () => {
    it('should handle successful search with loading states', async () => {
      const user = userEvent.setup();
      
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          products: mockProducts,
          total: mockProducts.length,
          page: 1,
          limit: 10
        }),
      } as Response);

      const handleProductSelect = jest.fn();
      
      render(
        <TestWrapper>
          <SearchInterface onProductSelect={handleProductSelect} />
        </TestWrapper>
      );

      const searchInput = screen.getByRole('textbox');
      
      // Type search query
      await user.type(searchInput, 'test product');
      
      // Should show loading state initially
      await waitFor(() => {
        expect(screen.getByText('Searching...')).toBeInTheDocument();
      });

      // Wait for results to load
      await waitFor(() => {
        expect(screen.getByText('Search Results (2 found)')).toBeInTheDocument();
      });

      // Check that products are displayed
      expect(screen.getByText('Safe Product')).toBeInTheDocument();
      expect(screen.getByText('Cancelled Product')).toBeInTheDocument();
      
      // Verify API was called correctly
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/products/search?query=test%20product'),
        expect.any(Object)
      );
    });

    it('should handle search errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock API error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(
        <TestWrapper>
          <SearchInterface />
        </TestWrapper>
      );

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'test');

      // Wait for error to be displayed
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it('should handle empty search results', async () => {
      const user = userEvent.setup();
      
      // Mock empty response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          products: [],
          total: 0,
          page: 1,
          limit: 10
        }),
      } as Response);

      render(
        <TestWrapper>
          <SearchInterface />
        </TestWrapper>
      );

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'nonexistent');

      // Wait for empty state
      await waitFor(() => {
        expect(screen.getByText('No Products Found')).toBeInTheDocument();
      });
    });

    it('should handle product selection', async () => {
      const user = userEvent.setup();
      const handleProductSelect = jest.fn();
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          products: mockProducts,
          total: mockProducts.length,
          page: 1,
          limit: 10
        }),
      } as Response);

      render(
        <TestWrapper>
          <SearchInterface onProductSelect={handleProductSelect} />
        </TestWrapper>
      );

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'test');

      // Wait for results
      await waitFor(() => {
        expect(screen.getByText('Safe Product')).toBeInTheDocument();
      });

      // Click on a product
      const productCard = screen.getByRole('button', { name: /View details for Safe Product/i });
      await user.click(productCard);

      expect(handleProductSelect).toHaveBeenCalledWith(mockProducts[0]);
    });
  });

  describe('AlternativesSection with React Query', () => {
    it('should load and display alternatives', async () => {
      // Mock alternatives API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          alternatives: mockAlternatives,
          total: mockAlternatives.length
        }),
      } as Response);

      const handleAlternativeClick = jest.fn();

      render(
        <TestWrapper>
          <AlternativesSection 
            productId="2" 
            onAlternativeClick={handleAlternativeClick}
          />
        </TestWrapper>
      );

      // Should show loading state initially
      expect(screen.getByText(/loading alternatives/i)).toBeInTheDocument();

      // Wait for alternatives to load
      await waitFor(() => {
        expect(screen.getByText('Safer Alternatives')).toBeInTheDocument();
      });

      // Check that alternatives are displayed
      expect(screen.getByText('Alternative Product 1')).toBeInTheDocument();
      expect(screen.getByText('Alternative Product 2')).toBeInTheDocument();

      // Verify API was called correctly
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/products/alternatives?productId=2'),
        expect.any(Object)
      );
    });

    it('should handle alternatives loading error', async () => {
      // Mock API error
      mockFetch.mockRejectedValueOnce(new Error('Failed to load alternatives'));

      render(
        <TestWrapper>
          <AlternativesSection productId="2" />
        </TestWrapper>
      );

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText(/failed to load alternatives/i)).toBeInTheDocument();
      });
    });

    it('should handle no alternatives found', async () => {
      // Mock empty alternatives response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          alternatives: [],
          total: 0
        }),
      } as Response);

      render(
        <TestWrapper>
          <AlternativesSection productId="2" />
        </TestWrapper>
      );

      // Wait for empty state
      await waitFor(() => {
        expect(screen.getByText(/no safer alternatives found/i)).toBeInTheDocument();
      });
    });

    it('should handle alternative selection', async () => {
      const user = userEvent.setup();
      const handleAlternativeClick = jest.fn();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          alternatives: mockAlternatives,
          total: mockAlternatives.length
        }),
      } as Response);

      render(
        <TestWrapper>
          <AlternativesSection 
            productId="2" 
            onAlternativeClick={handleAlternativeClick}
          />
        </TestWrapper>
      );

      // Wait for alternatives to load
      await waitFor(() => {
        expect(screen.getByText('Alternative Product 1')).toBeInTheDocument();
      });

      // Click on an alternative
      const alternativeCard = screen.getByRole('button', { name: /View details for Alternative Product 1/i });
      await user.click(alternativeCard);

      expect(handleAlternativeClick).toHaveBeenCalledWith(mockAlternatives[0]);
    });
  });

  describe('Search and Alternatives Integration', () => {
    it('should show alternatives for cancelled products in search results', async () => {
      const user = userEvent.setup();

      // Mock search response with cancelled product
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            products: [mockProducts[1]], // Only cancelled product
            total: 1,
            page: 1,
            limit: 10
          }),
        } as Response)
        // Mock alternatives response
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            alternatives: mockAlternatives,
            total: mockAlternatives.length
          }),
        } as Response);

      render(
        <TestWrapper>
          <SearchInterface />
        </TestWrapper>
      );

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'cancelled');

      // Wait for search results
      await waitFor(() => {
        expect(screen.getByText('Cancelled Product')).toBeInTheDocument();
      });

      // Should also show alternatives section
      await waitFor(() => {
        expect(screen.getByText('Safer Alternatives')).toBeInTheDocument();
      });

      // Check that alternatives are displayed
      expect(screen.getByText('Alternative Product 1')).toBeInTheDocument();
      expect(screen.getByText('Alternative Product 2')).toBeInTheDocument();
    });

    it('should handle retry functionality', async () => {
      const user = userEvent.setup();

      // First call fails, second succeeds
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            products: mockProducts,
            total: mockProducts.length,
            page: 1,
            limit: 10
          }),
        } as Response);

      render(
        <TestWrapper>
          <SearchInterface />
        </TestWrapper>
      );

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'test');

      // Wait for error
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });

      // Clear and search again to trigger retry
      await user.clear(searchInput);
      await user.type(searchInput, 'test retry');

      // Should eventually succeed
      await waitFor(() => {
        expect(screen.getByText('Search Results (2 found)')).toBeInTheDocument();
      });
    });
  });

  describe('Performance and Caching', () => {
    it('should cache search results', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          products: mockProducts,
          total: mockProducts.length,
          page: 1,
          limit: 10
        }),
      } as Response);

      render(
        <TestWrapper>
          <SearchInterface />
        </TestWrapper>
      );

      const searchInput = screen.getByRole('textbox');
      
      // First search
      await user.type(searchInput, 'test');
      await waitFor(() => {
        expect(screen.getByText('Search Results (2 found)')).toBeInTheDocument();
      });

      // Clear and search same query again
      await user.clear(searchInput);
      await user.type(searchInput, 'test');

      // Should use cached result (API called only once)
      await waitFor(() => {
        expect(screen.getByText('Search Results (2 found)')).toBeInTheDocument();
      });

      // API should have been called only once due to caching
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should debounce search input', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          products: mockProducts,
          total: mockProducts.length,
          page: 1,
          limit: 10
        }),
      } as Response);

      render(
        <TestWrapper>
          <SearchInterface />
        </TestWrapper>
      );

      const searchInput = screen.getByRole('textbox');
      
      // Type quickly
      await user.type(searchInput, 'test', { delay: 50 });

      // Should only make one API call after debounce
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });
  });
});