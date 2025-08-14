import { db } from './index';
import { products, companies, companyMetrics, categoryMetrics } from './schema';
import { eq, ilike, or, sql, asc, and } from 'drizzle-orm';
import { ProductSummary, ProductStatus } from '@/types/product';
import { ProductFullTextRow, CountRow } from '@/types/db';

/**
 * Search products using full-text search when available, fallback to ILIKE
 */
export async function searchProducts(
  query: string,
  limit: number = 10,
  offset: number = 0,
  status?: string,
): Promise<{ products: ProductSummary[]; total: number }> {
  try {
    // First try full-text search if the search_vector column exists
    const statusCondition = status ? sql`AND p.status = ${status}` : sql``;
    const fullTextResults = await db.execute(sql`
      SELECT 
        p.id,
        p.notif_no,
        p.name,
        p.category,
        p.status,
        p.reason_for_cancellation,
        p.recency_score,
        p.date_notified,
        ac.id as applicant_company_id,
        ac.name as applicant_company_name,
        mc.id as manufacturer_company_id,
        mc.name as manufacturer_company_name,
        acm.reputation_score as brand_score,
        mcm.reputation_score as manufacturer_score,
        cm.risk_score as category_score,
        ts_rank(p.search_vector, plainto_tsquery('english', ${query})) as rank
      FROM products p
      LEFT JOIN companies ac ON p.applicant_company_id = ac.id
      LEFT JOIN companies mc ON p.manufacturer_company_id = mc.id
      LEFT JOIN company_metrics acm ON ac.id = acm.company_id
      LEFT JOIN company_metrics mcm ON mc.id = mcm.company_id
      LEFT JOIN category_metrics cm ON p.category = cm.product_category
      WHERE p.search_vector @@ plainto_tsquery('english', ${query}) ${statusCondition}
      ORDER BY rank DESC, p.name ASC
      LIMIT ${limit} OFFSET ${offset}
    `);

    const fullTextRows = fullTextResults.rows as unknown as Array<ProductFullTextRow>;

    if (fullTextRows.length > 0) {
      const countResult = await db.execute(sql`
        SELECT COUNT(*) as total
        FROM products p
        WHERE p.search_vector @@ plainto_tsquery('english', ${query}) ${statusCondition}
      `);

      const totalRows = countResult.rows as unknown as Array<CountRow>;
      const total = Number(totalRows[0]?.total ?? 0);

      const searchResults: ProductSummary[] = fullTextRows.map((row) => ({
        id: row.id,
        notifNo: row.notif_no,
        name: row.name,
        category: row.category,
        status: row.status as ProductStatus,
        reasonForCancellation: row.reason_for_cancellation,
        recencyScore: Number(row.recency_score),
        brandScore: row.brand_score ? Number(row.brand_score) : undefined,
        manufacturerScore: row.manufacturer_score ? Number(row.manufacturer_score) : undefined,
        categoryScore: row.category_score ? Number(row.category_score) : undefined,
        dateNotified: row.date_notified ? new Date(row.date_notified) : undefined,
        applicantCompany:
          row.applicant_company_id && row.applicant_company_name
            ? {
                id: row.applicant_company_id,
                name: row.applicant_company_name,
              }
            : undefined,
        manufacturerCompany:
          row.manufacturer_company_id && row.manufacturer_company_name
            ? {
                id: row.manufacturer_company_id,
                name: row.manufacturer_company_name,
              }
            : undefined,
      }));

      return { products: searchResults, total };
    }
  } catch (error) {
    console.warn('Full-text search failed, falling back to ILIKE search:', error);
  }

  // Fallback to ILIKE search
  const searchPattern = `%${query}%`;

  // Build where conditions
  const searchConditions = or(
    ilike(products.name, searchPattern),
    ilike(products.notifNo, searchPattern),
  );
  const whereConditions = status
    ? and(searchConditions, eq(products.status, status))
    : searchConditions;

  const results = await db
    .select({
      id: products.id,
      notifNo: products.notifNo,
      name: products.name,
      category: products.category,
      status: products.status,
      reasonForCancellation: products.reasonForCancellation,
      recencyScore: products.recencyScore,
      applicantCompany: {
        id: companies.id,
        name: companies.name,
      },
      manufacturerCompany: {
        id: sql<number | null>`mc.id`,
        name: sql<string | null>`mc.name`,
      },
      brandScore: sql<string | null>`acm.reputation_score`,
      manufacturerScore: sql<string | null>`mcm.reputation_score`,
      categoryScore: sql<string | null>`cm.risk_score`,
    })
    .from(products)
    .leftJoin(companies, eq(products.applicantCompanyId, companies.id))
    .leftJoin(sql`companies mc`, sql`products.manufacturer_company_id = mc.id`)
    .leftJoin(sql`company_metrics acm`, sql`companies.id = acm.company_id`)
    .leftJoin(sql`company_metrics mcm`, sql`mc.id = mcm.company_id`)
    .leftJoin(sql`category_metrics cm`, sql`products.category = cm.product_category`)
    .where(whereConditions)
    .orderBy(asc(products.name))
    .limit(limit)
    .offset(offset);

  // Get total count for pagination
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(whereConditions);

  const total = Number(countResult[0]?.count ?? 0);

  const searchResults: ProductSummary[] = results.map((row) => ({
    id: row.id,
    notifNo: row.notifNo,
    name: row.name,
    category: row.category,
    status: row.status as ProductStatus,
    reasonForCancellation: row.reasonForCancellation,
    recencyScore: Number(row.recencyScore),
    brandScore: row.brandScore ? Number(row.brandScore) : undefined,
    manufacturerScore: row.manufacturerScore ? Number(row.manufacturerScore) : undefined,
    categoryScore: row.categoryScore ? Number(row.categoryScore) : undefined,
    applicantCompany: row.applicantCompany
      ? { id: row.applicantCompany.id, name: row.applicantCompany.name }
      : undefined,
    manufacturerCompany:
      row.manufacturerCompany?.id && row.manufacturerCompany?.name
        ? { id: row.manufacturerCompany.id, name: row.manufacturerCompany.name }
        : undefined,
  }));

  return { products: searchResults, total };
}

