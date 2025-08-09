/**
 * parse_and_load.ts
 *
 * This script loads cosmetic product data from MOH CSV files into a Neon database using Drizzle ORM,
 * adhering to the finalized database schema.
 *
 * It performs the following actions:
 * 1. Clears existing data from the tables to ensure a clean slate.
 * 2. Loads data from 'cosmetic_notifications.csv' (notified) and 'cosmetic_notifications_cancelled.csv' (cancelled).
 * 3. Populates the 'companies' table with unique notification holders and manufacturers.
 * 4. Populates the 'products' table with all products, setting their status and cancellation reasons.
 *
 * Usage:
 *   - Set up your .env.local file with DATABASE_URL pointing to your Neon database.
 *   - npm install
 *   - Place the CSV files in the data/ directory.
 *   - npm run tsx scripts/parse_and_load.ts
 */
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { db } from '../src/lib/db/index';
import { sql, inArray } from 'drizzle-orm';
import {
  companies,
  products,
  recommendedAlternatives,
  bannedIngredients,
  bannedIngredientMetrics,
  cancelledProductIngredients,
  companyMetrics,
  categoryMetrics,
} from '../src/lib/db/schema';

const NOTIFIED_PRODUCTS_CSV = '../data/cosmetic_notifications.csv';
const CANCELLED_PRODUCTS_CSV = '../data/cosmetic_notifications_cancelled.csv';
const INGREDIENT_INFO_CSV = '../data/ingredient-information.csv';

// --- Type Definitions for CSV Rows ---
interface NotifiedRow {
  custom_id: string;
  notif_no: string;
  product: string;
  company: string;
  date_notif: string;
  product_category: string;
}

interface CancelledRow {
  notif_no: string;
  product: string;
  holder: string;
  manufacturer: string;
  substance_detected: string;
  product_category: string;
}

interface IngredientRow {
  Ingredient: string;
  'Synonyms/INCI': string;
  'EWG Rating': string;
  'Risk Level': string;
  'Banned in Malaysia': string;
  'Banned Country Codes': string;
  'Basis (Malaysia/ASEAN)': string;
  'Primary Cosmetic Use': string;
  'Key Health Risks': string;
  'Source Notes': string;
  'PubChem CID': string;
  'PubChem URL': string;
  'Annex III / Restrictions': string;
  'NPRA Link': string;
  'ASEAN Annex II URL': string;
  'ASEAN Annex III URL': string;
  'Regulation Links': string;
}

