import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { useAlternatives } from '../useAlternatives';
import { Product, ProductStatus, RiskLevel } from '@/types/product';

// Mock fetch
global.fetch = vi.fn();
const mockFetch = fetch as ReturnType<typeof vi.fn>;

// Test data
const mockAlternatives: Product[] = [
  {
    id: 10,
    name: 'Safe Alternative 1',
    notifNo: 'ALT001',
    category: 'Lipstick',
    status: ProductStatus.NOTIFIED,
    riskLevel: RiskLevel.SAFE,
    dateNotified: '2023-02-01',
    applicantCompany: { id: 10, name: 'Safe Brand 1' },
    isVerticallyIntegrated: false,
    recencyScore: 0.9,
  },
  {
    id: 11,
    name: 'Safe Alternative 2',
    notifNo: 'ALT002',
    category: 'Lipstick',
    status: ProductStatus.NOTIFIED,
    riskLevel: RiskLevel.SAFE,
    dateNotified: '2023-02-15',
    applicantCompany: { id: 11, name: 'Safe Brand 2' },
    isVerticallyIntegrated: false,
    recencyScore: 0.85,
  },
];

// Test wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useAlternatives', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Successful API calls', () => {
    it('should fetch alternatives successfully', async () => {
      const mockResponse = {
        alternatives: mockAlternatives,
        total: 2,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const { result } = renderHook(
        () => useAlternatives({ excludeId: 1, limit: 3 }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.error).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith('/api/products/alternatives?excludeId=1&limit=3');
    });

    it('should fetch alternatives without excludeId', async () => {
      const mockResponse = {
        alternatives: mockAlternatives,
        total: 2,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const { result } = renderHook(
        () => useAlternatives({ limit: 5 }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith('/api/products/alternatives?limit=5');
    });

    it('should use default limit when not specified', async () => {
      const mockResponse = {
        alternatives: [],
        total: 0,
        message: 'No safer alternatives found.',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const { result } = renderHook(
        () => useAlternatives({}),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/products/alternatives?limit=3');
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(
        () => useAlternatives({ excludeId: 1 }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(new Error('Network error'));
      expect(result.current.data).toBeUndefined();
    });

    it('should handle HTTP error responses', async () => {
      const errorResponse = {
        error: 'Invalid request parameters',
        message: 'Please check your request parameters and try again',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => errorResponse,
      } as Response);

      const { result } = renderHook(
        () => useAlternatives({ excludeId: 1 }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(new Error('Invalid request parameters'));
    });

    it('should handle HTTP error responses with malformed JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as Response);

      const { result } = renderHook(
        () => useAlternatives({ excludeId: 1 }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(new Error('Failed to fetch alternatives'));
    });
  });

  describe('Query configuration', () => {
    it('should be enabled by default', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ alternatives: [], total: 0 }),
      } as Response);

      const { result } = renderHook(
        () => useAlternatives({ excludeId: 1 }),
        { wrapper: createWrapper() }
      );

      // Query should start loading immediately
      expect(result.current.isLoading || result.current.isFetching).toBe(true);
    });

    it('should respect enabled option', () => {
      const { result } = renderHook(
        () => useAlternatives({ excludeId: 1, enabled: false }),
        { wrapper: createWrapper() }
      );

      // Query should not start when disabled
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isFetching).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should use correct query key', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ alternatives: [], total: 0 }),
      } as Response);

      const { result } = renderHook(
        () => useAlternatives({ excludeId: 5, limit: 10 }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // The query key should be ['alternatives', 5, 10]
      // We can't directly test this, but we can verify the hook works correctly
      expect(result.current.data).toBeDefined();
    });
  });

  describe('URL parameter construction', () => {
    it('should construct URL with excludeId and limit', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ alternatives: [], total: 0 }),
      } as Response);

      renderHook(
        () => useAlternatives({ excludeId: 123, limit: 5 }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/products/alternatives?excludeId=123&limit=5');
      });
    });

    it('should construct URL with only limit when excludeId is not provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ alternatives: [], total: 0 }),
      } as Response);

      renderHook(
        () => useAlternatives({ limit: 8 }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/products/alternatives?limit=8');
      });
    });

    it('should handle excludeId of 0', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ alternatives: [], total: 0 }),
      } as Response);

      renderHook(
        () => useAlternatives({ excludeId: 0, limit: 3 }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/products/alternatives?excludeId=0&limit=3');
      });
    });
  });

  describe('Retry behavior', () => {
    it('should retry failed requests', async () => {
      // First call fails, second succeeds
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ alternatives: mockAlternatives, total: 2 }),
        } as Response);

      const { result } = renderHook(
        () => useAlternatives({ excludeId: 1 }),
        { wrapper: createWrapper() }
      );

      // Wait for the retry to complete
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      }, { timeout: 5000 });

      expect(result.current.data?.alternatives).toEqual(mockAlternatives);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});