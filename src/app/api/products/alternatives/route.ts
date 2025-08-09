import { NextRequest } from 'next/server';
import { getSaferAlternatives } from '@/lib/db/queries';
import { AlternativesRequestSchema, validationUtils } from '@/lib/validations';
import {
  createErrorResponse,
  createSuccessResponse,
  getClientIP,
  checkRateLimit,
} from '@/lib/utils/api-helpers';
import { RiskLevel } from '@/types/product';

/**
 * GET /api/products/alternatives
 * Get safer product alternatives, optionally excluding a specific product
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
    const rawExcludeId = searchParams.get('excludeId');
    const rawCategory = searchParams.get('category');
    const rawLimit = searchParams.get('limit');

    // Prepare validation data
    const validationData = {
      excludeId: rawExcludeId ? parseInt(rawExcludeId, 10) : undefined,
      category: rawCategory || undefined,
      limit: rawLimit ? parseInt(rawLimit, 10) : 3,
    };

    // Validate request parameters using Zod schema
    const validationResult = validationUtils.safeValidate(
      AlternativesRequestSchema,
      validationData,
    );

    if (!validationResult.success) {
      return createErrorResponse(validationResult.error, 400);
    }

    const { excludeId, limit } = validationResult.data;

    // Get safer alternatives from database
    const alternatives = await getSaferAlternatives(excludeId, limit);

    // Transform alternatives to include risk level
    const alternativesWithRiskLevel = alternatives.map((alternative) => ({
      ...alternative,
      riskLevel: RiskLevel.SAFE, // All alternatives are approved/notified products, so they're safe
    }));

    // Handle case where no alternatives are found
    if (alternativesWithRiskLevel.length === 0) {
      return createSuccessResponse({
        alternatives: [],
        message: 'No safer alternatives found.',
        total: 0,
      });
    }

    // Return successful response with alternatives
    return createSuccessResponse({
      alternatives: alternativesWithRiskLevel,
      total: alternativesWithRiskLevel.length,
    });
  } catch (error) {
    console.error('Alternatives API error:', error);

    // Handle specific database connection errors
    if (error instanceof Error) {
      if (error.message.includes('connection') || error.message.includes('timeout')) {
        return createErrorResponse(
          {
            error: 'Alternatives unavailable. Please try again later.',
            message: 'Database connection error',
          },
          503,
        );
      }

      if (error.message.includes('syntax') || error.message.includes('query')) {
        return createErrorResponse(
          {
            error: 'Invalid request parameters',
            message: 'Please check your request parameters and try again',
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
