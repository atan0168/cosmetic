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
import { db } from '../src/lib/db/index';
import {
  products,
  companyMetrics,
  categoryMetrics,
  recommendedAlternatives,
} from '../src/lib/db/schema';
import { sql, isNotNull } from 'drizzle-orm';

const TOP_N_RECOMMENDATIONS = 5;
const BATCH_SIZE = 500;

type Product = typeof products.$inferSelect;

async function updateRecencyScores() {
  console.log('--- Step 1: Calculating and updating recency scores ---');

  // Get all products with notification dates in one query
  const allProductsWithDates = await db
    .select({
      id: products.id,
      category: products.category,
      dateNotified: products.dateNotified,
    })
    .from(products)
    .where(isNotNull(products.dateNotified));

  if (allProductsWithDates.length === 0) {
    console.log('No products with notification dates found.\n');
    return;
  }

  console.log(`📊 Processing ${allProductsWithDates.length} products with notification dates...`);

  // Group by category and calculate min/max dates locally
  const categoryData = new Map<string, {
    products: typeof allProductsWithDates,
    minEpoch: number,
    maxEpoch: number,
    delta: number
  }>();

  for (const product of allProductsWithDates) {
    if (!product.category || !product.dateNotified) continue;
    
    if (!categoryData.has(product.category)) {
      categoryData.set(product.category, {
        products: [],
        minEpoch: Infinity,
        maxEpoch: -Infinity,
        delta: 0
      });
    }
    
    const data = categoryData.get(product.category)!;
    data.products.push(product);
    
    const epoch = new Date(product.dateNotified).getTime() / 1000;
    data.minEpoch = Math.min(data.minEpoch, epoch);
    data.maxEpoch = Math.max(data.maxEpoch, epoch);
  }

  console.log(`📂 Found ${categoryData.size} categories to process`);

  // Calculate deltas
  for (const data of categoryData.values()) {
    data.delta = data.maxEpoch - data.minEpoch;
  }

  // Prepare all updates locally first
  const updates: { id: number; score: string }[] = [];
  
  for (const data of categoryData.values()) {
    if (data.delta === 0) {
      // All products in this category have the same date
      for (const product of data.products) {
        updates.push({ id: product.id, score: '0.5' });
      }
    } else {
      // Calculate scores for each product
      for (const product of data.products) {
        const pEpoch = new Date(product.dateNotified!).getTime() / 1000;
        const score = (pEpoch - data.minEpoch) / data.delta;
        updates.push({ id: product.id, score: score.toFixed(4) });
      }
    }
  }

  console.log(`🧮 Calculated ${updates.length} recency scores locally`);

  // Perform batch updates with progress tracking
  if (updates.length > 0) {
    const UPDATE_BATCH_SIZE = 1000; // Smaller batches for recency updates
    const totalBatches = Math.ceil(updates.length / UPDATE_BATCH_SIZE);
    
    console.log(`📝 Updating recency scores in ${totalBatches} batches of ${UPDATE_BATCH_SIZE}...`);
    
    for (let i = 0; i < updates.length; i += UPDATE_BATCH_SIZE) {
      const batch = updates.slice(i, i + UPDATE_BATCH_SIZE);
      const batchNumber = Math.floor(i / UPDATE_BATCH_SIZE) + 1;
      
      const caseStatements = batch.map(u => `WHEN ${u.id} THEN ${u.score}`).join(' ');
      const ids = batch.map(u => u.id).join(',');
      
      await db.execute(sql`
        UPDATE products 
        SET recency_score = CASE id 
          ${sql.raw(caseStatements)}
        END
        WHERE id IN (${sql.raw(ids)})
      `);
      
      const progress = ((batchNumber / totalBatches) * 100).toFixed(1);
      console.log(`✅ Batch ${batchNumber}/${totalBatches} completed (${batch.length} records, ${progress}% done)`);
    }
    
    console.log(`🎉 Updated recency scores for ${updates.length} products successfully!\n`);
  }
}

async function main() {
  try {
    console.log('--- Starting optimized recommendation generation ---');

    // 1. Update recency scores first (now optimized with bulk update)
    await updateRecencyScores();

    // 2. Clear existing recommendations
    console.log('--- Step 2: Clearing existing recommendations ---');
    await db.delete(recommendedAlternatives);
    console.log('Cleared `recommended_alternatives` table.\n');

    // 3. Fetch all necessary data in parallel (minimize database round trips)
    console.log('--- Step 3: Fetching data for scoring ---');
    const [allProducts, allCompanyMetrics, allCategoryMetrics] = await Promise.all([
      db.select().from(products),
      db.select().from(companyMetrics),
      db.select().from(categoryMetrics),
    ]);

    // 4. Precompute all mappings and groupings locally
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

    // 5. Generate all recommendations locally (no database calls)
    console.log('--- Step 4: Generating and scoring recommendations locally ---');
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
    console.log(`Generated ${allRecommendations.length} total recommendations locally.\n`);

    // 6. Bulk insert all recommendations (single database operation)
    console.log(
      `--- Step 5: Bulk inserting ${allRecommendations.length} recommendations ---`,
    );
    if (allRecommendations.length > 0) {
      for (let i = 0; i < allRecommendations.length; i += BATCH_SIZE) {
        const batch = allRecommendations.slice(i, i + BATCH_SIZE);
        await db.insert(recommendedAlternatives).values(batch);
        console.log(`✅ Inserted batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} records)`);
      }
    }
    console.log('--- 🎉 Optimized recommendation generation completed successfully! ---\n');
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
