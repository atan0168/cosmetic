import { db } from './index';
import { 
  products, 
  companies, 
  recommendedAlternatives, 
  companyMetrics, 
  categoryMetrics,
  bannedIngredients,
  cancelledProductIngredients,
  bannedIngredientMetrics
} from './schema';
import { eq, ilike, or, and, ne, sql } from 'drizzle-orm';

// Search products by name or notification number
export async function searchProducts(query: string, limit: number = 10, offset: number = 0) {
  return await db
    .select({
      id: products.id,
      notifNo: products.notifNo,
      name: products.name,
      category: products.category,
      status: products.status,
      reasonForCancellation: products.reasonForCancellation,
      dateNotified: products.dateNotified,
      isVerticallyIntegrated: products.isVerticallyIntegrated,
      recencyScore: products.recencyScore,
      applicantCompany: {
        id: companies.id,
        name: companies.name,
      },
    })
    .from(products)
    .leftJoin(companies, eq(products.applicantCompanyId, companies.id))
    .where(
      or(
        ilike(products.name, `%${query}%`),
        ilike(products.notifNo, `%${query}%`)
      )
    )
    .limit(limit)
    .offset(offset);
}

// Get product by ID with company information
export async function getProductById(id: number) {
  const result = await db
    .select({
      id: products.id,
      notifNo: products.notifNo,
      name: products.name,
      category: products.category,
      status: products.status,
      reasonForCancellation: products.reasonForCancellation,
      dateNotified: products.dateNotified,
      isVerticallyIntegrated: products.isVerticallyIntegrated,
      recencyScore: products.recencyScore,
      applicantCompany: {
        id: companies.id,
        name: companies.name,
      },
    })
    .from(products)
    .leftJoin(companies, eq(products.applicantCompanyId, companies.id))
    .where(eq(products.id, id))
    .limit(1);

  return result[0] || null;
}

// Get alternative products (approved products excluding the current one)
export async function getAlternativeProducts(excludeId?: number, category?: string, limit: number = 3) {
  let whereConditions = eq(products.status, 'Notified');
  
  if (excludeId) {
    whereConditions = and(whereConditions, ne(products.id, excludeId))!;
  }
  
  if (category) {
    whereConditions = and(whereConditions, eq(products.category, category))!;
  }

  return await db
    .select({
      id: products.id,
      notifNo: products.notifNo,
      name: products.name,
      category: products.category,
      status: products.status,
      recencyScore: products.recencyScore,
      applicantCompany: {
        id: companies.id,
        name: companies.name,
      },
    })
    .from(products)
    .leftJoin(companies, eq(products.applicantCompanyId, companies.id))
    .where(whereConditions)
    .orderBy(sql`${products.recencyScore} DESC`)
    .limit(limit);
}

// Get recommended alternatives for a cancelled product
export async function getRecommendedAlternatives(cancelledProductId: number, limit: number = 5) {
  return await db
    .select({
      id: recommendedAlternatives.id,
      recommendedProduct: {
        id: products.id,
        notifNo: products.notifNo,
        name: products.name,
        category: products.category,
        status: products.status,
      },
      brandScore: recommendedAlternatives.brandScore,
      categoryRiskScore: recommendedAlternatives.categoryRiskScore,
      isVerticallyIntegrated: recommendedAlternatives.isVerticallyIntegrated,
      recencyScore: recommendedAlternatives.recencyScore,
      relevanceScore: recommendedAlternatives.relevanceScore,
    })
    .from(recommendedAlternatives)
    .leftJoin(products, eq(recommendedAlternatives.recommendedProductId, products.id))
    .where(eq(recommendedAlternatives.cancelledProductId, cancelledProductId))
    .orderBy(sql`${recommendedAlternatives.relevanceScore} DESC`)
    .limit(limit);
}

// Get company metrics
export async function getCompanyMetrics(companyId?: number) {
  const query = db.select().from(companyMetrics);
  
  if (companyId) {
    return await query.where(eq(companyMetrics.companyId, companyId)).limit(1);
  }
  
  return await query.orderBy(sql`${companyMetrics.reputationScore} DESC`);
}

// Get category metrics
export async function getCategoryMetrics(category?: string) {
  const query = db.select().from(categoryMetrics);
  
  if (category) {
    return await query.where(eq(categoryMetrics.productCategory, category)).limit(1);
  }
  
  return await query.orderBy(sql`${categoryMetrics.riskScore} ASC`);
}

// Get banned ingredients with optional search
export async function getBannedIngredients(searchQuery?: string, limit: number = 10, offset: number = 0) {
  const query = db.select().from(bannedIngredients);
  
  if (searchQuery) {
    return await query
      .where(
        or(
          ilike(bannedIngredients.name, `%${searchQuery}%`),
          ilike(bannedIngredients.alternativeNames, `%${searchQuery}%`)
        )
      )
      .limit(limit)
      .offset(offset);
  }
  
  return await query
    .orderBy(sql`${bannedIngredients.name} ASC`)
    .limit(limit)
    .offset(offset);
}

// Get banned ingredient by ID
export async function getBannedIngredientById(id: number) {
  const result = await db
    .select()
    .from(bannedIngredients)
    .where(eq(bannedIngredients.id, id))
    .limit(1);
    
  return result[0] || null;
}

// Get banned ingredients for a cancelled product
export async function getBannedIngredientsForProduct(productId: number) {
  return await db
    .select({
      ingredient: bannedIngredients,
      metrics: bannedIngredientMetrics,
    })
    .from(cancelledProductIngredients)
    .leftJoin(bannedIngredients, eq(cancelledProductIngredients.bannedIngredientId, bannedIngredients.id))
    .leftJoin(bannedIngredientMetrics, eq(bannedIngredients.id, bannedIngredientMetrics.ingredientId))
    .where(eq(cancelledProductIngredients.cancelledProductId, productId));
}

// Get products containing a specific banned ingredient
export async function getProductsWithBannedIngredient(ingredientId: number, limit: number = 10) {
  return await db
    .select({
      product: {
        id: products.id,
        notifNo: products.notifNo,
        name: products.name,
        category: products.category,
        status: products.status,
        dateNotified: products.dateNotified,
      },
      applicantCompany: {
        id: companies.id,
        name: companies.name,
      },
    })
    .from(cancelledProductIngredients)
    .leftJoin(products, eq(cancelledProductIngredients.cancelledProductId, products.id))
    .leftJoin(companies, eq(products.applicantCompanyId, companies.id))
    .where(eq(cancelledProductIngredients.bannedIngredientId, ingredientId))
    .limit(limit);
}

// Get banned ingredient metrics with ingredient details
export async function getBannedIngredientMetrics(limit: number = 10, sortBy: 'risk' | 'occurrences' | 'name' = 'risk') {
  let orderBy;
  switch (sortBy) {
    case 'risk':
      orderBy = sql`${bannedIngredientMetrics.riskScore} DESC`;
      break;
    case 'occurrences':
      orderBy = sql`${bannedIngredientMetrics.occurrencesCount} DESC`;
      break;
    case 'name':
      orderBy = sql`${bannedIngredients.name} ASC`;
      break;
    default:
      orderBy = sql`${bannedIngredientMetrics.riskScore} DESC`;
  }

  return await db
    .select({
      ingredient: bannedIngredients,
      metrics: bannedIngredientMetrics,
    })
    .from(bannedIngredientMetrics)
    .leftJoin(bannedIngredients, eq(bannedIngredientMetrics.ingredientId, bannedIngredients.id))
    .orderBy(orderBy)
    .limit(limit);
}