// --- Helper Functions ---
async function loadCSV<T>(filename: string, headers: string[]): Promise<T[]> {
  const filePath = path.resolve(__dirname, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return new Promise((resolve, reject) => {
    const rows: T[] = [];
    fs.createReadStream(filePath)
      .pipe(
        parse({
          columns: headers,
          from_line: 2,
          trim: true,
          skip_empty_lines: true,
        }),
      )
      .on('data', (row: T) => rows.push(row))
      .on('error', reject)
      .on('end', () => resolve(rows));
  });
}

async function clearTables() {
  console.log('--- Clearing existing data from tables ---');

  try {
    // Delete in the correct order to respect foreign key constraints
    console.log("Clearing 'recommended_alternatives'...");
    await db.delete(recommendedAlternatives);

    console.log("Clearing 'cancelled_product_ingredients'...");
    await db.delete(cancelledProductIngredients);

    console.log("Clearing 'banned_ingredient_metrics'...");
    await db.delete(bannedIngredientMetrics);

    console.log("Clearing 'banned_ingredients'...");
    await db.delete(bannedIngredients);

    console.log("Clearing 'company_metrics'...");
    await db.delete(companyMetrics);

    console.log("Clearing 'category_metrics'...");
    await db.delete(categoryMetrics);

    console.log("Clearing 'products'...");
    await db.delete(products);

    console.log("Clearing 'companies'...");
    await db.delete(companies);

    console.log('Tables cleared successfully.\n');
  } catch (error) {
    console.error('Error clearing tables:', error);
    throw error;
  }
}

async function ensureSchemaUpgrades() {
  // Add new columns to banned_ingredients if they don't exist
  await db.execute(sql`
    ALTER TABLE banned_ingredients
      ADD COLUMN IF NOT EXISTS ewg_rating integer,
      ADD COLUMN IF NOT EXISTS pubchem_cid varchar(50),
      ADD COLUMN IF NOT EXISTS pubchem_url varchar(500);
  `);
}

function computeRegulatoryStatus(row: IngredientRow): string {
  const banned = (row['Banned in Malaysia'] || '').trim().toLowerCase();
  if (banned === 'yes') return 'Prohibited';
  return 'Restricted';
}

function normalizeIngredientAlias(alias: string): string {
  // Normalize common typos and trim/case-fold
  const a = alias.trim().toLowerCase();
  if (a === 'tretnon' || a === 'tretnoin' || a === 'tretinon') return 'tretinoin';
  if (a === 'hq') return 'hydroquinone';
  return a;
}

async function main() {
  try {
    await clearTables();
    await ensureSchemaUpgrades();

    // 1) Load data from CSV files
    console.log('--- Step 1: Loading CSV files ---');
    const notifiedProducts = await loadCSV<NotifiedRow>(NOTIFIED_PRODUCTS_CSV, [
      'custom_id',
      'notif_no',
      'product',
      'company',
      'date_notif',
      'product_category',
    ]);
    const cancelledProducts = await loadCSV<CancelledRow>(CANCELLED_PRODUCTS_CSV, [
      'notif_no',
      'product',
      'holder',
      'manufacturer',
      'substance_detected',
      'product_category',
    ]);
    const ingredientInfo = await loadCSV<IngredientRow>(INGREDIENT_INFO_CSV, [
      'Ingredient',
      'Synonyms/INCI',
      'EWG Rating',
      'Risk Level',
      'Banned in Malaysia',
      'Banned Country Codes',
      'Basis (Malaysia/ASEAN)',
      'Primary Cosmetic Use',
      'Key Health Risks',
      'Source Notes',
      'PubChem CID',
      'PubChem URL',
      'Annex III / Restrictions',
      'NPRA Link',
      'ASEAN Annex II URL',
      'ASEAN Annex III URL',
      'Regulation Links',
    ]);
    console.log(`Loaded ${notifiedProducts.length} notified products.`);
    console.log(`Loaded ${cancelledProducts.length} cancelled products.`);
    console.log(`Loaded ${ingredientInfo.length} ingredient records.\n`);

    // 2) Collect, upsert, and map all unique companies
    console.log('--- Step 2: Processing all companies ---');
    const allCompanyNames = new Set<string>();
    notifiedProducts.forEach((p) => allCompanyNames.add(p.company));
    cancelledProducts.forEach((p) => {
      allCompanyNames.add(p.holder);
      if (p.manufacturer) {
        allCompanyNames.add(p.manufacturer);
      }
    });

    const companyInserts = Array.from(allCompanyNames).map((name) => ({ name }));

    // Insert companies in batches
    const batchSize = 1000;
    const insertedCompanies: { id: number; name: string }[] = [];

    for (let i = 0; i < companyInserts.length; i += batchSize) {
      const batch = companyInserts.slice(i, i + batchSize);
      const result = await db
        .insert(companies)
        .values(batch)
        .onConflictDoNothing({ target: companies.name })
        .returning({ id: companies.id, name: companies.name });
      insertedCompanies.push(...result);
    }

    // Get all companies to build the mapping
    const allCompanies = await db.select().from(companies);
    const companyIdMap = new Map(allCompanies.map((c) => [c.name, c.id]));
    console.log(`Processed ${companyIdMap.size} unique companies.\n`);

    // 3) Process and insert ingredient metadata (prohibited/restricted/permitted)
    console.log('--- Step 3: Processing ingredient metadata ---');
    const ingredientInserts = ingredientInfo.map((ingredient) => {
      const ewgRaw = (ingredient['EWG Rating'] || '').trim();
      const ewgRating = ewgRaw ? Number.parseInt(ewgRaw, 10) : null;
      const pubchemCid = (ingredient['PubChem CID'] || '').trim() || null;
      const pubchemUrl = (ingredient['PubChem URL'] || '').trim() || null;
      return {
        name: ingredient.Ingredient,
        alternativeNames: ingredient['Synonyms/INCI'] || null,
        healthRiskDescription: ingredient['Key Health Risks'] || 'No description available',
        regulatoryStatus: computeRegulatoryStatus(ingredient),
        sourceUrl:
          ingredient['NPRA Link'] ||
          ingredient['ASEAN Annex II URL'] ||
          ingredient['ASEAN Annex III URL'] ||
          null,
        ewgRating: Number.isFinite(ewgRating) ? (ewgRating as unknown as number | null) : null,
        pubchemCid,
        pubchemUrl,
      };
    });

    // Insert banned ingredients in batches
    const insertedIngredients: { id: number; name: string }[] = [];
    for (let i = 0; i < ingredientInserts.length; i += batchSize) {
      const batch = ingredientInserts.slice(i, i + batchSize);
      const result = await db
        .insert(bannedIngredients)
        .values(batch)
        .onConflictDoNothing({ target: bannedIngredients.name })
        .returning({ id: bannedIngredients.id, name: bannedIngredients.name });
      insertedIngredients.push(...result);
    }

    // Get all ingredients to build the mapping, including synonyms
    const allIngredients = await db.select().from(bannedIngredients);
    const ingredientIdMap = new Map<string, number>();
    for (const i of allIngredients) {
      ingredientIdMap.set(i.name.toLowerCase(), i.id);
      if (i.alternativeNames) {
        const aliases = i.alternativeNames
          .split(/[;,]/)
          .map((s) => s.trim())
          .filter(Boolean);
        for (const alias of aliases) {
          ingredientIdMap.set(alias.toLowerCase(), i.id);
        }
      }
    }
    console.log(`Processed ${ingredientIdMap.size} ingredient aliases for matching.\n`);

    // 4) Prepare and insert all products
    console.log('--- Step 4: Preparing and inserting all products ---');
    const productInserts: Array<{
      notifNo: string;
      name: string;
      category: string;
      applicantCompanyId: number;
      manufacturerCompanyId: number | null;
      dateNotified: string;
      status: string;
      reasonForCancellation: string | null;
      isVerticallyIntegrated: boolean;
      recencyScore: string;
    }> = [];

    // Notified products
    for (const p of notifiedProducts) {
      const applicantCompanyId = companyIdMap.get(p.company);
      if (!applicantCompanyId) {
        console.warn(`Company not found: ${p.company}`);
        continue;
      }

      productInserts.push({
        notifNo: p.notif_no,
        name: p.product,
        category: p.product_category || 'General',
        applicantCompanyId,
        manufacturerCompanyId: null, // Not provided in notified products CSV
        dateNotified: p.date_notif || '1970-01-01',
        status: 'Notified',
        reasonForCancellation: null,
        isVerticallyIntegrated: false,
        recencyScore: '0.5', // Default score - can be computed later
      });
    }

    // Cancelled products
    for (const p of cancelledProducts) {
      const applicantCompanyId = companyIdMap.get(p.holder);
      if (!applicantCompanyId) {
        console.warn(`Company not found: ${p.holder}`);
        continue;
      }

      const manufacturerCompanyId = p.manufacturer ? companyIdMap.get(p.manufacturer) : null;
      const isVerticallyIntegrated = manufacturerCompanyId === applicantCompanyId;

      productInserts.push({
        notifNo: p.notif_no,
        name: p.product,
        category: p.product_category || 'General',
        applicantCompanyId,
        manufacturerCompanyId: manufacturerCompanyId || null,
        dateNotified: '1970-01-01', // Default date - this info isn't in the cancelled CSV
        status: 'Cancelled',
        reasonForCancellation: p.substance_detected,
        isVerticallyIntegrated,
        recencyScore: '0.5', // Default score - can be computed later
      });
    }

    // Insert products in batches to avoid timeout
    let insertedCount = 0;

    for (let i = 0; i < productInserts.length; i += batchSize) {
      const batch = productInserts.slice(i, i + batchSize);
      await db.insert(products).values(batch);
      insertedCount += batch.length;
      console.log(
        `Inserted batch ${Math.ceil((i + 1) / batchSize)} of ${Math.ceil(productInserts.length / batchSize)} (${insertedCount}/${productInserts.length} products)`,
      );
    }

    console.log(`Inserted ${insertedCount} products successfully.\n`);

    // 5) Link cancelled products with banned ingredients
    console.log('--- Step 5: Linking cancelled products with banned ingredients ---');

    // Build mapping only for cancelled products to avoid large responses
    const cancelledNotifNos = Array.from(new Set(cancelledProducts.map((cp) => cp.notif_no)));
    const cancelledProductRows = await db
      .select({ id: products.id, notifNo: products.notifNo })
      .from(products)
      .where(inArray(products.notifNo, cancelledNotifNos));
    const productIdMap = new Map(cancelledProductRows.map((p) => [p.notifNo, p.id]));

    const ingredientLinks: Array<{
      cancelledProductId: number;
      bannedIngredientId: number;
    }> = [];

    const linkPairs = new Set<string>();
    for (const cancelledProduct of cancelledProducts) {
      const productId = productIdMap.get(cancelledProduct.notif_no);
      if (!productId) {
        console.warn(`Product not found for linking: ${cancelledProduct.notif_no}`);
        continue;
      }

      // Split multi-ingredient strings and normalize tokens
      const tokens = (cancelledProduct.substance_detected || '')
        .split(/[;,]/)
        .map((t) => normalizeIngredientAlias(t))
        .filter(Boolean);

      for (const token of tokens) {
        // Exact/alias match
        let ingredientId = ingredientIdMap.get(token);
        if (!ingredientId) {
          // Fallback to partial match
          for (const [ingredientName, id] of ingredientIdMap.entries()) {
            if (token.includes(ingredientName) || ingredientName.includes(token)) {
              ingredientId = id;
              break;
            }
          }
        }
        if (ingredientId) {
          const k = `${productId}:${ingredientId}`;
          if (!linkPairs.has(k)) {
            linkPairs.add(k);
            ingredientLinks.push({
              cancelledProductId: productId,
              bannedIngredientId: ingredientId,
            });
          }
        } else {
          console.warn(
            `No ingredient metadata found for substance token: '${token}' (raw: ${cancelledProduct.substance_detected})`,
          );
        }
      }
    }

    // Insert ingredient links in batches
    if (ingredientLinks.length > 0) {
      for (let i = 0; i < ingredientLinks.length; i += batchSize) {
        const batch = ingredientLinks.slice(i, i + batchSize);
        await db.insert(cancelledProductIngredients).values(batch);
      }
      console.log(`Linked ${ingredientLinks.length} cancelled products with banned ingredients.\n`);
    } else {
      console.log('No ingredient links created.\n');
    }

    // 6) Placeholder for Recommended Alternatives
    // 6) Compute and insert metrics tables
    console.log('--- Step 6: Computing metrics ---');
    // 6a) category_metrics
    await db.execute(sql`
      INSERT INTO category_metrics (product_category, total_notifs, cancelled_count, risk_score)
      SELECT
        category AS product_category,
        COUNT(*) AS total_notifs,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled_count,
        COALESCE(SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END)::float
                 / NULLIF(COUNT(*), 0), 0)::numeric(3,2) AS risk_score
      FROM products
      GROUP BY category;
    `);

    // 6b) company_metrics
    const companyAgg = await db.execute(sql`
      SELECT
        c.id AS company_id,
        COUNT(p.id)::int AS total_notifs,
        MIN(p.date_notified) AS first_date,
        SUM(CASE WHEN p.status = 'Cancelled' THEN 1 ELSE 0 END)::int AS cancelled_count
      FROM products p
      JOIN companies c ON p.applicant_company_id = c.id
      GROUP BY c.id;
    `);
    type CompanyAgg = {
      company_id: number;
      total_notifs: number;
      first_date: string;
      cancelled_count: number;
    };
    const compRows = companyAgg.rows as unknown as CompanyAgg[];
    if (compRows.length > 0) {
      const maxTotal = Math.max(...compRows.map((r) => r.total_notifs));
      // tenure in years since earliest notification
      const today = new Date();
      const years = compRows.map((r) => {
        const first = new Date(r.first_date);
        return (today.getTime() - first.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      });
      const maxYears = Math.max(...years, 0);
      const toInsert = compRows.map((r, idx) => {
        const notifScore = maxTotal > 0 ? Math.log(1 + r.total_notifs) / Math.log(1 + maxTotal) : 0;
        const tenureYears = years[idx] || 0;
        const tenureScore = maxYears > 0 ? Math.min(1, tenureYears / maxYears) : 0;
        const cleanScore = r.total_notifs > 0 ? 1 - r.cancelled_count / r.total_notifs : 0;
        const reputation = 0.5 * notifScore + 0.3 * tenureScore + 0.2 * cleanScore;
        const firstDate = new Date(r.first_date);
        const yyyy = firstDate.getFullYear();
        const mm = String(firstDate.getMonth() + 1).padStart(2, '0');
        const dd = String(firstDate.getDate()).padStart(2, '0');
        return {
          companyId: r.company_id,
          totalNotifs: r.total_notifs,
          firstNotifiedDate: `${yyyy}-${mm}-${dd}`,
          cancelledCount: r.cancelled_count,
          reputationScore: reputation.toFixed(2),
        };
      });

      // Insert in batches
      for (let i = 0; i < toInsert.length; i += batchSize) {
        const batch = toInsert.slice(i, i + batchSize);
        await db.insert(companyMetrics).values(batch);
      }
    }

    // 6c) banned_ingredient_metrics
    const ingredientAgg = await db.execute(sql`
      SELECT
        b.id AS ingredient_id,
        COALESCE(COUNT(cpi.cancelled_product_id), 0)::int AS occurrences_count,
        MIN(p.date_notified) AS first_date,
        MAX(p.date_notified) AS last_date
      FROM banned_ingredients b
      LEFT JOIN cancelled_product_ingredients cpi ON cpi.banned_ingredient_id = b.id
      LEFT JOIN products p ON p.id = cpi.cancelled_product_id
      GROUP BY b.id;
    `);
    type IngredientAgg = {
      ingredient_id: number;
      occurrences_count: number;
      first_date: string | null;
      last_date: string | null;
    };
    const ingRows = ingredientAgg.rows as unknown as IngredientAgg[];
    if (ingRows.length > 0) {
      const maxOcc = Math.max(...ingRows.map((r) => r.occurrences_count));
      const todayIso = new Date().toISOString().slice(0, 10);
      const toInsert = ingRows.map((r) => ({
        ingredientId: r.ingredient_id,
        occurrencesCount: r.occurrences_count,
        firstAppearanceDate: (r.first_date || todayIso) as string,
        lastAppearanceDate: (r.last_date || todayIso) as string,
        riskScore: maxOcc > 0 ? (r.occurrences_count / maxOcc).toFixed(2) : '0.00',
      }));
      for (let i = 0; i < toInsert.length; i += batchSize) {
        const batch = toInsert.slice(i, i + batchSize);
        await db.insert(bannedIngredientMetrics).values(batch);
      }
    }

    console.log('Metrics computed and inserted.\n');

    console.log('--- Step 7: Recommended Alternatives (Placeholder) ---');
    console.log(
      "The 'recommended_alternatives' table should be populated by a separate backend process",
    );
    console.log('that runs a similarity algorithm on product names after this script completes.\n');

    console.log('✅ Done! Data loading process finished successfully.');
  } catch (error) {
    console.error('❌ An error occurred during the loading process:', error);
    throw error;
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('❌ Script failed:', err);
    process.exit(1);
  });
}
