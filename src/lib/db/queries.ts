import { db } from "./index";
import { products, companies } from "./schema";
import { eq, ilike, or, sql, asc, and } from "drizzle-orm";
import { ProductSummary, ProductStatus } from "@/types/product";
import { ProductFullTextRow, CountRow } from "@/types/db";

/**
 * Search products using full-text search when available, fallback to ILIKE
 */
export async function searchProducts(
  query: string,
  limit: number = 10,
  offset: number = 0
): Promise<{ products: ProductSummary[]; total: number }> {
  try {
    // First try full-text search if the search_vector column exists
    const fullTextResults = await db.execute(sql`
      SELECT 
        p.id,
        p.notif_no,
        p.name,
        p.category,
        p.status,
        p.reason_for_cancellation,
        ac.id as applicant_company_id,
        ac.name as applicant_company_name,
        mc.id as manufacturer_company_id,
        mc.name as manufacturer_company_name,
        ts_rank(p.search_vector, plainto_tsquery('english', ${query})) as rank
      FROM products p
      LEFT JOIN companies ac ON p.applicant_company_id = ac.id
      LEFT JOIN companies mc ON p.manufacturer_company_id = mc.id
      WHERE p.search_vector @@ plainto_tsquery('english', ${query})
      ORDER BY rank DESC, p.name ASC
      LIMIT ${limit} OFFSET ${offset}
    `);

    const fullTextRows = fullTextResults.rows as unknown as Array<ProductFullTextRow>;

    if (fullTextRows.length > 0) {
      const countResult = await db.execute(sql`
        SELECT COUNT(*) as total
        FROM products p
        WHERE p.search_vector @@ plainto_tsquery('english', ${query})
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
    console.warn(
      "Full-text search failed, falling back to ILIKE search:",
      error
    );
  }

  // Fallback to ILIKE search
  const searchPattern = `%${query}%`;

  const results = await db
    .select({
      id: products.id,
      notifNo: products.notifNo,
      name: products.name,
      category: products.category,
      status: products.status,
      reasonForCancellation: products.reasonForCancellation,
      applicantCompany: {
        id: companies.id,
        name: companies.name,
      },
    })
    .from(products)
    .leftJoin(companies, eq(products.applicantCompanyId, companies.id))
    .where(
      or(
        ilike(products.name, searchPattern),
        ilike(products.notifNo, searchPattern)
      )
    )
    .orderBy(asc(products.name))
    .limit(limit)
    .offset(offset);

  // Get total count for pagination
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(
      or(
        ilike(products.name, searchPattern),
        ilike(products.notifNo, searchPattern)
      )
    );

  const total = Number(countResult[0]?.count ?? 0);

  const searchResults: ProductSummary[] = results.map((row) => ({
    id: row.id,
    notifNo: row.notifNo,
    name: row.name,
    category: row.category,
    status: row.status as ProductStatus,
    reasonForCancellation: row.reasonForCancellation,
    applicantCompany: row.applicantCompany
      ? { id: row.applicantCompany.id, name: row.applicantCompany.name }
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
      applicantCompany: {
        id: companies.id,
        name: companies.name,
      },
    })
    .from(products)
    .leftJoin(companies, eq(products.applicantCompanyId, companies.id))
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
    applicantCompany: row.applicantCompany
      ? { id: row.applicantCompany.id, name: row.applicantCompany.name }
      : undefined,
  };
}

/**
 * Get safer alternatives for a cancelled product
 */
export async function getSaferAlternatives(
  excludeId?: number,
  limit: number = 3
): Promise<ProductSummary[]> {
  const baseWhere = excludeId
    ? and(eq(products.status, "Notified"), sql`${products.id} != ${excludeId}`)
    : eq(products.status, "Notified");

  const results = await db
    .select({
      id: products.id,
      notifNo: products.notifNo,
      name: products.name,
      category: products.category,
      status: products.status,
      reasonForCancellation: products.reasonForCancellation,
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
  status: "Notified" | "Cancelled",
  limit: number = 10,
  offset: number = 0
): Promise<{ products: ProductSummary[]; total: number }> {
  const results = await db
    .select({
      id: products.id,
      notifNo: products.notifNo,
      name: products.name,
      category: products.category,
      status: products.status,
      reasonForCancellation: products.reasonForCancellation,
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
    applicantCompany: row.applicantCompany
      ? { id: row.applicantCompany.id, name: row.applicantCompany.name }
      : undefined,
  }));

  return { products: searchResults, total };
}
