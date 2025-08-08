/**
 * test_database.ts
 * 
 * Simple test script to verify database connection and basic functionality
 * 
 * Usage: npm run db:test
 */

import { db } from "../src/lib/db/index";
import { companies, products } from "../src/lib/db/schema";
import { searchProducts, getSaferAlternatives } from "../src/lib/db/queries";
import { sql } from "drizzle-orm";

async function testDatabaseConnection() {
  console.log("🔌 Testing database connection...");
  
  try {
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log("✅ Database connection successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

async function testTableStructure() {
  console.log("📋 Testing table structure...");
  
  try {
    // Test companies table
    const companyCount = await db.select({ count: sql<number>`count(*)` }).from(companies);
    console.log(`✅ Companies table: ${companyCount[0]?.count || 0} records`);
    
    // Test products table
    const productCount = await db.select({ count: sql<number>`count(*)` }).from(products);
    console.log(`✅ Products table: ${productCount[0]?.count || 0} records`);
    
    return true;
  } catch (error) {
    console.error("❌ Table structure test failed:", error);
    return false;
  }
}

async function testSearchFunctionality() {
  console.log("🔍 Testing search functionality...");
  
  try {
    // Test basic search
    const searchResult = await searchProducts("lipstick", 5);
    console.log(`✅ Search test: Found ${searchResult.products.length} products (total: ${searchResult.total})`);
    
    // Test alternatives
    const alternatives = await getSaferAlternatives(undefined, 3);
    console.log(`✅ Alternatives test: Found ${alternatives.length} safer alternatives`);
    
    return true;
  } catch (error) {
    console.error("❌ Search functionality test failed:", error);
    return false;
  }
}

async function testFullTextSearch() {
  console.log("🔎 Testing full-text search...");
  
  try {
    // Check if full-text search is set up
    const result = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM products 
      WHERE search_vector IS NOT NULL
    `);
    
    const count = Number(result[0]?.count || 0);
    if (count > 0) {
      console.log(`✅ Full-text search: ${count} products have search vectors`);
      
      // Test full-text search query
      const ftResult = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM products 
        WHERE search_vector @@ plainto_tsquery('english', 'cosmetic')
      `);
      
      console.log(`✅ Full-text search query: ${ftResult[0]?.count || 0} results for 'cosmetic'`);
    } else {
      console.log("⚠️  Full-text search vectors not set up yet");
    }
    
    return true;
  } catch (error) {
    console.error("❌ Full-text search test failed:", error);
    return false;
  }
}

async function main() {
  console.log("🧪 Starting database tests...\n");
  
  const tests = [
    testDatabaseConnection,
    testTableStructure,
    testSearchFunctionality,
    testFullTextSearch,
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`Test failed with error:`, error);
      failed++;
    }
    console.log(); // Add spacing between tests
  }
  
  console.log("📊 Test Results:");
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed === 0) {
    console.log("🎉 All tests passed! Database is ready to use.");
  } else {
    console.log("⚠️  Some tests failed. Check the setup instructions.");
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("💥 Test suite failed:", error);
    process.exit(1);
  });
}