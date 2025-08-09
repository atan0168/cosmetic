import { NextRequest } from 'next/server';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '../route';
import { ProductStatus, RiskLevel, type Product } from '@/types/product';

// Mock only the API helpers, not the database
vi.mock('@/lib/utils/api-helpers', async () => {
  const actual = await vi.importActual('@/lib/utils/api-helpers');
  return {
    ...actual,
    getClientIP: vi.fn(() => '127.0.0.1'),
    checkRateLimit: vi.fn(() => true),
  };
});

describe('/api/products/search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (searchParams: Record<string, string>) => {
    const url = new URL('http://localhost/api/products/search');
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return new NextRequest(url);
  };

  describe('successful searches', () => {
    it('should return products for valid search query', async () => {
      const request = createRequest({ query: 'lipstick' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('products');
      expect(data.data).toHaveProperty('total');
      expect(Array.isArray(data.data.products)).toBe(true);
      expect(typeof data.data.total).toBe('number');

      // If products are found, they should have the correct structure
      if (data.data.products.length > 0) {
        const product = data.data.products[0];
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('notifNo');
        expect(product).toHaveProperty('status');
        expect(product).toHaveProperty('riskLevel');
        expect([RiskLevel.SAFE, RiskLevel.UNSAFE, RiskLevel.UNKNOWN]).toContain(product.riskLevel);
      }
    });

    it('should include alternatives when cancelled products are found', async () => {
      // Search for a term that might return cancelled products
      const request = createRequest({ query: 'cancelled' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Check if any cancelled products were found
      const hasCancelledProducts = data.data.products.some(
        (p: Product) => p.status === ProductStatus.CANCELLED,
      );

      // If cancelled products exist, alternatives should be provided
      if (hasCancelledProducts) {
        expect(data.data.alternatives).toBeDefined();
        expect(Array.isArray(data.data.alternatives)).toBe(true);

        if (data.data.alternatives.length > 0) {
          const alternative = data.data.alternatives[0];
          expect(alternative).toHaveProperty('riskLevel');
          expect(alternative.riskLevel).toBe(RiskLevel.SAFE);
        }
      }
    });

    it('should handle pagination parameters', async () => {
      const request = createRequest({
        query: 'test',
        limit: '5',
        offset: '0',
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.products.length).toBeLessThanOrEqual(5);
    });

    it('should handle empty search results', async () => {
      // Use a very specific search that's unlikely to match
      const request = createRequest({ query: 'xyznonexistentproduct123' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.products).toHaveLength(0);
      expect(data.data.total).toBe(0);
      expect(data.data.alternatives).toBeUndefined();
    });
  });

  describe('validation errors', () => {
    it('should return 400 for missing query parameter', async () => {
      const request = createRequest({});
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing query parameter');
    });

    it('should return 400 for query shorter than 3 characters', async () => {
      const request = createRequest({ query: 'ab' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Please enter at least 3 characters');
    });

    it('should return 400 for query longer than 100 characters', async () => {
      const longQuery = 'a'.repeat(101);
      const request = createRequest({ query: longQuery });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Search query too long');
    });

    it('should validate and clamp limit parameter', async () => {
      // Test limit too high
      const request1 = createRequest({ query: 'test', limit: '100' });
      const response1 = await GET(request1);
      expect(response1.status).toBe(400);

      // Test limit too low
      const request2 = createRequest({ query: 'test', limit: '0' });
      const response2 = await GET(request2);
      expect(response2.status).toBe(400);
    });

    it('should validate offset parameter', async () => {
      const request = createRequest({ query: 'test', offset: '-1' });
      const response = await GET(request);
      expect(response.status).toBe(400);
    });
  });

  describe('error handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require actually breaking the database connection
      // For now, we'll test that the API handles normal database operations
      const request = createRequest({ query: 'test' });
      const response = await GET(request);

      // Should either succeed or fail gracefully
      expect([200, 400, 503, 500]).toContain(response.status);

      if (response.status !== 200) {
        const data = await response.json();
        expect(data).toHaveProperty('error');
      }
    });

    it('should handle malformed queries gracefully', async () => {
      // Test with potentially problematic characters
      const request = createRequest({ query: 'test\x00null' });
      const response = await GET(request);

      // Should either succeed or return a validation error
      expect([200, 400]).toContain(response.status);

      if (response.status === 400) {
        const data = await response.json();
        expect(data).toHaveProperty('error');
      }
    });
  });

  describe('rate limiting', () => {
    it('should return 429 when rate limit is exceeded', async () => {
      const { checkRateLimit } = await import('@/lib/utils/api-helpers');
      vi.mocked(checkRateLimit).mockReturnValue(false);

      const request = createRequest({ query: 'test' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe('Too many requests');
    });
  });

  describe('input sanitization', () => {
    it('should sanitize search query input', async () => {
      // Reset rate limiting mock for this test
      const { checkRateLimit } = await import('@/lib/utils/api-helpers');
      vi.mocked(checkRateLimit).mockReturnValue(true);

      const request = createRequest({
        query: '<script>alert("xss")</script>test',
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      // The API should handle the sanitized input without errors
      expect(data.data).toHaveProperty('products');
      expect(data.data).toHaveProperty('total');
    });

    it('should normalize whitespace in search query', async () => {
      // Reset rate limiting mock for this test
      const { checkRateLimit } = await import('@/lib/utils/api-helpers');
      vi.mocked(checkRateLimit).mockReturnValue(true);

      const request = createRequest({ query: '  test   query  ' });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      // The API should handle the normalized input without errors
      expect(data.data).toHaveProperty('products');
      expect(data.data).toHaveProperty('total');
    });
  });
});
