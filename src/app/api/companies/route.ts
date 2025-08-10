import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { companies, companyMetrics } from '@/lib/db/schema';
import { eq, desc, asc, ilike } from 'drizzle-orm';
import {
  createErrorResponse,
  createSuccessResponse,
  getClientIP,
  checkRateLimit,
} from '@/lib/utils/api-helpers';

/**
 * GET /api/companies
 * Get list of companies with their metrics
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
      sortBy === 'totalNotifs'
        ? companyMetrics.totalNotifs
        : sortBy === 'reputationScore'
          ? companyMetrics.reputationScore
          : sortBy === 'cancelledCount'
            ? companyMetrics.cancelledCount
            : companies.name;

    // Build the query with all conditions
    const results = await db
      .select({
        id: companies.id,
        name: companies.name,
        totalNotifs: companyMetrics.totalNotifs,
        firstNotifiedDate: companyMetrics.firstNotifiedDate,
        cancelledCount: companyMetrics.cancelledCount,
        reputationScore: companyMetrics.reputationScore,
      })
      .from(companies)
      .leftJoin(companyMetrics, eq(companies.id, companyMetrics.companyId))
      .where(query ? ilike(companies.name, `%${query}%`) : undefined)
      .orderBy(sortOrder === 'desc' ? desc(orderColumn) : asc(orderColumn))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalResult = await db
      .select({ count: companies.id })
      .from(companies)
      .where(query ? ilike(companies.name, `%${query}%`) : undefined);

    return createSuccessResponse({
      companies: results,
      total: totalResult.length,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < totalResult.length,
      },
    });
  } catch (error) {
    console.error('Companies API error:', error);
    return createErrorResponse(
      {
        error: 'Failed to fetch companies',
        message: 'Please try again later',
      },
      500,
    );
  }
}
