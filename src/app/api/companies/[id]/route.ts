import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { companies, companyMetrics, products } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import {
  createErrorResponse,
  createSuccessResponse,
  getClientIP,
  checkRateLimit,
} from '@/lib/utils/api-helpers';

/**
 * GET /api/companies/[id]
 * Get detailed information about a specific company
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
    const companyId = parseInt(params.id);
    if (isNaN(companyId)) {
      return createErrorResponse(
        {
          error: 'Invalid company ID',
          message: 'Company ID must be a number',
        },
        400,
      );
    }

    // Get company details with metrics
    const companyDetails = await db
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
      .where(eq(companies.id, companyId))
      .limit(1);

    if (companyDetails.length === 0) {
      return createErrorResponse(
        {
          error: 'Company not found',
          message: 'The requested company does not exist',
        },
        404,
      );
    }

    // Get recent products from this company
    const recentProducts = await db
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
      .where(eq(products.applicantCompanyId, companyId))
      .orderBy(desc(products.dateNotified))
      .limit(10);

    return createSuccessResponse({
      company: companyDetails[0],
      recentProducts,
    });
  } catch (error) {
    console.error('Company details API error:', error);
    return createErrorResponse(
      {
        error: 'Failed to fetch company details',
        message: 'Please try again later',
      },
      500,
    );
  }
}