/**
 * Get product by ID with company information
 */
export async function getProductById(id: number): Promise<ProductSummary | null> {
  const result = await db
    .select({
      id: products.id,
      notifNo: products.notifNo,
      name: products.name,
      category: products.category,
      status: products.status,
      reasonForCancellation: products.reasonForCancellation,
      recencyScore: products.recencyScore,
      applicantCompany: {
        id: companies.id,
        name: companies.name,
      },
      manufacturerCompany: {
        id: sql<number | null>`mc.id`,
        name: sql<string | null>`mc.name`,
      },
      brandScore: sql<string | null>`acm.reputation_score`,
      manufacturerScore: sql<string | null>`mcm.reputation_score`,
      categoryScore: sql<string | null>`cm.risk_score`,
    })
    .from(products)
    .leftJoin(companies, eq(products.applicantCompanyId, companies.id))
    .leftJoin(sql`companies mc`, sql`products.manufacturer_company_id = mc.id`)
    .leftJoin(sql`company_metrics acm`, sql`companies.id = acm.company_id`)
    .leftJoin(sql`company_metrics mcm`, sql`mc.id = mcm.company_id`)
    .leftJoin(sql`category_metrics cm`, sql`products.category = cm.product_category`)
    .where(eq(products.id, id))
    .limit(1);

  if (result.length === 0) return null;

  const row = result[0];
  return {
    id: row.id,
    notifNo: row.notifNo,
    name: row.name,
    category: row.category,
    status: row.status as ProductStatus,
    reasonForCancellation: row.reasonForCancellation,
    recencyScore: Number(row.recencyScore),
    brandScore: row.brandScore ? Number(row.brandScore) : undefined,
    manufacturerScore: row.manufacturerScore ? Number(row.manufacturerScore) : undefined,
    categoryScore: row.categoryScore ? Number(row.categoryScore) : undefined,
    applicantCompany: row.applicantCompany
      ? { id: row.applicantCompany.id, name: row.applicantCompany.name }
      : undefined,
    manufacturerCompany:
      row.manufacturerCompany?.id && row.manufacturerCompany?.name
        ? { id: row.manufacturerCompany.id, name: row.manufacturerCompany.name }
        : undefined,
  };
}

/**
 * Get safer alternatives for a cancelled product
 */
export async function getSaferAlternatives(
  excludeId?: number,
  limit: number = 3,
): Promise<ProductSummary[]> {
  const baseWhere = excludeId
    ? and(eq(products.status, 'Approved'), sql`${products.id} != ${excludeId}`)
    : eq(products.status, 'Approved');

  const results = await db
    .select({
      id: products.id,
      notifNo: products.notifNo,
      name: products.name,
      category: products.category,
      status: products.status,
      reasonForCancellation: products.reasonForCancellation,
      recencyScore: products.recencyScore,
      dateNotified: products.dateNotified,
      applicantCompany: {
        id: companies.id,
        name: companies.name,
      },
    })
    .from(products)
    .leftJoin(companies, eq(products.applicantCompanyId, companies.id))
    .where(baseWhere)
    .orderBy(sql`RANDOM()`)
    .limit(limit);

  return results.map((row) => ({
    id: row.id,
    notifNo: row.notifNo,
    name: row.name,
    category: row.category,
    status: row.status as ProductStatus,
    reasonForCancellation: row.reasonForCancellation,
    recencyScore: Number(row.recencyScore),
    dateNotified: row.dateNotified ? new Date(row.dateNotified) : undefined,
    applicantCompany: row.applicantCompany
      ? { id: row.applicantCompany.id, name: row.applicantCompany.name }
      : undefined,
  }));
}

/**
 * Get all companies
 */
export async function getAllCompanies() {
  return await db.select().from(companies).orderBy(asc(companies.name));
}

/**
 * Get products by status
 */
export async function getProductsByStatus(
  status: 'Approved' | 'Cancelled',
  limit: number = 10,
  offset: number = 0,
): Promise<{ products: ProductSummary[]; total: number }> {
  const results = await db
    .select({
      id: products.id,
      notifNo: products.notifNo,
      name: products.name,
      category: products.category,
      status: products.status,
      reasonForCancellation: products.reasonForCancellation,
      recencyScore: products.recencyScore,
      applicantCompany: {
        id: companies.id,
        name: companies.name,
      },
    })
    .from(products)
    .leftJoin(companies, eq(products.applicantCompanyId, companies.id))
    .where(eq(products.status, status))
    .orderBy(asc(products.name))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(eq(products.status, status));

  const total = countResult[0]?.count || 0;

  const searchResults: ProductSummary[] = results.map((row) => ({
    id: row.id,
    notifNo: row.notifNo,
    name: row.name,
    category: row.category,
    status: row.status as ProductStatus,
    reasonForCancellation: row.reasonForCancellation,
    recencyScore: Number(row.recencyScore),
    applicantCompany: row.applicantCompany
      ? { id: row.applicantCompany.id, name: row.applicantCompany.name }
      : undefined,
  }));

  return { products: searchResults, total };
}
