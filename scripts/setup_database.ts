/**
 * setup_database.ts
 *
 * Complete database setup script that:
 * 1. Applies migrations
 * 2. Sets up full-text search
 * 3. Loads CSV data
 *
 * Usage: npm run db:setup
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { db } from '../src/lib/db/index';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';
import path from 'path';

const execAsync = promisify(exec);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function runMigrations() {
  console.log('🔄 Running database migrations...');
  try {
    const { stdout, stderr } = await execAsync('npm run db:migrate');
    console.log(stdout);
    if (stderr) console.warn(stderr);
    console.log('✅ Migrations completed successfully\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function setupFullTextSearch() {
  console.log('🔍 Setting up full-text search...');

  try {
    // Create GIN index for full-text search
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_products_search 
      ON products USING gin(to_tsvector('english', name || ' ' || notif_no))
    `);

    // Create function to update search vector
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION update_products_search_vector()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.search_vector = to_tsvector('english', NEW.name || ' ' || NEW.notif_no);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    // Create trigger
    await db.execute(sql`
      DROP TRIGGER IF EXISTS products_search_vector_update ON products
    `);

    await db.execute(sql`
      CREATE TRIGGER products_search_vector_update
        BEFORE INSERT OR UPDATE ON products
        FOR EACH ROW EXECUTE FUNCTION update_products_search_vector()
    `);

    // Update existing records
    await db.execute(sql`
      UPDATE products 
      SET search_vector = to_tsvector('english', name || ' ' || notif_no)
      WHERE search_vector IS NULL
    `);

    console.log('✅ Full-text search setup completed\n');
  } catch (error) {
    console.error('❌ Full-text search setup failed:', error);
    throw error;
  }
}

async function loadData() {
  console.log('📊 Loading CSV data...');
  try {
    const { stdout, stderr } = await execAsync('npm run db:load');
    console.log(stdout);
    if (stderr) console.warn(stderr);
    console.log('✅ Data loading completed successfully\n');
  } catch (error) {
    console.error('❌ Data loading failed:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting complete database setup...\n');

  try {
    await runMigrations();
    await setupFullTextSearch();
    await loadData();

    console.log('🎉 Database setup completed successfully!');
    console.log('You can now:');
    console.log("- Run 'npm run db:studio' to browse your data");
    console.log("- Start the development server with 'npm run dev'");
  } catch (error) {
    console.error('💥 Database setup failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
