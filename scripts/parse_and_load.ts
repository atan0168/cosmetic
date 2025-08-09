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

import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { db } from '../src/lib/db/index';
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
import { eq, sql } from 'drizzle-orm';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

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

async function main() {
  try {
    await clearTables();

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

    // 3) Process and insert banned ingredients
    console.log('--- Step 3: Processing banned ingredients ---');
    const ingredientInserts = ingredientInfo
      .filter(ingredient => ingredient['Banned in Malaysia']?.toLowerCase() === 'yes')
      .map(ingredient => ({
        name: ingredient.Ingredient,
        alternativeNames: ingredient['Synonyms/INCI'] || null,
        healthRiskDescription: ingredient['Key Health Risks'] || 'No description available',
        regulatoryStatus: ingredient['Risk Level'] || 'Unknown',
        sourceUrl: ingredient['NPRA Link'] || ingredient['ASEAN Annex II URL'] || null,
      }));

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

    // Get all banned ingredients to build the mapping
    const allBannedIngredients = await db.select().from(bannedIngredients);
    const ingredientIdMap = new Map(allBannedIngredients.map((i) => [i.name.toLowerCase(), i.id]));
    console.log(`Processed ${ingredientIdMap.size} banned ingredients.\n`);

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
        manufacturerCompanyId,
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
    
    // Get all products to build the mapping
    const allProducts = await db.select().from(products);
    const productIdMap = new Map(allProducts.map((p) => [p.notifNo, p.id]));
    
    const ingredientLinks: Array<{
      cancelledProductId: number;
      bannedIngredientId: number;
    }> = [];

    for (const cancelledProduct of cancelledProducts) {
      const productId = productIdMap.get(cancelledProduct.notif_no);
      if (!productId) {
        console.warn(`Product not found for linking: ${cancelledProduct.notif_no}`);
        continue;
      }

      // Try to match the substance_detected with banned ingredients
      const substanceDetected = cancelledProduct.substance_detected.toLowerCase();
      
      // Look for exact match first
      let ingredientId = ingredientIdMap.get(substanceDetected);
      
      // If no exact match, try to find partial matches
      if (!ingredientId) {
        for (const [ingredientName, id] of ingredientIdMap.entries()) {
          if (substanceDetected.includes(ingredientName) || ingredientName.includes(substanceDetected)) {
            ingredientId = id;
            break;
          }
        }
      }

      if (ingredientId) {
        ingredientLinks.push({
          cancelledProductId: productId,
          bannedIngredientId: ingredientId,
        });
      } else {
        console.warn(`No banned ingredient found for substance: ${cancelledProduct.substance_detected}`);
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
    console.log('--- Step 6: Recommended Alternatives (Placeholder) ---');
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
