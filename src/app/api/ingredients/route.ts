import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { bannedIngredients, bannedIngredientMetrics } from '@/lib/db/schema';
import { eq, desc, asc, ilike } from 'drizzle-orm';
import {
  createErrorResponse,
  createSuccessResponse,
  getClientIP,
  checkRateLimit,
} from '@/lib/utils/api-helpers';

/**
 * GET /api/ingredients
 * Get list of banned ingredients with their metrics
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

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Define the order column
    const orderColumn =
      sortBy === 'occurrencesCount'
        ? bannedIngredientMetrics.occurrencesCount
        : sortBy === 'riskScore'
          ? bannedIngredientMetrics.riskScore
          : sortBy === 'ewgRating'
            ? bannedIngredients.ewgRating
            : bannedIngredients.name;

    // Build the query with all conditions
    const results = await db
      .select({
        id: bannedIngredients.id,
        name: bannedIngredients.name,
        alternativeNames: bannedIngredients.alternativeNames,
        healthRiskDescription: bannedIngredients.healthRiskDescription,
        regulatoryStatus: bannedIngredients.regulatoryStatus,
        ewgRating: bannedIngredients.ewgRating,
        occurrencesCount: bannedIngredientMetrics.occurrencesCount,
        firstAppearanceDate: bannedIngredientMetrics.firstAppearanceDate,
        lastAppearanceDate: bannedIngredientMetrics.lastAppearanceDate,
        riskScore: bannedIngredientMetrics.riskScore,
      })
      .from(bannedIngredients)
      .leftJoin(
        bannedIngredientMetrics,
        eq(bannedIngredients.id, bannedIngredientMetrics.ingredientId),
      )
      .where(query ? ilike(bannedIngredients.name, `%${query}%`) : undefined)
      .orderBy(sortOrder === 'desc' ? desc(orderColumn) : asc(orderColumn))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalResult = await db
      .select({ count: bannedIngredients.id })
      .from(bannedIngredients)
      .where(query ? ilike(bannedIngredients.name, `%${query}%`) : undefined);

    return createSuccessResponse({
      ingredients: results,
      total: totalResult.length,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < totalResult.length,
      },
    });
  } catch (error) {
    console.error('Ingredients API error:', error);
    return createErrorResponse(
      {
        error: 'Failed to fetch ingredients',
        message: 'Please try again later',
      },
      500,
    );
  }
}
