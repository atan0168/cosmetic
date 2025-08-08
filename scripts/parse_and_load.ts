/**
 * parse_and_load.ts
 *
 * This script loads cosmetic product data from MOH CSV files into a Supabase database,
 * adhering to the finalized database schema.
 *
 * It performs the following actions:
 * 1. Clears existing data from the tables to ensure a clean slate.
 * 2. Loads data from 'cosmetic_notifications.csv' (notified) and 'cosmetic_notifications_cancelled.csv' (cancelled).
 * 3. Populates the 'companies' table with unique notification holders and manufacturers.
 * 4. Populates the 'products' table with all products, setting their status and cancellation reasons.
 * 5. Analyzes cancelled products to populate the 'banned_ingredient_analytics' table with counts and curated risk explanations.
 *
 * Usage:
 *   - Set up your .env file with SUPABASE_URL and SUPABASE_KEY.
 *   - npm install @supabase/supabase-js csv-parse fs-extra ts-node typescript
 *   - Place the CSV files in the same directory.
 *   - ts-node parse_and_load.ts
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { parse } from "csv-parse";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// --- Configuration ---
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    "Supabase URL and Key must be provided in your environment variables.",
  );
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

const NOTIFIED_PRODUCTS_CSV = "../data/cosmetic_notifications.csv";
const CANCELLED_PRODUCTS_CSV = "../data/cosmetic_notifications_cancelled.csv";

// --- Curated Data for Banned Ingredients (Fulfills new AC 2.2.1) ---
// You can manually add more explanations here as you research them.
const curatedRiskExplanations = new Map<string, string>([
  [
    "Mercury",
    "Mercury is a toxic heavy metal that is banned in cosmetics as it can damage the kidneys and nervous system. It can also cause skin rashes, discoloration, and interfere with the development of unborn children.",
  ],
  [
    "Hydroquinone",
    "Hydroquinone can cause skin redness, unwanted discoloration (ochronosis), and increase sensitivity to sunlight. Unsupervised use can increase long-term health risks.",
  ],
  [
    "Tretinoin",
    "Tretinoin is a potent prescription medicine used for acne. It must be used under medical supervision as it can cause severe skin irritation, peeling, and increased sun sensitivity.",
  ],
  [
    "Chloramphenicol",
    "An antibiotic that should only be used under medical supervision due to risks of serious side effects, including bone marrow problems.",
  ],
  [
    "Clotrimazole",
    "An antifungal medicine that requires proper medical diagnosis and supervision.",
  ],
  [
    "Dexamethasone",
    "A potent corticosteroid that can cause skin thinning, stretch marks, and other systemic side effects if used without a prescription.",
  ],
  [
    "Diphenhydramine",
    "An antihistamine that can be absorbed through the skin and cause side effects. Its use in cosmetics is not permitted.",
  ],
  [
    "Ketoconazole",
    "A powerful antifungal drug that requires a prescription due to potential side effects, including liver damage.",
  ],
  [
    "Miconazole",
    "An antifungal medicine intended for treating infections, not for general cosmetic use without medical advice.",
  ],
  [
    "Sulfamethoxazole",
    "An antibiotic whose use needs to be supervised by a healthcare professional.",
  ],
  [
    "Trimethoprim",
    "An antibiotic often paired with sulfamethoxazole, requiring a prescription for safe use.",
  ],
]);

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

  // Delete in the correct order to respect foreign key constraints
  console.log("Clearing 'recommended_alternatives'...");
  const { error: recoError } = await supabase
    .from("recommended_alternatives")
    .delete()
    .neq("id", 0);
  if (recoError) throw recoError;

  console.log("Clearing 'products'...");
  const { error: prodError } = await supabase
    .from("products")
    .delete()
    .neq("id", 0);
  if (prodError) throw prodError;

  console.log("Clearing 'companies'...");
  const { error: compError } = await supabase
    .from("companies")
    .delete()
    .neq("id", 0);
  if (compError) throw compError;

  console.log("Clearing 'banned_ingredient_analytics'...");
  const { error: bannedError } = await supabase
    .from("banned_ingredient_analytics")
    .delete()
    .neq("id", 0);
  if (bannedError) throw bannedError;

  console.log("Tables cleared successfully.\n");
}

async function main() {
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

  const { data: companiesData, error: companyError } = await supabase
    .from("companies")
    .upsert(companyInserts, { onConflict: "name" })
    .select("id,name");

  if (companyError) throw companyError;

  const companyIdMap = new Map(companiesData.map((c) => [c.name, c.id]));
  console.log(`Upserted and mapped ${companyIdMap.size} unique companies.\n`);

  // 3) Prepare and insert all products
  console.log("--- Step 3: Preparing and inserting all products ---");
  const productInserts = [];

  // Notified products
  for (const p of notifiedProducts) {
    productInserts.push({
      notif_no: p.notif_no,
      name: p.product,
      applicant_company_id: companyIdMap.get(p.company)!,
      manufacturer_company_id: null, // This info isn't in the notified CSV
      date_notified: p.date_notif || null,
      status: "Notified",
      reason_for_cancellation: null,
    });
  }

  // Cancelled products
  for (const p of cancelledProducts) {
    productInserts.push({
      notif_no: p.notif_no,
      name: p.product,
      applicant_company_id: companyIdMap.get(p.holder)!,
      manufacturer_company_id: companyIdMap.get(p.manufacturer) || null,
      date_notified: null, // This info isn't in the cancelled CSV
      status: "Cancelled",
      reason_for_cancellation: p.substance_detected,
    });
  }

  // Insert products in batches to avoid timeout
  const batchSize = 1000;
  let insertedCount = 0;
  
  for (let i = 0; i < productInserts.length; i += batchSize) {
    const batch = productInserts.slice(i, i + batchSize);
    const { error: productError } = await supabase
      .from("products")
      .insert(batch);
    if (productError) throw productError;
    insertedCount += batch.length;
    console.log(`Inserted batch ${Math.ceil((i + 1) / batchSize)} of ${Math.ceil(productInserts.length / batchSize)} (${insertedCount}/${productInserts.length} products)`);
  }
  
  console.log(`Inserted ${insertedCount} products successfully.\n`);

  // 4) Analyze banned ingredients and populate analytics table
  // console.log("--- Step 4: Analyzing banned ingredients ---");
  // const ingredientCounts = new Map<string, number>();
  // for (const p of cancelledProducts) {
  //   const substance = p.substance_detected.trim();
  //   if (substance) {
  //     ingredientCounts.set(substance, (ingredientCounts.get(substance) || 0) + 1);
  //   }
  // }
  //
  // const bannedIngredientInserts = Array.from(ingredientCounts.entries()).map(
  //   ([name, count]) => ({
  //     ingredient_name: name,
  //     cancellation_count: count,
  //     risk_explanation:
  //       curatedRiskExplanations.get(name) || "No risk explanation available.",
  //   })
  // );
  //
  // const { error: bannedIngError } = await supabase
  //   .from("banned_ingredient_analytics")
  //   .insert(bannedIngredientInserts);
  // if (bannedIngError) throw bannedIngError;
  // console.log(`Inserted ${bannedIngredientInserts.length} banned ingredient analytics records.\n`);

  // 4) Analyze banned ingredients, enrich with PubChem data, and populate analytics table
  // console.log(
  //   "--- Step 4: Analyzing and enriching banned ingredients via PubChem ---",
  // );
  // const ingredientCounts = new Map<string, number>();
  // for (const p of cancelledProducts) {
  //   const substance = p.substance_detected.trim();
  //   if (substance) {
  //     ingredientCounts.set(
  //       substance,
  //       (ingredientCounts.get(substance) || 0) + 1,
  //     );
  //   }
  // }
  //
  // const bannedIngredientInserts = [];
  // for (const [name, count] of ingredientCounts.entries()) {
  //   console.log(`Processing ingredient: "${name}"...`);
  //   const pubChemData = await fetchPubChemData(name);
  //
  //   bannedIngredientInserts.push({
  //     ingredient_name: name,
  //     cancellation_count: count,
  //     risk_explanation:
  //       curatedRiskExplanations.get(name) ||
  //       "No user-friendly risk explanation available.",
  //     cas_number: pubChemData.cas_number || null,
  //     pubchem_cid: pubChemData.pubchem_cid || null,
  //     scientific_description: pubChemData.scientific_description || null,
  //   });
  //
  //   // Be a polite API user! Wait half a second between requests.
  //   await delay(500);
  // }
  //
  // const { error: bannedIngError } = await supabase
  //   .from("banned_ingredient_analytics")
  //   .insert(bannedIngredientInserts);
  //
  // if (bannedIngError) throw bannedIngError;
  // console.log(
  //   `\nInserted ${bannedIngredientInserts.length} enriched banned ingredient records.\n`,
  // );

  // 5) Placeholder for Recommended Alternatives
  console.log("--- Step 5: Recommended Alternatives (Placeholder) ---");
  console.log(
    "The 'recommended_alternatives' table should be populated by a separate backend process",
  );
  console.log(
    "that runs a similarity algorithm on product names after this script completes.\n",
  );

  console.log("✅ Done! Data loading process finished successfully.");
}

main().catch((err) => {
  console.error("❌ An error occurred during the loading process:", err);
  process.exit(1);
});
