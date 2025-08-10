import { NextRequest } from 'next/server';
import { searchProducts, getSaferAlternatives } from '@/lib/db/queries';
import { SearchQuerySchema, validationUtils } from '@/lib/validations';
import {
  createErrorResponse,
  createSuccessResponse,
  getClientIP,
  checkRateLimit,
} from '@/lib/utils/api-helpers';
import { ProductStatus, RiskLevel } from '@/types/product';

/**
 * GET /api/products/search
 * Search for products by name or notification number
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting check
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP, 100, 60000)) {
      return createErrorResponse(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
        },
        429,
      );
    }

    // Extract and validate search parameters
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get('query');
    const rawLimit = searchParams.get('limit');
    const rawOffset = searchParams.get('offset');

    // Validate required query parameter
    if (!rawQuery) {
      return createErrorResponse(
        {
          error: 'Missing query parameter',
          message: 'Query parameter is required',
        },
        400,
      );
    }

    // Prepare validation data
    const validationData = {
      query: rawQuery,
      limit: rawLimit ? parseInt(rawLimit, 10) : 10,
      offset: rawOffset ? parseInt(rawOffset, 10) : 0,
    };

    // Validate search parameters using Zod schema
    const validationResult = validationUtils.safeValidate(SearchQuerySchema, validationData);

    if (!validationResult.success) {
      return createErrorResponse(validationResult.error, 400);
    }

    const { query, limit, offset } = validationResult.data;

    // Perform database search
    const searchResult = await searchProducts(query, limit, offset);

    // Transform products to include risk level and missing fields
    const productsWithRiskLevel = searchResult.products.map((product) => ({
      ...product,
      riskLevel:
        product.status === ProductStatus.CANCELLED
          ? RiskLevel.UNSAFE
          : product.status === ProductStatus.APPROVED
            ? RiskLevel.SAFE
            : RiskLevel.UNKNOWN,
      dateNotified: new Date().toISOString().split('T')[0], // Default to today's date
      isVerticallyIntegrated: false, // Default value
      recencyScore: 0.5, // Default value
    }));

    // Get safer alternatives if any cancelled products are found
    let alternatives = undefined;
    const hasCancelledProducts = productsWithRiskLevel.some(
      (p) => p.status === ProductStatus.CANCELLED,
    );

    if (hasCancelledProducts) {
      try {
        alternatives = await getSaferAlternatives(undefined, 3);
        alternatives = alternatives.map((alt) => ({
          ...alt,
          riskLevel: alt.status === ProductStatus.APPROVED ? RiskLevel.SAFE : RiskLevel.UNKNOWN,
          dateNotified: new Date().toISOString().split('T')[0], // Default to today's date
          isVerticallyIntegrated: false, // Default value
          recencyScore: 0.5, // Default value
        }));
      } catch (error) {
        console.warn('Failed to fetch alternatives:', error);
        // Continue without alternatives rather than failing the entire request
      }
    }

    // Return successful response
    return createSuccessResponse({
      products: productsWithRiskLevel,
      total: searchResult.total,
      alternatives,
    });
  } catch (error) {
    console.error('Search API error:', error);

    // Handle specific database connection errors
    if (error instanceof Error) {
      if (error.message.includes('connection') || error.message.includes('timeout')) {
        return createErrorResponse(
          {
            error: 'Search unavailable. Please try again later.',
            message: 'Database connection error',
          },
          503,
        );
      }

      if (error.message.includes('syntax') || error.message.includes('query')) {
        return createErrorResponse(
          {
            error: 'Invalid search query',
            message: 'Please check your search terms and try again',
          },
          400,
        );
      }
    }

    // Generic error response
    return createErrorResponse(
      {
        error: 'An unexpected error occurred',
        message: 'Please try again later',
      },
      500,
    );
  }
}
