import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import {
  bannedIngredients,
  bannedIngredientMetrics,
  cancelledProductIngredients,
  products,
} from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import {
  createErrorResponse,
  createSuccessResponse,
  getClientIP,
  checkRateLimit,
} from '@/lib/utils/api-helpers';

/**
 * GET /api/ingredients/[id]
 * Get detailed information about a specific banned ingredient
 */
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
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

    const params = await context.params;
    const ingredientId = parseInt(params.id);
    if (isNaN(ingredientId)) {
      return createErrorResponse(
        {
          error: 'Invalid ingredient ID',
          message: 'Ingredient ID must be a number',
        },
        400,
      );
    }

    // Get ingredient details with metrics
    const ingredientDetails = await db
      .select({
        id: bannedIngredients.id,
        name: bannedIngredients.name,
        alternativeNames: bannedIngredients.alternativeNames,
        healthRiskDescription: bannedIngredients.healthRiskDescription,
        regulatoryStatus: bannedIngredients.regulatoryStatus,
        sourceUrl: bannedIngredients.sourceUrl,
        ewgRating: bannedIngredients.ewgRating,
        pubchemCid: bannedIngredients.pubchemCid,
        pubchemUrl: bannedIngredients.pubchemUrl,
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
      .where(eq(bannedIngredients.id, ingredientId))
      .limit(1);

    if (ingredientDetails.length === 0) {
      return createErrorResponse(
        {
          error: 'Ingredient not found',
          message: 'The requested ingredient does not exist',
        },
        404,
      );
    }

    // Get products that contained this ingredient
    const affectedProducts = await db
      .select({
        id: products.id,
        notifNo: products.notifNo,
        name: products.name,
        category: products.category,
        dateNotified: products.dateNotified,
        status: products.status,
        reasonForCancellation: products.reasonForCancellation,
      })
      .from(products)
      .innerJoin(
        cancelledProductIngredients,
        eq(products.id, cancelledProductIngredients.cancelledProductId),
      )
      .where(eq(cancelledProductIngredients.bannedIngredientId, ingredientId))
      .orderBy(desc(products.dateNotified))
      .limit(10);

    return createSuccessResponse({
      ingredient: ingredientDetails[0],
      affectedProducts,
    });
  } catch (error) {
    console.error('Ingredient details API error:', error);
    return createErrorResponse(
      {
        error: 'Failed to fetch ingredient details',
        message: 'Please try again later',
      },
      500,
    );
  }
}
