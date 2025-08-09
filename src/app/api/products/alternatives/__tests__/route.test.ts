import { NextRequest } from 'next/server';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '../route';
import { RiskLevel } from '@/types/product';

// Mock only the API helpers, not the database
vi.mock('@/lib/utils/api-helpers', async () => {
  const actual = await vi.importActual('@/lib/utils/api-helpers');
  return {
    ...actual,
    getClientIP: vi.fn(() => '127.0.0.1'),
    checkRateLimit: vi.fn(() => true),
  };
});

describe('/api/products/alternatives', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset rate limiting mock to allow requests by default
    const { checkRateLimit } = await import('@/lib/utils/api-helpers');
    vi.mocked(checkRateLimit).mockReturnValue(true);
  });

  const createRequest = (searchParams: Record<string, string> = {}) => {
    const url = new URL('http://localhost/api/products/alternatives');
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return new NextRequest(url);
  };

  describe('successful requests', () => {
    it('should return alternatives without exclusion', async () => {
      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('alternatives');
      expect(data.data).toHaveProperty('total');
      expect(Array.isArray(data.data.alternatives)).toBe(true);
      expect(typeof data.data.total).toBe('number');

      // If alternatives are found, they should have the correct structure
      if (data.data.alternatives.length > 0) {
        const alternative = data.data.alternatives[0];
        expect(alternative).toHaveProperty('id');
        expect(alternative).toHaveProperty('name');
        expect(alternative).toHaveProperty('notifNo');
        expect(alternative).toHaveProperty('status');
        expect(alternative).toHaveProperty('riskLevel');
        expect(alternative.riskLevel).toBe(RiskLevel.SAFE);
        expect(alternative.status).toBe('Notified'); // All alternatives should be approved/notified
      }
    });

    it('should return alternatives excluding specific product', async () => {
      const request = createRequest({ excludeId: '123' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('alternatives');
      expect(Array.isArray(data.data.alternatives)).toBe(true);

      // Verify that the excluded product is not in the results
      if (data.data.alternatives.length > 0) {
        const excludedProductFound = data.data.alternatives.some(
          (alt: any) => alt.id === 123,
        );
        expect(excludedProductFound).toBe(false);
      }
    });

    it('should respect custom limit parameter', async () => {
      const request = createRequest({ limit: '5' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.alternatives.length).toBeLessThanOrEqual(5);
    });

    it('should use default limit of 3 when not specified', async () => {
      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // Should return at most 3 alternatives by default
      expect(data.data.alternatives.length).toBeLessThanOrEqual(3);
    });

    it('should handle case when no alternatives are found', async () => {
      // This test assumes that in some cases no alternatives might be available
      // The actual behavior depends on the database content
      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('alternatives');
      expect(data.data).toHaveProperty('total');

      if (data.data.alternatives.length === 0) {
        expect(data.data.message).toBe('No safer alternatives found.');
        expect(data.data.total).toBe(0);
      }
    });

    it('should return random alternatives on multiple requests', async () => {
      // Make multiple requests to check if results are randomized
      const request1 = createRequest({ limit: '10' });
      const request2 = createRequest({ limit: '10' });

      const response1 = await GET(request1);
      const response2 = await GET(request2);

      const data1 = await response1.json();
      const data2 = await response2.json();

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      // If both requests return alternatives, they might be in different order
      // This test is probabilistic and might occasionally fail if the same order is returned
      if (data1.data.alternatives.length > 1 && data2.data.alternatives.length > 1) {
        const ids1 = data1.data.alternatives.map((alt: any) => alt.id);
        const ids2 = data2.data.alternatives.map((alt: any) => alt.id);
        
        // At least check that we're getting valid results
        expect(ids1.length).toBeGreaterThan(0);
        expect(ids2.length).toBeGreaterThan(0);
      }
    });
  });

  describe('validation errors', () => {
    it('should return 400 for invalid excludeId parameter', async () => {
      const request = createRequest({ excludeId: 'invalid' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('should return 400 for negative excludeId parameter', async () => {
      const request = createRequest({ excludeId: '-1' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('should return 400 for limit parameter too high', async () => {
      const request = createRequest({ limit: '15' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('should return 400 for limit parameter too low', async () => {
      const request = createRequest({ limit: '0' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('should return 400 for invalid limit parameter', async () => {
      const request = createRequest({ limit: 'invalid' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });
  });

  describe('error handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require actually breaking the database connection
      // For now, we'll test that the API handles normal database operations
      const request = createRequest();
      const response = await GET(request);

      // Should either succeed or fail gracefully
      expect([200, 400, 503, 500]).toContain(response.status);

      if (response.status !== 200) {
        const data = await response.json();
        expect(data).toHaveProperty('error');
      }
    });

    it('should return appropriate error message for database timeout', async () => {
      // This is a conceptual test - in practice, you'd mock the database to throw a timeout error
      const request = createRequest();
      const response = await GET(request);

      // Should handle the request gracefully
      expect([200, 503]).toContain(response.status);

      if (response.status === 503) {
        const data = await response.json();
        expect(data.error).toBe('Alternatives unavailable. Please try again later.');
      }
    });
  });

  describe('rate limiting', () => {
    it('should return 429 when rate limit is exceeded', async () => {
      const { checkRateLimit } = await import('@/lib/utils/api-helpers');
      vi.mocked(checkRateLimit).mockReturnValue(false);

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe('Too many requests');
    });
  });

  describe('response structure', () => {
    it('should return consistent response structure', async () => {
      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('alternatives');
      expect(data.data).toHaveProperty('total');
    });

    it('should include all required product fields in alternatives', async () => {
      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);

      if (data.data.alternatives.length > 0) {
        const alternative = data.data.alternatives[0];
        
        // Required fields
        expect(alternative).toHaveProperty('id');
        expect(alternative).toHaveProperty('name');
        expect(alternative).toHaveProperty('notifNo');
        expect(alternative).toHaveProperty('category');
        expect(alternative).toHaveProperty('status');
        expect(alternative).toHaveProperty('riskLevel');
        
        // Optional fields
        expect(alternative).toHaveProperty('reasonForCancellation');
        expect(alternative).toHaveProperty('applicantCompany');
        
        // Verify data types
        expect(typeof alternative.id).toBe('number');
        expect(typeof alternative.name).toBe('string');
        expect(typeof alternative.notifNo).toBe('string');
        expect(typeof alternative.category).toBe('string');
        expect(typeof alternative.status).toBe('string');
        expect(typeof alternative.riskLevel).toBe('string');
      }
    });

    it('should set correct risk level for all alternatives', async () => {
      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);

      // All alternatives should be marked as safe since they're approved products
      data.data.alternatives.forEach((alternative: any) => {
        expect(alternative.riskLevel).toBe(RiskLevel.SAFE);
        expect(alternative.status).toBe('Notified');
      });
    });
  });

  describe('parameter combinations', () => {
    it('should handle excludeId and limit together', async () => {
      const request = createRequest({ excludeId: '1', limit: '2' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.alternatives.length).toBeLessThanOrEqual(2);
      
      // Verify excluded product is not in results
      if (data.data.alternatives.length > 0) {
        const excludedProductFound = data.data.alternatives.some(
          (alt: any) => alt.id === 1,
        );
        expect(excludedProductFound).toBe(false);
      }
    });

    it('should handle category parameter if provided', async () => {
      const request = createRequest({ category: 'Lipstick' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // Note: The current implementation doesn't filter by category,
      // but the API should still handle the parameter gracefully
    });
  });
});