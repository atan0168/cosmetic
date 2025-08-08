/**
 * parse_and_load.ts
 *
 * Usage:
 *   npm install @supabase/supabase-js csv-parse fs
 *   ts-node parse_and_load.ts
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { parse } from "csv-parse";
import fs from "fs";
import path from "path";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!;

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper to read a CSV into an array of objects
async function loadCSV<T>(filename: string, headers: string[]): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const rows: T[] = [];
    fs.createReadStream(path.resolve(__dirname, filename))
      .pipe(parse({ columns: headers, from_line: 2, trim: true }))
      .on("data", (row: T) => rows.push(row))
      .on("error", reject)
      .on("end", () => resolve(rows));
  });
}

interface ApprovedRow {
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

const COUNTRY = "Malaysia";

async function main() {
  // 1) Load CSVs
  const approved = await loadCSV<ApprovedRow>("cosmetic_notifications.csv", [
    "notif_no",
    "product",
    "company",
    "date_notif",
  ]);
  const cancelled = await loadCSV<CancelledRow>(
    "cosmetic_notifications_cancelled.csv",
    ["notif_no", "product", "holder", "manufacturer", "substance_detected"],
  );

  // 2) Build/upsert manufacturers
  const allMfrNames = new Set<string>([
    ...approved.map((r) => r.company),
    ...cancelled.map((r) => r.manufacturer),
  ]);
  // Prepare array of { name, country: null, total_cancelled_products: 0 }
  const manufacturers = Array.from(allMfrNames).map((name) => ({
    name,
    country: COUNTRY,
    total_cancelled_products: 0,
  }));

  // Upsert manufacturers and get their IDs
  const { data: mfrData, error: mfrError } = await supabase
    .from("manufacturers")
    .upsert(manufacturers, { onConflict: "name" })
    .select("id,name");
  if (mfrError) throw mfrError;
  const mfrIdMap = new Map(mfrData.map((m) => [m.name, m.id]));

  // 3) Insert approved products
  const productInserts = approved.map((r) => ({
    product_name: r.product,
    notification_number: r.notif_no,
    notification_status: "Approved",
    manufacturer_id: mfrIdMap.get(r.company),
    category: null,
    form: null,
    intended_use: null,
    date_notified: r.date_notif,
    cancellation_reason: null,
  }));

  // 4) Insert cancelled products
  const cancelledInserts = cancelled.map((r) => ({
    product_name: r.product,
    notification_number: r.notif_no,
    notification_status: "Cancelled",
    manufacturer_id: mfrIdMap.get(r.manufacturer),
    category: null,
    form: null,
    intended_use: null,
    cancellation_reason: r.substance_detected,
  }));

  const { error: prodError } = await supabase
    .from("products")
    .insert([...productInserts, ...cancelledInserts]);
  if (prodError) throw prodError;

  // 5) Build ingredients from cancelled substances
  const allSubs = Array.from(
    new Set(cancelled.map((r) => r.substance_detected)),
  );
  const ingredientInserts = allSubs.map((name) => ({
    name,
    cas_number: null,
    risk_level: "Unknown",
    description: null,
    total_appearances: cancelled.filter((r) => r.substance_detected === name)
      .length,
  }));
  const { data: ingData, error: ingError } = await supabase
    .from("ingredients")
    .upsert(ingredientInserts, { onConflict: "name" })
    .select("id,name");
  if (ingError) throw ingError;
  const ingIdMap = new Map(ingData.map((i) => [i.name, i.id]));

  // 6) Link products ↔ ingredients
  // First fetch product IDs for cancelled notifications
  const { data: cancelledProds } = await supabase
    .from("products")
    .select("id,notification_number")
    .in(
      "notification_number",
      cancelled.map((r) => r.notif_no),
    );

  if (!cancelledProds || cancelledProds.length === 0) {
    console.warn("No cancelled products found for linking ingredients.");
    return;
  }
  const prodIdMap = new Map(
    cancelledProds.map((p) => [p.notification_number, p.id]),
  );

  const piInserts = cancelled.map((r) => ({
    product_id: prodIdMap.get(r.notif_no),
    ingredient_id: ingIdMap.get(r.substance_detected),
    concentration: null,
    purpose: null,
  }));
  const { error: piError } = await supabase
    .from("product_ingredients")
    .insert(piInserts);
  if (piError) throw piError;

  // 7) Update manufacturers.total_cancelled_products
  for (const [name, id] of mfrIdMap.entries()) {
    const count = cancelled.filter((r) => r.manufacturer === name).length;
    if (count > 0) {
      const { error } = await supabase
        .from("manufacturers")
        .update({ total_cancelled_products: count })
        .eq("id", id);
      if (error) console.warn(`Failed updating mfr ${name}:`, error);
    }
  }

  console.log("Done loading data into Supabase!");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
