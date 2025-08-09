// Test setup file for vitest
import { vi, beforeAll } from 'vitest';

// Set up environment variables for local Docker database
process.env.NODE_ENV = 'development';
process.env.DATABASE_URL = 'postgres://postgres:postgres@db.localtest.me:5432/main';

// Global test setup
let dbInitialized = false;

beforeAll(async () => {
  if (dbInitialized) return;

  const { db } = await import('@/lib/db/index');
  const { sql } = await import('drizzle-orm');

  // Ensure basic connectivity
  await db.execute(sql`SELECT 1 as ok`);

  // Create minimal schema if missing
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS companies (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      notif_no VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(255) NOT NULL,
      applicant_company_id INTEGER NOT NULL REFERENCES companies(id),
      manufacturer_company_id INTEGER REFERENCES companies(id),
      date_notified DATE DEFAULT CURRENT_DATE NOT NULL,
      status VARCHAR(50) NOT NULL,
      reason_for_cancellation TEXT,
      is_vertically_integrated BOOLEAN NOT NULL DEFAULT FALSE,
      recency_score NUMERIC(3,2) NOT NULL DEFAULT 0,
      search_vector tsvector
    )
  `);

  // Seed minimal data if empty
  const productCount = await db.execute(sql`SELECT COUNT(*) as count FROM products`);
  const count = Number(
    (productCount as any)[0]?.count ?? (productCount as any).rows?.[0]?.count ?? 0,
  );

  if (count === 0) {
    // Seed companies
    await db.execute(
      sql`INSERT INTO companies (name) VALUES ('Acme Co') ON CONFLICT (name) DO NOTHING`,
    );
    await db.execute(
      sql`INSERT INTO companies (name) VALUES ('Bravo Labs') ON CONFLICT (name) DO NOTHING`,
    );

    // Get company ids
    const companiesRes = await db.execute(sql`SELECT id, name FROM companies`);
    const acme =
      (companiesRes as any).rows?.find((r: any) => r.name === 'Acme Co') ??
      (companiesRes as any)[0];
    const bravo =
      (companiesRes as any).rows?.find((r: any) => r.name === 'Bravo Labs') ??
      (companiesRes as any)[1] ??
      acme;
    const acmeId = acme.id;
    const bravoId = bravo.id;

    // Seed products (Notified)
    await db.execute(sql`
      INSERT INTO products (notif_no, name, category, applicant_company_id, manufacturer_company_id, status, is_vertically_integrated, recency_score, search_vector)
      VALUES
        ('N1001', 'lipstick rouge', 'Makeup', ${acmeId}, ${acmeId}, 'Notified', TRUE, 0.8, to_tsvector('english', 'lipstick rouge N1001')),
        ('N1002', 'test serum', 'Skincare', ${acmeId}, ${bravoId}, 'Notified', FALSE, 0.6, to_tsvector('english', 'test serum N1002')),
        ('N1003', 'test cream', 'Skincare', ${bravoId}, ${bravoId}, 'Notified', TRUE, 0.5, to_tsvector('english', 'test cream N1003'))
      ON CONFLICT (notif_no) DO NOTHING
    `);

    // Seed a Cancelled product
    await db.execute(sql`
      INSERT INTO products (notif_no, name, category, applicant_company_id, manufacturer_company_id, status, reason_for_cancellation, is_vertically_integrated, recency_score, search_vector)
      VALUES ('N2001', 'cancelled toner', 'Skincare', ${acmeId}, ${acmeId}, 'Cancelled', 'Unsafe ingredient', TRUE, 0.3, to_tsvector('english', 'cancelled toner N2001'))
      ON CONFLICT (notif_no) DO NOTHING
    `);
  }

  dbInitialized = true;
});

beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
});
