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

import { parse } from "csv-parse";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { db } from "../src/lib/db/index";
import { 
  companies, 
  products, 
  recommendedAlternatives,
  bannedIngredients,
  bannedIngredientMetrics,
  cancelledProductIngredients,
  companyMetrics,
  categoryMetrics
} from "../src/lib/db/schema";
import { eq, sql } from "drizzle-orm";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const NOTIFIED_PRODUCTS_CSV = "../data/cosmetic_notifications.csv";
const CANCELLED_PRODUCTS_CSV = "../data/cosmetic_notifications_cancelled.csv";

// --- Type Definitions for CSV Rows ---
interface NotifiedRow {
  notif_no: string;
  product: string;
  company: string;
  date_notif: string;
}

interface CancelledRow {
  notif_no: string;
  product: string;
  holder: string;
  manufacturer: string;
  substance_detected: string;
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
      .on("data", (row: T) => rows.push(row))
      .on("error", reject)
      .on("end", () => resolve(rows));
  });
}

async function clearTables() {
  console.log("--- Clearing existing data from tables ---");

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

    console.log("Tables cleared successfully.\n");
  } catch (error) {
    console.error("Error clearing tables:", error);
    throw error;
  }
}

async function main() {
  try {
    await clearTables();

    // 1) Load data from CSV files
    console.log("--- Step 1: Loading CSV files ---");
    const notifiedProducts = await loadCSV<NotifiedRow>(NOTIFIED_PRODUCTS_CSV, [
      "notif_no",
      "product",
      "company",
      "date_notif",
    ]);
    const cancelledProducts = await loadCSV<CancelledRow>(
      CANCELLED_PRODUCTS_CSV,
      [
        "notif_no",
        "product",
        "holder",
        "manufacturer",
        "substance_detected",
      ],
    );
    console.log(`Loaded ${notifiedProducts.length} notified products.`);
    console.log(`Loaded ${cancelledProducts.length} cancelled products.\n`);

    // 2) Collect, upsert, and map all unique companies
    console.log("--- Step 2: Processing all companies ---");
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
      const result = await db.insert(companies)
        .values(batch)
        .onConflictDoNothing({ target: companies.name })
        .returning({ id: companies.id, name: companies.name });
      insertedCompanies.push(...result);
    }

    // Get all companies to build the mapping
    const allCompanies = await db.select().from(companies);
    const companyIdMap = new Map(allCompanies.map((c) => [c.name, c.id]));
    console.log(`Processed ${companyIdMap.size} unique companies.\n`);

    // 3) Prepare and insert all products
    console.log("--- Step 3: Preparing and inserting all products ---");
    const productInserts: Array<{
      notifNo: string;
      name: string;
      category: string;
      applicantCompanyId: number;
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
        category: "General", // Default category - can be enhanced later
        applicantCompanyId,
        dateNotified: p.date_notif || "1970-01-01",
        status: "Notified",
        reasonForCancellation: null,
        isVerticallyIntegrated: false,
        recencyScore: "0.5", // Default score - can be computed later
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
        category: "General", // Default category - can be enhanced later
        applicantCompanyId,
        dateNotified: "1970-01-01", // Default date - this info isn't in the cancelled CSV
        status: "Cancelled",
        reasonForCancellation: p.substance_detected,
        isVerticallyIntegrated,
        recencyScore: "0.5", // Default score - can be computed later
      });
    }

    // Insert products in batches to avoid timeout
    let insertedCount = 0;
    
    for (let i = 0; i < productInserts.length; i += batchSize) {
      const batch = productInserts.slice(i, i + batchSize);
      await db.insert(products).values(batch);
      insertedCount += batch.length;
      console.log(`Inserted batch ${Math.ceil((i + 1) / batchSize)} of ${Math.ceil(productInserts.length / batchSize)} (${insertedCount}/${productInserts.length} products)`);
    }
    
    console.log(`Inserted ${insertedCount} products successfully.\n`);

    // 4) Placeholder for Recommended Alternatives
    console.log("--- Step 4: Recommended Alternatives (Placeholder) ---");
    console.log(
      "The 'recommended_alternatives' table should be populated by a separate backend process",
    );
    console.log(
      "that runs a similarity algorithm on product names after this script completes.\n",
    );

    console.log("✅ Done! Data loading process finished successfully.");
  } catch (error) {
    console.error("❌ An error occurred during the loading process:", error);
    throw error;
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error("❌ Script failed:", err);
    process.exit(1);
  });
}