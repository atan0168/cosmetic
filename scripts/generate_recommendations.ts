/**
 * generate_recommendations.ts
 *
 * This script populates the 'recommended_alternatives' table by finding and scoring
 * suitable alternatives for cancelled products.
 *
 * It performs the following actions:
 * 1. Clears the existing 'recommended_alternatives' table.
 * 2. Calculates and updates the 'recency_score' for all products.
 * 3. For each cancelled product, finds notified products in the same category.
 * 4. Scores each candidate based on a composite 'relevance_score' from METRICS.MD.
 * 5. Inserts the top N (default 5) recommendations for each cancelled product.
 *
 * Usage:
 *   - Ensure the database is populated by running 'parse_and_load.ts' first.
 *   - npm run tsx scripts/generate_recommendations.ts
 */
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { db } from '../src/lib/db/index';
import {
  products,
  companyMetrics,
  categoryMetrics,
  recommendedAlternatives,
} from '../src/lib/db/schema';
import { sql, eq, inArray, and, isNotNull } from 'drizzle-orm';

const TOP_N_RECOMMENDATIONS = 5;
const BATCH_SIZE = 500;

type Product = typeof products.$inferSelect;
type CompanyMetric = typeof companyMetrics.$inferSelect;
type CategoryMetric = typeof categoryMetrics.$inferSelect;

async function updateRecencyScores() {
  console.log('--- Step 1: Calculating and updating recency scores ---');

  // Get min/max notification dates per category
  const categoryDateRanges = await db
    .select({
      category: products.category,
      minDate: sql<string>`MIN(${products.dateNotified})`.mapWith(String),
      maxDate: sql<string>`MAX(${products.dateNotified})`.mapWith(String),
    })
    .from(products)
    .where(isNotNull(products.dateNotified))
    .groupBy(products.category);

  let updatedCount = 0;
  for (const range of categoryDateRanges) {
    if (!range.category || !range.minDate || !range.maxDate) continue;

    const minEpoch = new Date(range.minDate).getTime() / 1000;
    const maxEpoch = new Date(range.maxDate).getTime() / 1000;
    const delta = maxEpoch - minEpoch;

    // Avoid division by zero for categories with only one date
    if (delta === 0) {
      await db
        .update(products)
        .set({ recencyScore: '0.5' }) // Assign a neutral score
        .where(eq(products.category, range.category));
      continue;
    }

    // This approach updates products category by category.
    // A raw SQL query could do this faster, but this is more readable.
    const productsInCategory = await db
      .select({ id: products.id, dateNotified: products.dateNotified })
      .from(products)
      .where(eq(products.category, range.category));

    for (const p of productsInCategory) {
      if (!p.dateNotified) continue;
      const pEpoch = new Date(p.dateNotified).getTime() / 1000;
      const score = (pEpoch - minEpoch) / delta;
      await db
        .update(products)
        .set({ recencyScore: score.toFixed(4) })
        .where(eq(products.id, p.id));
      updatedCount++;
    }
  }
  console.log(`Updated recency scores for ${updatedCount} products.\n`);
}

async function main() {
  try {
    console.log('--- Starting recommendation generation ---');

    // 1. Update recency scores first
    await updateRecencyScores();

    // 2. Clear existing recommendations
    console.log('--- Step 2: Clearing existing recommendations ---');
    await db.delete(recommendedAlternatives);
    console.log('Cleared `recommended_alternatives` table.\n');

    // 3. Fetch all necessary data
    console.log('--- Step 3: Fetching data for scoring ---');
    const allProducts = await db.select().from(products);
    const allCompanyMetrics = await db.select().from(companyMetrics);
    const allCategoryMetrics = await db.select().from(categoryMetrics);

    const companyMetricsMap = new Map(allCompanyMetrics.map((m) => [m.companyId, m]));
    const categoryMetricsMap = new Map(allCategoryMetrics.map((m) => [m.productCategory, m]));

    const cancelledProducts = allProducts.filter((p) => p.status === 'Cancelled');
    const notifiedProducts = allProducts.filter((p) => p.status === 'Notified');

    const notifiedByCategory = new Map<string, Product[]>();
    for (const p of notifiedProducts) {
      if (!notifiedByCategory.has(p.category)) {
        notifiedByCategory.set(p.category, []);
      }
      notifiedByCategory.get(p.category)!.push(p);
    }
    console.log(`Found ${cancelledProducts.length} cancelled products to process.`);
    console.log(`Found ${notifiedProducts.length} notified products available as alternatives.\n`);

    // 4. Generate recommendations
    console.log('--- Step 4: Generating and scoring recommendations ---');
    const allRecommendations: (typeof recommendedAlternatives.$inferInsert)[] = [];

    for (const cancelledProduct of cancelledProducts) {
      const candidates = notifiedByCategory.get(cancelledProduct.category) || [];
      if (candidates.length === 0) {
        continue;
      }

      const scoredCandidates = candidates
        .map((candidate) => {
          const brandMetrics = companyMetricsMap.get(candidate.applicantCompanyId);
          // Manufacturer can be null
          const manufacturerMetrics = candidate.manufacturerCompanyId
            ? companyMetricsMap.get(candidate.manufacturerCompanyId)
            : null;
          const categoryMetric = categoryMetricsMap.get(candidate.category);

          // Scores default to 0 if metrics are missing
          const brandScore = parseFloat(brandMetrics?.reputationScore || '0');
          const manufacturerScore = parseFloat(manufacturerMetrics?.reputationScore || '0');
          const categoryRiskScore = parseFloat(categoryMetric?.riskScore || '0');
          const recencyScore = parseFloat(candidate.recencyScore || '0');
          const verticalIntegration = candidate.isVerticallyIntegrated ? 1 : 0;

          // Formula from METRICS.MD
          const relevanceScore =
            0.35 * brandScore +
            0.25 * manufacturerScore -
            0.15 * categoryRiskScore +
            0.1 * recencyScore +
            0.15 * verticalIntegration;

          return {
            cancelledProductId: cancelledProduct.id,
            recommendedProductId: candidate.id,
            brandScore: brandScore.toFixed(4),
            manufacturerScore: manufacturerScore.toFixed(4),
            categoryRiskScore: categoryRiskScore.toFixed(4),
            isVerticallyIntegrated: candidate.isVerticallyIntegrated,
            recencyScore: recencyScore.toFixed(4),
            relevanceScore: relevanceScore.toFixed(4),
          };
        })
        .sort((a, b) => parseFloat(b.relevanceScore) - parseFloat(a.relevanceScore));

      const topN = scoredCandidates.slice(0, TOP_N_RECOMMENDATIONS);
      allRecommendations.push(...topN);
    }
    console.log(`Generated ${allRecommendations.length} total recommendations.\n`);

    // 5. Insert into database
    console.log(
      `--- Step 5: Inserting ${allRecommendations.length} recommendations in batches ---`,
    );
    for (let i = 0; i < allRecommendations.length; i += BATCH_SIZE) {
      const batch = allRecommendations.slice(i, i + BATCH_SIZE);
      await db.insert(recommendedAlternatives).values(batch);
      console.log(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}...`);
    }
    console.log('--- ✅ Done! Recommendation generation finished successfully. ---\n');
  } catch (error) {
    console.error('❌ An error occurred during the recommendation generation process:', error);
    throw error;
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('❌ Script failed:', err);
    process.exit(1);
  });
}
